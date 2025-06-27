const Category = require("../models/Category");

class CategoryService {
  static async getAllCategories() {
    return await Category.query();
  }

  static async getCategoryById(id) {
    return await Category.query().findById(id);
  }

  static async createCategory(categoryData) {
    return await Category.query().insert(categoryData);
  }

  static async updateCategory(id, categoryData) {
    return await Category.query().patchAndFetchById(id, categoryData);
  }

  static async deleteCategory(id) {
    await Category.query().deleteById(id);
  }
}

module.exports = CategoryService;
