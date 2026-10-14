const BaseModel = require("./BaseModel");

class InstructionCompletion extends BaseModel {
  static get tableName() {
    return "instruction_completions";
  }

  static get hasTimestamps() {
    return false;
  }

  static get relationMappings() {
    const User = require("./User");
    const Instruction = require("./Instruction");

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "instruction_completions.user_id",
          to: "users.id",
        },
      },
      instruction: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Instruction,
        join: {
          from: "instruction_completions.instruction_id",
          to: "instructions.id",
        },
      },
    };
  }
}

module.exports = InstructionCompletion;
