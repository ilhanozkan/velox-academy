const { Model } = require("objection");

class WriteUp extends Model {
  static get tableName() {
    return "write_ups";
  }

  static get relationMappings() {
    const File = require("./File");

    return {
      file: {
        relation: Model.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: "write_ups.file_id",
          to: "files.id",
        },
      },
    };
  }
}

module.exports = WriteUp;
