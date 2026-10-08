const BaseModel = require("./BaseModel");
const { SLUG_PATTERN } = require("./Training");

class Chapter extends BaseModel {
  static get tableName() {
    return "chapters";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name"],
      properties: {
        id: { type: "string", maxLength: 128, pattern: SLUG_PATTERN },
        name: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: ["string", "null"] },
        training_id: { type: "string" },
        position: { type: "integer", minimum: 0 },
      },
    };
  }

  static get relationMappings() {
    const Training = require("./Training");
    const WriteUp = require("./WriteUp");
    const Sandbox = require("./Sandbox");
    const Instruction = require("./Instruction");

    return {
      training: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Training,
        join: {
          from: "chapters.training_id",
          to: "trainings.id",
        },
      },
      write_ups: {
        relation: BaseModel.HasManyRelation,
        modelClass: WriteUp,
        join: {
          from: "chapters.id",
          to: "write_ups.chapter_id",
        },
      },
      sandbox: {
        relation: BaseModel.HasOneRelation,
        modelClass: Sandbox,
        join: {
          from: "chapters.id",
          to: "sandboxes.chapter_id",
        },
      },
      instructions: {
        relation: BaseModel.HasManyRelation,
        modelClass: Instruction,
        modify: (query) => query.orderBy("position").orderBy("id"),
        join: {
          from: "chapters.id",
          to: "instructions.chapter_id",
        },
      },
    };
  }
}

module.exports = Chapter;
