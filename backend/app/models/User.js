const { Model } = require("objection");
const bcrypt = require("bcrypt");

class User extends Model {
  static get tableName() {
    return "users";
  }

  static get relationMappings() {
    const Achievement = require("./Achievement");
    const Enrollment = require("./Enrollment");
    const UserSandbox = require("./UserSandbox");

    return {
      achievements: {
        relation: Model.HasManyRelation,
        modelClass: Achievement,
        join: {
          from: "users.id",
          to: "achievements.user_id",
        },
      },
      enrollments: {
        relation: Model.HasManyRelation,
        modelClass: Enrollment,
        join: {
          from: "users.id",
          to: "enrollments.user_id",
        },
      },
      sandboxes: {
        relation: Model.HasManyRelation,
        modelClass: UserSandbox,
        join: {
          from: "users.id",
          to: "user_sandboxes.user_id",
        },
      },
    };
  }

  // Hash the password before saving it to the database
  async $beforeInsert(context) {
    await super.$beforeInsert(context);
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Verify password
  async verifyPassword(password) {
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
