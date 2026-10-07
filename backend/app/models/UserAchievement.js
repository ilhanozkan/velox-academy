const BaseModel = require("./BaseModel");

class UserAchievement extends BaseModel {
  static get tableName() {
    return "user_achievements";
  }

  static get hasTimestamps() {
    return false;
  }

  static get relationMappings() {
    const User = require("./User");
    const Achievement = require("./Achievement");

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "user_achievements.user_id",
          to: "users.id",
        },
      },
      achievement: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Achievement,
        join: {
          from: "user_achievements.achievement_id",
          to: "achievements.id",
        },
      },
    };
  }
}

module.exports = UserAchievement;
