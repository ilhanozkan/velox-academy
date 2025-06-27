const WriteUp = require("../models/WriteUp");

class WriteUpService {
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
    return await WriteUp.query().patchAndFetchById(id, writeUpData);
  }

  static async deleteWriteUp(id) {
    await WriteUp.query().deleteById(id);
  }

  // Business logic methods based on UML diagram
  static async downloadWriteUp(writeUpId) {
    const writeUp = await WriteUp.query()
      .findById(writeUpId)
      .withGraphFetched("file");

    if (!writeUp) {
      throw new Error("Write-up not found");
    }

    if (!writeUp.file) {
      throw new Error("File not found for this write-up");
    }

    // In a real implementation, this would handle file download
    // For now, we'll return file information
    return {
      writeUpId: writeUp.id,
      file: writeUp.file,
      downloadUrl: `/api/files/${writeUp.file.id}/download`,
      contentType: writeUp.file.type,
      filename: writeUp.file.name,
    };
  }
}

module.exports = WriteUpService;
