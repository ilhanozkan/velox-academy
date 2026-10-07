const Category = require("../models/Category");
const Training = require("../models/Training");
const { notFound } = require("../utils/httpError");

class CategoryService {
  static async getAllCategories() {
    return await Category.query().orderBy("name");
  }

  static async getCategoryById(id) {
    return await Category.query().findById(id);
  }

  static async createCategory(categoryData) {
    return await Category.query().insert(categoryData);
  }

  static async updateCategory(id, categoryData) {
    const category = await Category.query().patchAndFetchById(id, categoryData);
    if (!category) throw notFound("Kategori bulunamadı");
    return category;
  }

  static async deleteCategory(id) {
    const deleted = await Category.query().deleteById(id);
    if (!deleted) throw notFound("Kategori bulunamadı");
  }

  // Business logic methods based on UML diagram
  static async getTrainings(categoryId) {
    return await Training.query().where("category_id", categoryId).orderBy("name");
  }

  static async findTraining(categoryId, trainingId) {
    return await Training.query()
      .where({ category_id: categoryId, id: trainingId })
      .first();
  }
}

module.exports = CategoryService;
