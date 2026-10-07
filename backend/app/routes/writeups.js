const express = require("express");
const WriteUpController = require("../controllers/writeUpController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Tüm yazıları getir
router.get("/", requireAuth, WriteUpController.getAllWriteUps);

// Belirli bir yazıyı getir
router.get("/:id", requireAuth, WriteUpController.getWriteUpById);

// Yeni yazı oluştur
router.post("/", requireAdmin, WriteUpController.createWriteUp);

// Yazıyı güncelle
router.put("/:id", requireAdmin, WriteUpController.updateWriteUp);

// Yazıyı sil
router.delete("/:id", requireAdmin, WriteUpController.deleteWriteUp);

// Business logic routes
// Yazıyı indir
router.get("/:id/download", requireAuth, WriteUpController.downloadWriteUp);

module.exports = router;
