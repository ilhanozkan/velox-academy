const BaseModel = require("./BaseModel");
const { SLUG_PATTERN } = require("./Training");

class Achievement extends BaseModel {
  static get tableName() {
    return "achievements";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name"],
      properties: {
        id: { type: "string", maxLength: 128, pattern: SLUG_PATTERN },
        name: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: ["string", "null"] },
        instruction_id: { type: ["string", "null"] },
        icon: { type: ["string", "null"], maxLength: 255 },
        points: { type: "integer", minimum: 0 },
      },
    };
  }

  static get relationMappings() {
    const Instruction = require("./Instruction");
    const User = require("./User");

    return {
      instruction: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Instruction,
        join: {
          from: "achievements.instruction_id",
          to: "instructions.id",
        },
      },
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: User,
        join: {
          from: "achievements.id",
          through: {
            from: "user_achievements.achievement_id",
            to: "user_achievements.user_id",
            extra: ["earned_at"],
          },
          to: "users.id",
        },
      },
    };
  }
}

module.exports = Achievement;
