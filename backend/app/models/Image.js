const BaseModel = require("./BaseModel");

class Image extends BaseModel {
  static get tableName() {
    return "images";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "file_path", "sandbox_id"],
      properties: {
        id: { type: "string", maxLength: 128 },
        name: { type: "string", minLength: 1, maxLength: 255 },
        file_path: { type: "string", minLength: 1, maxLength: 255 },
        file_id: { type: ["string", "null"] },
        sandbox_id: { type: "string" },
      },
    };
  }

  static get relationMappings() {
    const File = require("./File");
    const Sandbox = require("./Sandbox");

    return {
      sandbox: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Sandbox,
        join: {
          from: "images.sandbox_id",
          to: "sandboxes.id",
        },
      },
      file: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: "images.file_id",
          to: "files.id",
        },
      },
    };
  }
}

module.exports = Image;
