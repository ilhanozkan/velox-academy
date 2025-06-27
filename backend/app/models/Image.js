const { Model } = require("objection");

class Image extends Model {
  static get tableName() {
    return "images";
  }

  static get relationMappings() {
    const File = require("./File");

    return {
      file: {
        relation: Model.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: "images.file_id",
          to: "files.id",
        },
      },
    };
  }
}

module.exports = Image;
