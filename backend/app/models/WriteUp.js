const BaseModel = require("./BaseModel");

class WriteUp extends BaseModel {
  static get tableName() {
    return "write_ups";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "file_path", "chapter_id"],
      properties: {
        id: { type: "string", maxLength: 128 },
        title: { type: ["string", "null"], maxLength: 255 },
        file_path: { type: "string", minLength: 1, maxLength: 255 },
        file_id: { type: ["string", "null"] },
        chapter_id: { type: "string" },
      },
    };
  }

  static get relationMappings() {
    const Chapter = require("./Chapter");
    const File = require("./File");

    return {
      chapter: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Chapter,
        join: {
          from: "write_ups.chapter_id",
          to: "chapters.id",
        },
      },
      file: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: "write_ups.file_id",
          to: "files.id",
        },
      },
    };
  }
}

module.exports = WriteUp;
