const { Model } = require("objection");

class Category extends Model {
  static get tableName() {
    return "categories";
  }

  static get relationMappings() {
    const Training = require("./Training");

    return {
      trainings: {
        relation: Model.HasManyRelation,
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
