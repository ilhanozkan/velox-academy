const express = require("express");
const ImageController = require("../controllers/imageController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Tüm imajları getir
router.get("/", ImageController.getAllImages);

// Belirli bir imajı getir
router.get("/:id", ImageController.getImageById);

// Yeni imaj oluştur
router.post("/", authMiddleware, ImageController.createImage);

// İmajı güncelle
router.put("/:id", authMiddleware, ImageController.updateImage);

// İmajı sil
router.delete("/:id", authMiddleware, ImageController.deleteImage);

// Business logic routes
// İmaj yükle
router.post("/upload", authMiddleware, ImageController.uploadImage);

module.exports = router;
