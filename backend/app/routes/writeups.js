const express = require("express");
const WriteUpController = require("../controllers/writeUpController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Tüm yazıları getir
router.get("/", WriteUpController.getAllWriteUps);

// Belirli bir yazıyı getir
router.get("/:id", WriteUpController.getWriteUpById);

// Yeni yazı oluştur
router.post("/", authMiddleware, WriteUpController.createWriteUp);

// Yazıyı güncelle
router.put("/:id", authMiddleware, WriteUpController.updateWriteUp);

// Yazıyı sil
router.delete("/:id", authMiddleware, WriteUpController.deleteWriteUp);

// Business logic routes
// Yazıyı indir
router.get("/:id/download", authMiddleware, WriteUpController.downloadWriteUp);

module.exports = router;
