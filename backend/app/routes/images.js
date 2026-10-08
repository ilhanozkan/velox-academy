const express = require("express");
const ImageController = require("../controllers/imageController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Tüm imajları getir
router.get("/", requireAuth, ImageController.getAllImages);

// Belirli bir imajı getir
router.get("/:id", requireAuth, ImageController.getImageById);

// Yeni imaj oluştur
router.post("/", requireAdmin, ImageController.createImage);

// İmajı güncelle
router.put("/:id", requireAdmin, ImageController.updateImage);

// İmajı sil
router.delete("/:id", requireAdmin, ImageController.deleteImage);

// Business logic routes
// İmaj yükle
router.post("/upload", requireAdmin, ImageController.uploadImage);

module.exports = router;
