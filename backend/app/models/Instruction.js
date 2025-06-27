const { Model } = require("objection");

class Instruction extends Model {
  static get tableName() {
    return "instructions";
  }

  static get relationMappings() {
    const Sandbox = require("./Sandbox");
    const Achievement = require("./Achievement");

    return {
      sandbox: {
        relation: Model.HasOneRelation,
        modelClass: Sandbox,
        join: {
          from: "instructions.id",
          to: "sandboxes.instruction_id",
        },
      },
      achievements: {
        relation: Model.HasManyRelation,
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
