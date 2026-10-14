const WriteUpService = require("../services/writeUpService");
const { notFound, pick, wrapController } = require("../utils/httpError");

class WriteUpController {
  static async getAllWriteUps(req, res) {
    const writeUps = await WriteUpService.getAllWriteUps();
    res.status(200).json({ writeUps });
  }

  static async getWriteUpById(req, res) {
    const writeUp = await WriteUpService.getWriteUpById(req.params.id);
    if (!writeUp) throw notFound("Yazı bulunamadı");
    res.status(200).json({ writeUp });
  }

  static async createWriteUp(req, res) {
    const writeUp = await WriteUpService.createWriteUp(pick(req.body, WriteUpService.FIELDS));
    res.status(201).json({ message: "Yazı oluşturuldu", writeUp });
  }

  static async updateWriteUp(req, res) {
    const writeUp = await WriteUpService.updateWriteUp(
      req.params.id,
      pick(req.body, WriteUpService.FIELDS)
    );
    res.status(200).json({ message: "Yazı güncellendi", writeUp });
  }

  static async deleteWriteUp(req, res) {
    await WriteUpService.deleteWriteUp(req.params.id);
    res.status(200).json({ message: "Yazı silindi" });
  }

  // Business logic endpoints
  static async downloadWriteUp(req, res) {
    const download = await WriteUpService.downloadWriteUp(req.params.id);
    res.status(200).json({ message: "İndirme bilgileri alındı", download });
  }
}

module.exports = wrapController(WriteUpController);
