const SandboxService = require("../services/sandboxService");

class SandboxController {
  static async getAllSandboxes(req, res) {
    try {
      const sandboxes = await SandboxService.getAllSandboxes();
      res.status(200).json({ sandboxes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getSandboxById(req, res) {
    try {
      const { id } = req.params;
      const sandbox = await SandboxService.getSandboxById(id);
      if (!sandbox) {
        return res.status(404).json({ error: "Sandbox bulunamadı" });
      }
      res.status(200).json({ sandbox });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async createSandbox(req, res) {
    try {
      const sandboxData = req.body;
      const newSandbox = await SandboxService.createSandbox(sandboxData);
      res
        .status(201)
        .json({ message: "Sandbox oluşturuldu", sandbox: newSandbox });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateSandbox(req, res) {
    try {
      const { id } = req.params;
      const sandboxData = req.body;
      const updatedSandbox = await SandboxService.updateSandbox(
        id,
        sandboxData
      );
      res
        .status(200)
        .json({ message: "Sandbox güncellendi", sandbox: updatedSandbox });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteSandbox(req, res) {
    try {
      const { id } = req.params;
      await SandboxService.deleteSandbox(id);
      res.status(200).json({ message: "Sandbox silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Business logic endpoints
  static async initiateImage(req, res) {
    try {
      const { id } = req.params;
      const result = await SandboxService.initiateImage(id);
      res.status(200).json({
        message: "Sandbox imajı başlatıldı",
        initiation: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async stopImage(req, res) {
    try {
      const { id } = req.params;
      const result = await SandboxService.stopImage(id);
      res.status(200).json({
        message: "Sandbox imajı durduruldu",
        stop: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SandboxController;
