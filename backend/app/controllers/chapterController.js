const ChapterService = require("../services/chapterService");
const { notFound, pick, wrapController } = require("../utils/httpError");

class ChapterController {
  static async getAllChapters(req, res) {
    const chapters = await ChapterService.getAllChapters();
    res.status(200).json({ chapters });
  }

  static async getChapterById(req, res) {
    const chapter = await ChapterService.getChapterById(req.params.id);
    if (!chapter) throw notFound("Bölüm bulunamadı");
    res.status(200).json({ chapter });
  }

  static async createChapter(req, res) {
    const chapter = await ChapterService.createChapter(pick(req.body, ChapterService.FIELDS));
    res.status(201).json({ message: "Bölüm oluşturuldu", chapter });
  }

  static async updateChapter(req, res) {
    const chapter = await ChapterService.updateChapter(
      req.params.id,
      pick(req.body, ChapterService.FIELDS)
    );
    res.status(200).json({ message: "Bölüm güncellendi", chapter });
  }

  static async deleteChapter(req, res) {
    await ChapterService.deleteChapter(req.params.id);
    res.status(200).json({ message: "Bölüm silindi" });
  }

  // Business logic endpoints. The user always comes from the session; the
  // old handlers trusted a userId sent in the request body.
  static async completeChapter(req, res) {
    const completion = await ChapterService.completeChapter(req.params.id, req.user.userId);
    res.status(200).json({ message: "Bölüm tamamlandı", completion });
  }

  static async getWriteUps(req, res) {
    const writeUps = await ChapterService.getWriteUps(req.params.id);
    res.status(200).json({ writeUps });
  }

  static async getInstructions(req, res) {
    const instructions = await ChapterService.getInstructions(req.params.id);
    res.status(200).json({ instructions });
  }

  static async findInstruction(req, res) {
    const instruction = await ChapterService.findInstruction(req.params.id, req.params.instructionId);
    if (!instruction) throw notFound("Yönerge bulunamadı");
    res.status(200).json({ instruction });
  }

  static async startSandbox(req, res) {
    const sandbox = await ChapterService.startSandbox(req.params.id, req.user.userId);
    res.status(200).json({ message: "Sandbox başlatıldı", sandbox });
  }

  static async stopSandbox(req, res) {
    const sandbox = await ChapterService.stopSandbox(req.params.id, req.user.userId);
    res.status(200).json({ message: "Sandbox durduruldu", sandbox });
  }
}

module.exports = wrapController(ChapterController);
