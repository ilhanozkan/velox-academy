const { Model } = require("objection");

class File extends Model {
  static get tableName() {
    return "files";
  }
}

module.exports = File;
