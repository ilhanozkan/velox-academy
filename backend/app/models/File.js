const BaseModel = require("./BaseModel");

class File extends BaseModel {
  static get tableName() {
    return "files";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "file_path", "file_type"],
      properties: {
        id: { type: "string", maxLength: 128 },
        name: { type: "string", minLength: 1, maxLength: 255 },
        file_path: { type: "string", minLength: 1, maxLength: 255 },
        file_type: { type: "string", minLength: 1, maxLength: 255 },
      },
    };
  }
}

module.exports = File;
