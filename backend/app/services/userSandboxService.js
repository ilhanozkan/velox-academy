const { UniqueViolationError } = require("objection");

const UserSandbox = require("../models/UserSandbox");
const Training = require("../models/Training");
const { notFound, conflict } = require("../utils/httpError");
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
   *
   * Starting provisioning "claims" the row with a conditional update, so two
   * concurrent requests can never provision the same sandbox twice.
   */
  static async ensureSandbox(userId, trainingId, { recreate = false } = {}) {
    const existing = await UserSandbox.query()
      .where({ user_id: userId, training_id: trainingId })
      .first();

    if (existing?.vm_status === "creating") return existing;
    if (existing?.vm_status === "running" && !recreate) return existing;

    // A previous job for this sandbox is still finishing (e.g. it was
    // deleted while being created); wait for it rather than racing it.
    if (existing && inflight.has(existing.id))
      throw conflict("Sanal makine üzerinde süren bir işlem var. Lütfen birkaç saniye sonra tekrar deneyin.");

    const provider = activeProvider();
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
      const claimed = await UserSandbox.query()
        .patch(fields)
        .where({ id: existing.id, vm_status: existing.vm_status });
      if (!claimed) return await UserSandbox.query().findById(existing.id);
      sandbox = await UserSandbox.query().findById(existing.id);
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

    // When recreating a running sandbox the provider replaces the existing VM.
    this.provision(sandbox);
    return sandbox;
  }

  /**
   * Creates the VM for a sandbox claimed as "creating" and records the outcome.
   * The result is only written if the row is still the one this job claimed;
   * if the sandbox was deleted (or its user/training) in the meantime, the
   * new VM is released instead of being left running unnoticed.
   */
  static provision(sandbox) {
    const claim = { id: sandbox.id, vm_status: "creating", vm_instance_name: sandbox.vm_instance_name };
    const sameClaim = (query) =>
      query
        .where(claim)
        .where((q) =>
          sandbox.access_token === null
            ? q.whereNull("access_token")
            : q.where("access_token", sandbox.access_token)
        );

    const job = (async () => {
      try {
        const training = await Training.query().findById(sandbox.training_id);
        const result = await providerFor(sandbox).create(sandbox, training);

        const updated = await sameClaim(UserSandbox.query().patch({ ...result, vm_status: "running" }));
        if (!updated) {
          console.warn(`Sandbox ${sandbox.id} changed while it was being created; releasing the new VM.`);
          await providerFor(sandbox)
            .destroy({ ...sandbox, ...result })
            .catch((error) => console.error(`Could not release VM ${sandbox.vm_instance_name}:`, error.message));
        }
      } catch (error) {
        console.error(`Sandbox ${sandbox.id} provisioning failed:`, error);
        await sameClaim(
          UserSandbox.query().patch({ vm_status: "error", error_message: friendlyError(error) })
        ).catch((patchError) => console.error(patchError));
      }
    })()
      .catch((error) => console.error(`Sandbox ${sandbox.id} provisioning crashed:`, error))
      .finally(() => inflight.delete(sandbox.id));

    inflight.set(sandbox.id, job);
    return job;
  }

  static async waitForProvisioning() {
    await Promise.allSettled([...inflight.values()]);
  }

  /** Deletes the VM and marks the sandbox deleted; the row keeps the history. */
  static async deleteSandbox(sandbox) {
    // A sandbox that is still being created has no VM to delete yet; its
    // provisioning job notices the deletion and releases the VM itself.
    if (sandbox.vm_status !== "deleted" && sandbox.vm_status !== "creating") {
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
   * Best-effort VM cleanup when a user, a training or an enrollment goes away
   * (or a user is blocked). Rows that stay are marked deleted; rows removed by
   * ON DELETE CASCADE afterwards are gone anyway. Failures are logged, not
   * thrown, so an unreachable cloud API does not block the operation.
   * Sandboxes still being created are released by their provisioning job.
   */
  static async releaseAll(where) {
    const sandboxes = await UserSandbox.query()
      .where(where)
      .whereNotIn("vm_status", ["deleted", "creating"]);

    await Promise.all(
      sandboxes.map(async (sandbox) => {
        try {
          await providerFor(sandbox).destroy(sandbox);
        } catch (error) {
          console.error(`Could not delete VM ${sandbox.vm_instance_name}:`, error.message);
        }
      })
    );

    await UserSandbox.query()
      .where(where)
      .whereNot("vm_status", "deleted")
      .patch({ vm_status: "deleted", vm_external_ip: null, error_message: null });
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
