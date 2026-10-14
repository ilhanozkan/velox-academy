const bcrypt = require("bcrypt");

const BaseModel = require("./BaseModel");

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$/;

class User extends BaseModel {
  static get tableName() {
    return "users";
  }

  static get ROLES() {
    return ["user", "admin"];
  }

  static get STATUSES() {
    return ["active", "blocked"];
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["username", "email", "password"],
      properties: {
        id: { type: "integer" },
        username: {
          type: "string",
          minLength: 3,
          maxLength: 30,
          pattern: "^[A-Za-z0-9_.-]+$",
        },
        email: {
          type: "string",
          maxLength: 255,
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        },
        // bcrypt only uses the first 72 bytes of a password.
        password: { type: "string", minLength: 6, maxLength: 72 },
        full_name: { type: ["string", "null"], maxLength: 255 },
        profile_image: { type: ["string", "null"], maxLength: 255 },
        role: { type: "string", enum: User.ROLES },
        status: { type: "string", enum: User.STATUSES },
      },
    };
  }

  static get relationMappings() {
    const Achievement = require("./Achievement");
    const Enrollment = require("./Enrollment");
    const UserSandbox = require("./UserSandbox");
    const InstructionCompletion = require("./InstructionCompletion");
    const ChapterCompletion = require("./ChapterCompletion");

    return {
      achievements: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Achievement,
        join: {
          from: "users.id",
          through: {
            from: "user_achievements.user_id",
            to: "user_achievements.achievement_id",
            extra: ["earned_at"],
          },
          to: "achievements.id",
        },
      },
      enrollments: {
        relation: BaseModel.HasManyRelation,
        modelClass: Enrollment,
        join: {
          from: "users.id",
          to: "enrollments.user_id",
        },
      },
      sandboxes: {
        relation: BaseModel.HasManyRelation,
        modelClass: UserSandbox,
        join: {
          from: "users.id",
          to: "user_sandboxes.user_id",
        },
      },
      instructionCompletions: {
        relation: BaseModel.HasManyRelation,
        modelClass: InstructionCompletion,
        join: {
          from: "users.id",
          to: "instruction_completions.user_id",
        },
      },
      chapterCompletions: {
        relation: BaseModel.HasManyRelation,
        modelClass: ChapterCompletion,
        join: {
          from: "users.id",
          to: "chapter_completions.user_id",
        },
      },
    };
  }

  get isAdmin() {
    return this.role === "admin";
  }

  get isBlocked() {
    return this.status === "blocked";
  }

  // Hash the password before saving it to the database
  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Password changes through patch/update must be hashed too; previously they
  // were stored in plain text and the user could no longer log in.
  async $beforeUpdate(opt, context) {
    await super.$beforeUpdate(opt, context);
    if (this.password && !BCRYPT_HASH.test(this.password)) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Verify password
  async verifyPassword(password) {
    if (!password || !this.password) return false;
    return await bcrypt.compare(password, this.password);
  }

  // Hide password hash when converting to JSON
  $formatJson(json) {
    json = super.$formatJson(json);
    delete json.password;
    return json;
  }
}

module.exports = User;
