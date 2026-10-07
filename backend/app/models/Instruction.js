const BaseModel = require("./BaseModel");
const { SLUG_PATTERN } = require("./Training");

class Instruction extends BaseModel {
  static get tableName() {
    return "instructions";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "chapter_id"],
      properties: {
        id: { type: "string", maxLength: 128, pattern: SLUG_PATTERN },
        name: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: ["string", "null"] },
        // Markdown body shown in the training workspace.
        content: { type: ["string", "null"] },
        chapter_id: { type: "string" },
        position: { type: "integer", minimum: 0 },
      },
    };
  }

  static get relationMappings() {
    const Chapter = require("./Chapter");
    const Achievement = require("./Achievement");

    return {
      chapter: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Chapter,
        join: {
          from: "instructions.chapter_id",
          to: "chapters.id",
        },
      },
      achievements: {
        relation: BaseModel.HasManyRelation,
        modelClass: Achievement,
        join: {
          from: "instructions.id",
          to: "achievements.instruction_id",
        },
      },
    };
  }
}

module.exports = Instruction;
