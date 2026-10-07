const BaseModel = require("./BaseModel");

class Enrollment extends BaseModel {
  static get tableName() {
    return "enrollments";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id", "training_id"],
      properties: {
        id: { type: "integer" },
        user_id: { type: "integer" },
        training_id: { type: "string" },
        completed: { type: "boolean" },
      },
    };
  }

  static get relationMappings() {
    const User = require("./User");
    const Training = require("./Training");

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "enrollments.user_id",
          to: "users.id",
        },
      },
      training: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Training,
        join: {
          from: "enrollments.training_id",
          to: "trainings.id",
        },
      },
    };
  }
}

module.exports = Enrollment;
