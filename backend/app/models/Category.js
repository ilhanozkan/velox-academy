const BaseModel = require("./BaseModel");

class Category extends BaseModel {
  static get tableName() {
    return "categories";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: ["string", "null"] },
      },
    };
  }

  static get relationMappings() {
    const Training = require("./Training");

    return {
      trainings: {
        relation: BaseModel.HasManyRelation,
        modelClass: Training,
        join: {
          from: "categories.id",
          to: "trainings.category_id",
        },
      },
    };
  }
}

module.exports = Category;
