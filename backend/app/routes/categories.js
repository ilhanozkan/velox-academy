const express = require("express");
const CategoryController = require("../controllers/categoryController");
const { requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Tüm kategorileri getir
router.get("/", CategoryController.getAllCategories);

// Belirli bir kategoriyi getir
router.get("/:id", CategoryController.getCategoryById);

// Yeni kategori oluştur
router.post("/", requireAdmin, CategoryController.createCategory);

// Kategoriyi güncelle
router.put("/:id", requireAdmin, CategoryController.updateCategory);

// Kategoriyi sil
router.delete("/:id", requireAdmin, CategoryController.deleteCategory);

// Business logic routes
// Kategoriye ait eğitimleri getir
router.get("/:id/trainings", CategoryController.getTrainings);

// Kategoride belirli bir eğitimi bul
router.get("/:id/trainings/:trainingId", CategoryController.findTraining);

module.exports = router;
