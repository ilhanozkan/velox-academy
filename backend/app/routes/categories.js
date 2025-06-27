const express = require("express");
const CategoryController = require("../controllers/categoryController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Tüm kategorileri getir
router.get("/", CategoryController.getAllCategories);

// Belirli bir kategoriyi getir
router.get("/:id", CategoryController.getCategoryById);

// Yeni kategori oluştur
router.post("/", authMiddleware, CategoryController.createCategory);

// Kategoriyi güncelle
router.put("/:id", authMiddleware, CategoryController.updateCategory);

// Kategoriyi sil
router.delete("/:id", authMiddleware, CategoryController.deleteCategory);

// Business logic routes
// Kategoriye ait eğitimleri getir
router.get("/:id/trainings", CategoryController.getTrainings);

// Kategoride belirli bir eğitimi bul
router.get("/:id/trainings/:trainingId", CategoryController.findTraining);

module.exports = router;
