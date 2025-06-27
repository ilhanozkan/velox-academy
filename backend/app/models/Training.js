const { Model } = require("objection");

class Training extends Model {
  static get tableName() {
    return "trainings";
  }

  static get relationMappings() {
    const Chapter = require("./Chapter");
    const Enrollment = require("./Enrollment");
    const UserSandbox = require("./UserSandbox");

    return {
      chapters: {
        relation: Model.HasManyRelation,
        modelClass: Chapter,
        join: {
          from: "trainings.id",
          to: "chapters.training_id",
        },
      },
      enrollments: {
        relation: Model.HasManyRelation,
        modelClass: Enrollment,
        join: {
          from: "trainings.id",
          to: "enrollments.training_id",
        },
      },
      userSandboxes: {
        relation: Model.HasManyRelation,
        modelClass: UserSandbox,
        join: {
          from: "trainings.id",
          to: "user_sandboxes.training_id",
        },
      },
    };
  }
}

module.exports = Training;
