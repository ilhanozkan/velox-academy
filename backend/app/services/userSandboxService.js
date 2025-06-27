const UserSandbox = require("../models/UserSandbox");
const { createUserVM, deleteUserVM, getVmExternalIp } = require("./vmServices");

class UserSandboxService {
  static async createUserSandbox(userId, trainingId) {
    try {
      const existingSandbox = await UserSandbox.query()
        .where("user_id", userId)
        .where("training_id", trainingId)
        .first();

      if (existingSandbox) {
        if (existingSandbox.vm_status === "deleted") {
          return await this.recreateUserSandbox(existingSandbox.id);
        }
        return existingSandbox;
      }

      console.log(
        `Creating new sandbox for user ${userId}, training ${trainingId}`
      );

      const vmInfo = await createUserVM(userId, trainingId);

      const userSandbox = await UserSandbox.query().insert({
        user_id: userId,
        training_id: trainingId,
        vm_instance_name: vmInfo.instanceName,
        vm_external_ip: vmInfo.externalIp,
        vm_status: "running",
        vm_zone: vmInfo.zone,
        project_id: vmInfo.projectId,
      });

      console.log(`Sandbox created successfully with ID: ${userSandbox.id}`);
      return userSandbox;
    } catch (error) {
      console.error("Error creating user sandbox:", error);

      if (error.message.includes("was not found")) {
        throw new Error(
          `Google Cloud template not found. Please check the instance template configuration.`
        );
      } else if (error.message.includes("permission")) {
        throw new Error(
          `Insufficient permissions to create VM. Please check Google Cloud credentials.`
        );
      } else if (error.message.includes("quota")) {
        throw new Error(
          `Google Cloud quota exceeded. Please try again later or contact support.`
        );
      } else {
        throw new Error(`Failed to create sandbox: ${error.message}`);
      }
    }
  }

  static async getUserSandbox(userId, trainingId) {
    return await UserSandbox.query()
      .where("user_id", userId)
      .where("training_id", trainingId)
      .withGraphFetched("[user, training]")
      .first();
  }

  static async getUserSandboxes(userId) {
    return await UserSandbox.query()
      .where("user_id", userId)
      .withGraphFetched("[training]");
  }

  static async deleteUserSandbox(userId, trainingId) {
    const sandbox = await UserSandbox.query()
      .where("user_id", userId)
      .where("training_id", trainingId)
      .first();

    if (!sandbox) {
      throw new Error("Sandbox not found");
    }

    try {
      if (sandbox.vm_status !== "deleted") {
        await deleteUserVM(sandbox.vm_instance_name);
      }

      await UserSandbox.query().patchAndFetchById(sandbox.id, {
        vm_status: "deleted",
        updated_at: new Date(),
      });

      return { status: "deleted", sandboxId: sandbox.id };
    } catch (error) {
      console.error("Error deleting user sandbox:", error);
      throw new Error(`Failed to delete sandbox: ${error.message}`);
    }
  }

  static async recreateUserSandbox(sandboxId) {
    const sandbox = await UserSandbox.query()
      .findById(sandboxId)
      .withGraphFetched("[user, training]");

    if (!sandbox) {
      throw new Error("Sandbox not found");
    }

    try {
      const vmInfo = await createUserVM(sandbox.user_id, sandbox.training_id);

      const updatedSandbox = await UserSandbox.query().patchAndFetchById(
        sandboxId,
        {
          vm_instance_name: vmInfo.instanceName,
          vm_external_ip: vmInfo.externalIp,
          vm_status: "running",
          updated_at: new Date(),
        }
      );

      return updatedSandbox;
    } catch (error) {
      console.error("Error recreating user sandbox:", error);
      throw new Error(`Failed to recreate sandbox: ${error.message}`);
    }
  }

  static async updateSandboxStatus(sandboxId, status) {
    return await UserSandbox.query().patchAndFetchById(sandboxId, {
      vm_status: status,
      updated_at: new Date(),
    });
  }

  static async refreshSandboxIP(sandboxId) {
    const sandbox = await UserSandbox.query().findById(sandboxId);

    if (!sandbox) {
      throw new Error("Sandbox not found");
    }

    try {
      const newIP = await getVmExternalIp(sandbox.vm_instance_name);

      return await UserSandbox.query().patchAndFetchById(sandboxId, {
        vm_external_ip: newIP,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("Error refreshing sandbox IP:", error);
      throw new Error(`Failed to refresh sandbox IP: ${error.message}`);
    }
  }
}

module.exports = UserSandboxService;
