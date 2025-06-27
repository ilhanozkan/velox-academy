const { Model } = require("objection");

class UserSandbox extends Model {
  static get tableName() {
    return "user_sandboxes";
  }

  static get relationMappings() {
    const User = require("./User");
    const Training = require("./Training");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "user_sandboxes.user_id",
          to: "users.id",
        },
      },
      training: {
        relation: Model.BelongsToOneRelation,
        modelClass: Training,
        join: {
          from: "user_sandboxes.training_id",
          to: "trainings.id",
        },
      },
    };
  }
}

module.exports = UserSandbox;
