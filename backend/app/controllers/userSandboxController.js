const UserSandboxService = require("../services/userSandboxService");

class UserSandboxController {
  static async createSandbox(req, res) {
    try {
      const { trainingId } = req.body;
      const userId = req.user.userId; // Get userId from JWT token

      if (!trainingId) {
        return res.status(400).json({ error: "Training ID is required" });
      }

      const sandbox = await UserSandboxService.createUserSandbox(
        userId,
        trainingId
      );

      res.status(201).json({
        message: "Sandbox created successfully",
        sandbox: {
          id: sandbox.id,
          vmInstanceName: sandbox.vm_instance_name,
          vmExternalIp: sandbox.vm_external_ip,
          vmStatus: sandbox.vm_status,
          accessUrl: sandbox.vm_external_ip
            ? `http://${sandbox.vm_external_ip}:9000`
            : null,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }

  static async getUserSandboxes(req, res) {
    try {
      const userId = req.user.userId; // Get userId from JWT token
      const sandboxes = await UserSandboxService.getUserSandboxes(userId);

      res.status(200).json({
        sandboxes: sandboxes.map((sandbox) => ({
          id: sandbox.id,
          trainingId: sandbox.training_id,
          trainingName: sandbox.training?.name,
          vmInstanceName: sandbox.vm_instance_name,
          vmExternalIp: sandbox.vm_external_ip,
          vmStatus: sandbox.vm_status,
          accessUrl: sandbox.vm_external_ip
            ? `http://${sandbox.vm_external_ip}:9000`
            : null,
          createdAt: sandbox.created_at,
          updatedAt: sandbox.updated_at,
        })),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }

  static async getSandbox(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId; // Get userId from JWT token
      const { trainingId } = req.query; // Get trainingId from query params

      if (!trainingId) {
        return res.status(400).json({ error: "Training ID is required" });
      }

      const sandbox = await UserSandboxService.getUserSandbox(
        userId,
        trainingId
      );

      if (!sandbox) {
        return res.status(404).json({ error: "Sandbox not found" });
      }

      res.status(200).json({
        sandbox: {
          id: sandbox.id,
          vmInstanceName: sandbox.vm_instance_name,
          vmExternalIp: sandbox.vm_external_ip,
          vmStatus: sandbox.vm_status,
          accessUrl: sandbox.vm_external_ip
            ? `http://${sandbox.vm_external_ip}:9000`
            : null,
          createdAt: sandbox.created_at,
          updatedAt: sandbox.updated_at,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }

  static async deleteSandbox(req, res) {
    try {
      const { trainingId } = req.body;
      const userId = req.user.userId; // Get userId from JWT token

      if (!trainingId) {
        return res.status(400).json({ error: "Training ID is required" });
      }

      const result = await UserSandboxService.deleteUserSandbox(
        userId,
        trainingId
      );

      res.status(200).json({
        message: "Sandbox deleted successfully",
        result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }

  static async recreateSandbox(req, res) {
    try {
      const { id } = req.params;
      const sandbox = await UserSandboxService.recreateUserSandbox(id);

      res.status(200).json({
        message: "Sandbox recreated successfully",
        sandbox: {
          id: sandbox.id,
          vmInstanceName: sandbox.vm_instance_name,
          vmExternalIp: sandbox.vm_external_ip,
          vmStatus: sandbox.vm_status,
          accessUrl: sandbox.vm_external_ip
            ? `http://${sandbox.vm_external_ip}:9000`
            : null,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }

  static async refreshSandboxIP(req, res) {
    try {
      const { id } = req.params;
      const sandbox = await UserSandboxService.refreshSandboxIP(id);

      res.status(200).json({
        message: "Sandbox IP refreshed successfully",
        sandbox: {
          id: sandbox.id,
          vmInstanceName: sandbox.vm_instance_name,
          vmExternalIp: sandbox.vm_external_ip,
          vmStatus: sandbox.vm_status,
          accessUrl: sandbox.vm_external_ip
            ? `http://${sandbox.vm_external_ip}:9000`
            : null,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }
}

module.exports = UserSandboxController;
