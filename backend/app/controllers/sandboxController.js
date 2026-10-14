const SandboxService = require("../services/sandboxService");
const { notFound, pick, wrapController } = require("../utils/httpError");

class SandboxController {
  static async getAllSandboxes(req, res) {
    const sandboxes = await SandboxService.getAllSandboxes();
    res.status(200).json({ sandboxes });
  }

  static async getSandboxById(req, res) {
    const sandbox = await SandboxService.getSandboxById(req.params.id);
    if (!sandbox) throw notFound("Sandbox bulunamadı");
    res.status(200).json({ sandbox });
  }

  static async createSandbox(req, res) {
    const sandbox = await SandboxService.createSandbox(pick(req.body, SandboxService.FIELDS));
    res.status(201).json({ message: "Sandbox oluşturuldu", sandbox });
  }

  static async updateSandbox(req, res) {
    const sandbox = await SandboxService.updateSandbox(
      req.params.id,
      pick(req.body, SandboxService.FIELDS)
    );
    res.status(200).json({ message: "Sandbox güncellendi", sandbox });
  }

  static async deleteSandbox(req, res) {
    await SandboxService.deleteSandbox(req.params.id);
    res.status(200).json({ message: "Sandbox silindi" });
  }

  // Business logic endpoints
  static async initiateImage(req, res) {
    const initiation = await SandboxService.initiateImage(req.params.id);
    res.status(200).json({ message: "Sandbox imajı hazır", initiation });
  }

  static async stopImage(req, res) {
    const stop = await SandboxService.stopImage(req.params.id);
    res.status(200).json({ message: "Sandbox imajı durduruldu", stop });
  }
}

module.exports = wrapController(SandboxController);
