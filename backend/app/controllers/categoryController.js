const CategoryService = require("../services/categoryService");
const { notFound, pick, wrapController } = require("../utils/httpError");

const FIELDS = ["name", "description"];

class CategoryController {
  static async getAllCategories(req, res) {
    const categories = await CategoryService.getAllCategories();
    res.status(200).json({ categories });
  }

  static async getCategoryById(req, res) {
    const category = await CategoryService.getCategoryById(req.params.id);
    if (!category) throw notFound("Kategori bulunamadı");
    res.status(200).json({ category });
  }

  static async createCategory(req, res) {
    const category = await CategoryService.createCategory(pick(req.body, FIELDS));
    res.status(201).json({ message: "Kategori oluşturuldu", category });
  }

  static async updateCategory(req, res) {
    const category = await CategoryService.updateCategory(req.params.id, pick(req.body, FIELDS));
    res.status(200).json({ message: "Kategori güncellendi", category });
  }

  static async deleteCategory(req, res) {
    await CategoryService.deleteCategory(req.params.id);
    res.status(200).json({ message: "Kategori silindi" });
  }

  // Business logic endpoints
  static async getTrainings(req, res) {
    const trainings = await CategoryService.getTrainings(req.params.id);
    res.status(200).json({ trainings });
  }

  static async findTraining(req, res) {
    const training = await CategoryService.findTraining(req.params.id, req.params.trainingId);
    if (!training) throw notFound("Eğitim bulunamadı");
    res.status(200).json({ training });
  }
}

module.exports = wrapController(CategoryController);
module.exports.FIELDS = FIELDS;
