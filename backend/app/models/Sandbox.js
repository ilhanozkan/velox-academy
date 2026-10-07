const BaseModel = require("./BaseModel");

class Sandbox extends BaseModel {
  static get tableName() {
    return "sandboxes";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "image_file_path", "chapter_id"],
      properties: {
        id: { type: "string", maxLength: 128 },
        name: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: ["string", "null"] },
        image_file_path: { type: "string", minLength: 1, maxLength: 255 },
        chapter_id: { type: "string" },
      },
    };
  }

  static get relationMappings() {
    const Image = require("./Image");
    const Chapter = require("./Chapter");

    return {
      // Images reference their sandbox (images.sandbox_id); the old mapping
      // pointed at a sandboxes.image_id column that does not exist.
      image: {
        relation: BaseModel.HasOneRelation,
        modelClass: Image,
        join: {
          from: "sandboxes.id",
          to: "images.sandbox_id",
        },
      },
      images: {
        relation: BaseModel.HasManyRelation,
        modelClass: Image,
        join: {
          from: "sandboxes.id",
          to: "images.sandbox_id",
        },
      },
      chapter: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Chapter,
        join: {
          from: "sandboxes.chapter_id",
          to: "chapters.id",
        },
      },
    };
  }
}

module.exports = Sandbox;
