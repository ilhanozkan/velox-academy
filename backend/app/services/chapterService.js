const Chapter = require("../models/Chapter");

class ChapterService {
  static async getAllChapters() {
    return await Chapter.query();
  }

  static async getChapterById(id) {
    return await Chapter.query().findById(id);
  }

  static async createChapter(chapterData) {
    return await Chapter.query().insert(chapterData);
  }

  static async updateChapter(id, chapterData) {
    return await Chapter.query().patchAndFetchById(id, chapterData);
  }

  static async deleteChapter(id) {
    await Chapter.query().deleteById(id);
  }

  // Business logic methods based on UML diagram
  static async completeChapter(chapterId, userId) {
    // This would typically update user's progress
    // For now, we'll return a success response
    return {
      chapterId,
      userId,
      completedAt: new Date(),
      status: "completed",
    };
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
    const chapter = await Chapter.query()
      .findById(chapterId)
      .withGraphFetched("instructions");

    if (!chapter || !chapter.instructions) {
      return null;
    }

    return chapter.instructions.find(
      (instruction) => instruction.id === instructionId
    );
  }

  static async startSandbox(chapterId) {
    const chapter = await Chapter.query()
      .findById(chapterId)
      .withGraphFetched("sandbox");

    if (!chapter || !chapter.sandbox) {
      throw new Error("Sandbox not found for this chapter");
    }

    // In a real implementation, this would start the sandbox environment
    // For now, we'll return sandbox information
    return {
      ...chapter.sandbox,
      status: "starting",
      startedAt: new Date(),
    };
  }

  static async stopSandbox(chapterId) {
    const chapter = await Chapter.query()
      .findById(chapterId)
      .withGraphFetched("sandbox");

    if (!chapter || !chapter.sandbox) {
      throw new Error("Sandbox not found for this chapter");
    }

    // In a real implementation, this would stop the sandbox environment
    return {
      ...chapter.sandbox,
      status: "stopped",
      stoppedAt: new Date(),
    };
  }
}

module.exports = ChapterService;
