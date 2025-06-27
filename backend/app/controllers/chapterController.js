const ChapterService = require("../services/chapterService");

class ChapterController {
  static async getAllChapters(req, res) {
    try {
      const chapters = await ChapterService.getAllChapters();
      res.status(200).json({ chapters });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getChapterById(req, res) {
    try {
      const { id } = req.params;
      const chapter = await ChapterService.getChapterById(id);
      if (!chapter) {
        return res.status(404).json({ error: "Bölüm bulunamadı" });
      }
      res.status(200).json({ chapter });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async createChapter(req, res) {
    try {
      const chapterData = req.body;
      const newChapter = await ChapterService.createChapter(chapterData);
      res
        .status(201)
        .json({ message: "Bölüm oluşturuldu", chapter: newChapter });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateChapter(req, res) {
    try {
      const { id } = req.params;
      const chapterData = req.body;
      const updatedChapter = await ChapterService.updateChapter(
        id,
        chapterData
      );
      res
        .status(200)
        .json({ message: "Bölüm güncellendi", chapter: updatedChapter });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteChapter(req, res) {
    try {
      const { id } = req.params;
      await ChapterService.deleteChapter(id);
      res.status(200).json({ message: "Bölüm silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Business logic endpoints
  static async completeChapter(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const result = await ChapterService.completeChapter(id, userId);
      res.status(200).json({
        message: "Bölüm tamamlandı",
        completion: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getWriteUps(req, res) {
    try {
      const { id } = req.params;
      const writeUps = await ChapterService.getWriteUps(id);
      res.status(200).json({ writeUps });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getInstructions(req, res) {
    try {
      const { id } = req.params;
      const instructions = await ChapterService.getInstructions(id);
      res.status(200).json({ instructions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async findInstruction(req, res) {
    try {
      const { id, instructionId } = req.params;
      const instruction = await ChapterService.findInstruction(
        id,
        instructionId
      );
      if (!instruction) {
        return res.status(404).json({ error: "Yönerge bulunamadı" });
      }
      res.status(200).json({ instruction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async startSandbox(req, res) {
    try {
      const { id } = req.params;
      const result = await ChapterService.startSandbox(id);
      res.status(200).json({
        message: "Sandbox başlatıldı",
        sandbox: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  static async stopSandbox(req, res) {
    try {
      const { id } = req.params;
      const result = await ChapterService.stopSandbox(id);
      res.status(200).json({
        message: "Sandbox durduruldu",
        sandbox: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ChapterController;
