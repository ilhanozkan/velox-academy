const { UniqueViolationError } = require("objection");

const UserSandbox = require("../models/UserSandbox");
const Training = require("../models/Training");
const { notFound } = require("../utils/httpError");
const { activeProvider, providerFor } = require("./sandboxProviders");

// Provisioning runs in the background; tests (and graceful shutdown) can wait
// for it through waitForProvisioning().
const inflight = new Map();

const ACTIVE_STATUSES = ["creating", "running"];

const friendlyError = (error) => {
  const message = error?.message || "";

  if (message.includes("was not found"))
    return "Eğitim için sanal makine şablonu bulunamadı. Lütfen yöneticinize bildirin.";
  if (message.toLowerCase().includes("permission") || message.includes("credentials"))
    return "Sanal makine oluşturma yetkisi yok. Lütfen yöneticinize bildirin.";
  if (message.toLowerCase().includes("quota"))
    return "Bulut kaynak kotası doldu. Lütfen biraz sonra tekrar deneyin.";
  return "Sanal makine oluşturulamadı. Lütfen tekrar deneyin.";
};

class UserSandboxService {
  /**
   * API representation of a sandbox. The access token is a credential for the
   * VM, so it is only included for its owner.
   */
  static serialize(sandbox, { includeToken = false } = {}) {
    if (!sandbox) return null;

    const ready = sandbox.vm_status === "running";

    return {
      id: sandbox.id,
      trainingId: sandbox.training_id,
      trainingName: sandbox.training?.name,
      provider: sandbox.provider,
      vmInstanceName: sandbox.vm_instance_name,
      vmExternalIp: sandbox.vm_external_ip,
      vmStatus: sandbox.vm_status,
      errorMessage: sandbox.error_message,
      accessUrl: ready ? providerFor(sandbox).accessUrl(sandbox) : null,
      ...(includeToken && { accessToken: ready ? sandbox.access_token : null }),
      createdAt: sandbox.created_at,
      updatedAt: sandbox.updated_at,
    };
  }

  static async getUserSandbox(userId, trainingId) {
    return await UserSandbox.query()
      .where({ user_id: userId, training_id: trainingId })
      .withGraphFetched("training")
      .first();
  }

  static async getUserSandboxes(userId) {
    return await UserSandbox.query()
      .where("user_id", userId)
      .withGraphFetched("training")
      .orderBy("updated_at", "desc");
  }

  static async findOwned(sandboxId, user) {
    const sandbox = await UserSandbox.query().findById(sandboxId);

    // Someone else's sandbox looks exactly like a missing one.
    if (!sandbox || (sandbox.user_id !== user.id && !user.isAdmin))
      throw notFound("Sandbox bulunamadı");
    return sandbox;
  }

  /**
   * Returns the learner's sandbox for a training, starting provisioning if it
   * does not exist, was deleted or failed. Returns immediately; the sandbox is
   * "creating" until the background provisioning finishes.
   */
  static async ensureSandbox(userId, trainingId, { recreate = false } = {}) {
    const existing = await UserSandbox.query()
      .where({ user_id: userId, training_id: trainingId })
      .first();

    if (existing?.vm_status === "creating") return existing;
    if (existing?.vm_status === "running" && !recreate) return existing;

    const provider = activeProvider();

    // Recreating a running sandbox: release the old VM first.
    if (existing?.vm_status === "running") await providerFor(existing).destroy(existing);

    const fields = {
      provider: provider.name,
      vm_instance_name: provider.instanceName(userId, trainingId),
      vm_status: "creating",
      vm_external_ip: null,
      vm_zone: null,
      project_id: null,
      access_token: provider.createAccessToken(),
      error_message: null,
    };

    let sandbox;
    if (existing) {
      sandbox = await UserSandbox.query().patchAndFetchById(existing.id, fields);
    } else {
      try {
        sandbox = await UserSandbox.query().insert({
          user_id: userId,
          training_id: trainingId,
          ...fields,
        });
      } catch (error) {
        // A concurrent request created it first (unique user_id + training_id).
        if (!(error instanceof UniqueViolationError)) throw error;
        return await UserSandbox.query()
          .where({ user_id: userId, training_id: trainingId })
          .first();
      }
    }

    this.provision(sandbox.id);
    return sandbox;
  }

