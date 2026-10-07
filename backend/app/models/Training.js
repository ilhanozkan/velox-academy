const BaseModel = require("./BaseModel");

// Lowercase words separated by single dashes, e.g. "web-dev-101".
const SLUG_PATTERN = "^[a-z0-9]+(-[a-z0-9]+)*$";

class Training extends BaseModel {
  static get tableName() {
    return "trainings";
  }

  static get LEVELS() {
    return ["beginner", "intermediate", "advanced"];
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "slug", "image_file_path"],
      properties: {
        id: { type: "string", maxLength: 64, pattern: SLUG_PATTERN },
        name: { type: "string", minLength: 1, maxLength: 255 },
        slug: { type: "string", maxLength: 255, pattern: SLUG_PATTERN },
        image_file_path: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: ["string", "null"] },
        category_id: { type: ["integer", "null"] },
        level: { type: "string", enum: Training.LEVELS },
        estimated_minutes: { type: ["integer", "null"], minimum: 0 },
        sandbox_template: { type: ["string", "null"], maxLength: 255 },
      },
    };
  }

  static get relationMappings() {
    const Category = require("./Category");
    const Chapter = require("./Chapter");
    const Enrollment = require("./Enrollment");
    const UserSandbox = require("./UserSandbox");

    return {
      category: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: "trainings.category_id",
          to: "categories.id",
        },
      },
      chapters: {
        relation: BaseModel.HasManyRelation,
        modelClass: Chapter,
        modify: (query) => query.orderBy("position").orderBy("id"),
        join: {
          from: "trainings.id",
          to: "chapters.training_id",
        },
      },
      enrollments: {
        relation: BaseModel.HasManyRelation,
        modelClass: Enrollment,
        join: {
          from: "trainings.id",
          to: "enrollments.training_id",
        },
      },
      userSandboxes: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserSandbox,
        join: {
          from: "trainings.id",
          to: "user_sandboxes.training_id",
        },
      },
    };
  }
}

Training.SLUG_PATTERN = SLUG_PATTERN;

module.exports = Training;
