const BaseModel = require("./BaseModel");

class ChapterCompletion extends BaseModel {
  static get tableName() {
    return "chapter_completions";
  }

  static get hasTimestamps() {
    return false;
  }

  static get relationMappings() {
    const User = require("./User");
    const Chapter = require("./Chapter");

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "chapter_completions.user_id",
          to: "users.id",
        },
      },
      chapter: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Chapter,
        join: {
          from: "chapter_completions.chapter_id",
          to: "chapters.id",
        },
      },
    };
  }
}

module.exports = ChapterCompletion;
