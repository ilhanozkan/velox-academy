const WriteUpService = require("../services/writeUpService");

class WriteUpController {
  static async getAllWriteUps(req, res) {
    try {
      const writeUps = await WriteUpService.getAllWriteUps();
      res.status(200).json({ writeUps });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getWriteUpById(req, res) {
    try {
      const { id } = req.params;
      const writeUp = await WriteUpService.getWriteUpById(id);
      if (!writeUp) {
        return res.status(404).json({ error: "Yazı bulunamadı" });
      }
      res.status(200).json({ writeUp });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async createWriteUp(req, res) {
    try {
      const writeUpData = req.body;
      const newWriteUp = await WriteUpService.createWriteUp(writeUpData);
      res
        .status(201)
        .json({ message: "Yazı oluşturuldu", writeUp: newWriteUp });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateWriteUp(req, res) {
    try {
      const { id } = req.params;
      const writeUpData = req.body;
      const updatedWriteUp = await WriteUpService.updateWriteUp(
        id,
        writeUpData
      );
      res
        .status(200)
        .json({ message: "Yazı güncellendi", writeUp: updatedWriteUp });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteWriteUp(req, res) {
    try {
      const { id } = req.params;
      await WriteUpService.deleteWriteUp(id);
      res.status(200).json({ message: "Yazı silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Business logic endpoints
  static async downloadWriteUp(req, res) {
    try {
      const { id } = req.params;
      const downloadInfo = await WriteUpService.downloadWriteUp(id);
      res.status(200).json({
        message: "İndirme bilgileri alındı",
        download: downloadInfo,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = WriteUpController;
