const express = require("express");
const AchievementController = require("../controllers/achievementController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Tüm başarıları getir
router.get("/", AchievementController.getAllAchievements);

// Belirli bir başarıyı getir
router.get("/:id", AchievementController.getAchievementById);

// Yeni başarı oluştur
router.post("/", authMiddleware, AchievementController.createAchievement);

// Başarıyı güncelle
router.put("/:id", authMiddleware, AchievementController.updateAchievement);

// Başarıyı sil
router.delete("/:id", authMiddleware, AchievementController.deleteAchievement);

module.exports = router;
