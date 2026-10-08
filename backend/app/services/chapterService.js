const Chapter = require("../models/Chapter");
const { notFound } = require("../utils/httpError");
const ProgressService = require("./progressService");
const UserSandboxService = require("./userSandboxService");

// Columns an admin may set on a chapter.
const CHAPTER_FIELDS = ["id", "name", "description", "training_id", "position"];

class ChapterService {
  static get FIELDS() {
    return CHAPTER_FIELDS;
  }

  static async getAllChapters() {
    return await Chapter.query().orderBy(["training_id", "position"]);
  }

  static async getChapterById(id) {
    return await Chapter.query().findById(id);
  }

  static async createChapter(chapterData) {
    // New chapters go to the end of the training unless a position is given.
    if (chapterData.position === undefined && chapterData.training_id) {
      const { max } = await Chapter.query()
        .where("training_id", chapterData.training_id)
        .max("position as max")
        .first();
      chapterData = { ...chapterData, position: (max || 0) + 1 };
    }
    return await Chapter.query().insert(chapterData);
  }

  static async updateChapter(id, chapterData) {
    const { id: _ignored, ...changes } = chapterData;
    const chapter = await Chapter.query().patchAndFetchById(id, changes);
    if (!chapter) throw notFound("Bölüm bulunamadı");
    return chapter;
  }

  static async deleteChapter(id) {
    const deleted = await Chapter.query().deleteById(id);
    if (!deleted) throw notFound("Bölüm bulunamadı");
  }

  // Business logic methods based on UML diagram
  static async completeChapter(chapterId, userId) {
    return await ProgressService.completeChapter(userId, chapterId);
  }

  static async getWriteUps(chapterId) {
    const chapter = await Chapter.query()
      .findById(chapterId)
      .withGraphFetched("write_ups");
    return chapter ? chapter.write_ups : [];
  }

  static async getInstructions(chapterId) {
    const chapter = await Chapter.query()
      .findById(chapterId)
      .withGraphFetched("instructions");
    return chapter ? chapter.instructions : [];
  }

  static async findInstruction(chapterId, instructionId) {
    const instructions = await this.getInstructions(chapterId);
    return instructions.find((instruction) => instruction.id === instructionId) || null;
  }

  // A chapter runs in the learner's sandbox for its training: starting it
  // provisions that sandbox if needed, stopping it releases the VM.
  static async startSandbox(chapterId, userId) {
    const chapter = await Chapter.query().findById(chapterId);
    if (!chapter) throw notFound("Bölüm bulunamadı");

    await ProgressService.requireEnrollment(userId, chapter.training_id);
    const sandbox = await UserSandboxService.ensureSandbox(userId, chapter.training_id);
    return UserSandboxService.serialize(sandbox, { includeToken: true });
  }

  static async stopSandbox(chapterId, userId) {
    const chapter = await Chapter.query().findById(chapterId);
    if (!chapter) throw notFound("Bölüm bulunamadı");

    return await UserSandboxService.deleteUserSandbox(userId, chapter.training_id);
  }
}

module.exports = ChapterService;
