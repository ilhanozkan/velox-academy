const { Model } = require("objection");

class Sandbox extends Model {
  static get tableName() {
    return "sandboxes";
  }

  static get relationMappings() {
    const Image = require("./Image");
    const Chapter = require("./Chapter");

    return {
      image: {
        relation: Model.BelongsToOneRelation,
        modelClass: Image,
        join: {
          from: "sandboxes.image_id",
          to: "images.id",
        },
      },
      chapter: {
        relation: Model.BelongsToOneRelation,
        modelClass: Chapter,
        join: {
          from: "sandboxes.chapter_id",
          to: "chapters.id",
        },
      },
    };
  }
}

module.exports = Sandbox;
