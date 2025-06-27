const { Model } = require("objection");

class Chapter extends Model {
  static get tableName() {
    return "chapters";
  }

  static get relationMappings() {
    const WriteUp = require("./WriteUp");
    const Sandbox = require("./Sandbox");
    const Instruction = require("./Instruction");

    return {
      write_ups: {
        relation: Model.HasManyRelation,
        modelClass: WriteUp,
        join: {
          from: "chapters.id",
          to: "write_ups.chapter_id",
        },
      },
      sandbox: {
        relation: Model.HasOneRelation,
        modelClass: Sandbox,
        join: {
          from: "chapters.id",
          to: "sandboxes.chapter_id",
        },
      },
      instructions: {
        relation: Model.HasManyRelation,
        modelClass: Instruction,
        join: {
          from: "chapters.id",
          to: "instructions.chapter_id",
        },
      },
    };
  }
}

module.exports = Chapter;
