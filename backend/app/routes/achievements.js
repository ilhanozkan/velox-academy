const express = require("express");
const AchievementController = require("../controllers/achievementController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Tüm başarıları getir
router.get("/", requireAuth, AchievementController.getAllAchievements);

// Belirli bir başarıyı getir
router.get("/:id", requireAuth, AchievementController.getAchievementById);

// Yeni başarı oluştur
router.post("/", requireAdmin, AchievementController.createAchievement);

// Başarıyı güncelle
router.put("/:id", requireAdmin, AchievementController.updateAchievement);

// Başarıyı sil
router.delete("/:id", requireAdmin, AchievementController.deleteAchievement);
module.exports = router;
