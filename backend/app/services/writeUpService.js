const WriteUp = require("../models/WriteUp");
const { notFound } = require("../utils/httpError");

// Columns an admin may set on a write-up.
const WRITE_UP_FIELDS = ["id", "title", "file_path", "file_id", "chapter_id"];

class WriteUpService {
  static get FIELDS() {
    return WRITE_UP_FIELDS;
  }

  static async getAllWriteUps() {
    return await WriteUp.query();
  }

  static async getWriteUpById(id) {
    return await WriteUp.query().findById(id);
  }

  static async createWriteUp(writeUpData) {
    return await WriteUp.query().insert(writeUpData);
  }

  static async updateWriteUp(id, writeUpData) {
    const { id: _ignored, ...changes } = writeUpData;
    const writeUp = await WriteUp.query().patchAndFetchById(id, changes);
    if (!writeUp) throw notFound("Yazı bulunamadı");
    return writeUp;
  }

  static async deleteWriteUp(id) {
    const deleted = await WriteUp.query().deleteById(id);
    if (!deleted) throw notFound("Yazı bulunamadı");
  }

  // Business logic methods based on UML diagram
  static async downloadWriteUp(writeUpId) {
    const writeUp = await WriteUp.query()
      .findById(writeUpId)
      .withGraphFetched("file");

    if (!writeUp) throw notFound("Yazı bulunamadı");

    // Write-ups either reference a files row or store their path directly.
    const filePath = writeUp.file?.file_path || writeUp.file_path;

    return {
      writeUpId: writeUp.id,
      file: writeUp.file,
      downloadUrl: `/static/${filePath.replace(/^\/+/, "")}`,
      contentType: writeUp.file?.file_type || null,
      filename: writeUp.file?.name || filePath.split("/").pop(),
    };
  }
}

module.exports = WriteUpService;