  /** Creates the VM for a "creating" sandbox and records the outcome. */
  static provision(sandboxId) {
    const job = (async () => {
      const sandbox = await UserSandbox.query().findById(sandboxId);
      if (!sandbox) return;

      try {
        const training = await Training.query().findById(sandbox.training_id);
        const result = await providerFor(sandbox).create(sandbox, training);

        await UserSandbox.query().patchAndFetchById(sandboxId, {
          ...result,
          vm_status: "running",
          error_message: null,
        });
      } catch (error) {
        console.error(`Sandbox ${sandboxId} provisioning failed:`, error);
        await UserSandbox.query()
          .patchAndFetchById(sandboxId, { vm_status: "error", error_message: friendlyError(error) })
          .catch((patchError) => console.error(patchError));
      }
    })().finally(() => inflight.delete(sandboxId));

    inflight.set(sandboxId, job);
    return job;
  }

  static async waitForProvisioning() {
    await Promise.allSettled([...inflight.values()]);
  }

  /** Deletes the VM and marks the sandbox deleted; the row keeps the history. */
  static async deleteSandbox(sandbox) {
    if (sandbox.vm_status !== "deleted") {
      try {
        await providerFor(sandbox).destroy(sandbox);
      } catch (error) {
        console.error("Error deleting user sandbox:", error);
        throw new Error(`Failed to delete sandbox: ${error.message}`);
      }
    }

    return await UserSandbox.query().patchAndFetchById(sandbox.id, {
      vm_status: "deleted",
      vm_external_ip: null,
      error_message: null,
    });
  }

  static async deleteUserSandbox(userId, trainingId) {
    const sandbox = await UserSandbox.query()
      .where({ user_id: userId, training_id: trainingId })
      .first();

    if (!sandbox) throw notFound("Sandbox bulunamadı");

    const deleted = await this.deleteSandbox(sandbox);
    return { status: deleted.vm_status, sandboxId: deleted.id };
  }

  /**
   * Best-effort VM cleanup before rows are removed by ON DELETE CASCADE
   * (deleting a user or a training). Failures are logged, not thrown, so an
   * unreachable cloud API does not block the deletion.
   */
  static async releaseAll(where) {
    const sandboxes = await UserSandbox.query()
      .where(where)
      .whereNot("vm_status", "deleted");

    await Promise.all(
      sandboxes.map((sandbox) =>
        providerFor(sandbox)
          .destroy(sandbox)
          .catch((error) =>
            console.error(`Could not delete VM ${sandbox.vm_instance_name}:`, error.message)
          )
      )
    );
  }

  static async refreshSandboxIP(sandbox) {
    try {
      const fields = await providerFor(sandbox).refresh(sandbox);
      return await UserSandbox.query().patchAndFetchById(sandbox.id, fields);
    } catch (error) {
      console.error("Error refreshing sandbox IP:", error);
      throw new Error(`Failed to refresh sandbox IP: ${error.message}`);
    }
  }

  /**
   * Provisioning runs inside the API process, so sandboxes still "creating"
   * when the server starts were interrupted by a restart. Mark them failed so
   * learners see a retry button instead of waiting forever.
   */
  static async failInterruptedProvisioning() {
    return await UserSandbox.query().where("vm_status", "creating").patch({
      vm_status: "error",
      error_message:
        "Sunucu yeniden başlatıldığı için kurulum yarıda kaldı. Lütfen tekrar deneyin.",
    });
  }

  static isActive(sandbox) {
    return ACTIVE_STATUSES.includes(sandbox?.vm_status);
  }
}

module.exports = UserSandboxService;
