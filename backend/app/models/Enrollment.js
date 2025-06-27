const { Model } = require("objection");

class Enrollment extends Model {
  static get tableName() {
    return "enrollments";
  }

  static get relationMappings() {
    const User = require("./User");
    const Training = require("./Training");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "enrollments.user_id",
          to: "users.id",
        },
      },
      training: {
        relation: Model.BelongsToOneRelation,
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
