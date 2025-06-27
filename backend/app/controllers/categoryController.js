const CategoryService = require("../services/categoryService");

class CategoryController {
  static async getAllCategories(req, res) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.status(200).json({ categories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ error: "Kategori bulunamadı" });
      }
      res.status(200).json({ category });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async createCategory(req, res) {
    try {
      const categoryData = req.body;
      const newCategory = await CategoryService.createCategory(categoryData);
      res
        .status(201)
        .json({ message: "Kategori oluşturuldu", category: newCategory });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const updatedCategory = await CategoryService.updateCategory(
        id,
        categoryData
      );
      res
        .status(200)
        .json({ message: "Kategori güncellendi", category: updatedCategory });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(id);
      res.status(200).json({ message: "Kategori silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Business logic endpoints
  static async getTrainings(req, res) {
    try {
      const { id } = req.params;
      const trainings = await CategoryService.getTrainings(id);
      res.status(200).json({ trainings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async findTraining(req, res) {
    try {
      const { id, trainingId } = req.params;
      const training = await CategoryService.findTraining(id, trainingId);
      if (!training) {
        return res.status(404).json({ error: "Eğitim bulunamadı" });
      }
      res.status(200).json({ training });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }
}

module.exports = CategoryController;
