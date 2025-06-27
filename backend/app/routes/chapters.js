const express = require("express");
const ChapterController = require("../controllers/chapterController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Tüm bölümleri getir
router.get("/", ChapterController.getAllChapters);

// Belirli bir bölümü getir
router.get("/:id", ChapterController.getChapterById);

// Yeni bölüm oluştur
router.post("/", authMiddleware, ChapterController.createChapter);

// Bölümü güncelle
router.put("/:id", authMiddleware, ChapterController.updateChapter);

// Bölümü sil
router.delete("/:id", authMiddleware, ChapterController.deleteChapter);

// Business logic routes
// Bölümü tamamla
router.post("/:id/complete", authMiddleware, ChapterController.completeChapter);

// Bölüme ait yazıları getir
router.get("/:id/writeups", ChapterController.getWriteUps);

// Bölüme ait yönergeleri getir
router.get("/:id/instructions", ChapterController.getInstructions);

// Bölümde belirli bir yönergeyi bul
router.get(
  "/:id/instructions/:instructionId",
  ChapterController.findInstruction
);

// Bölüm sandbox'ını başlat
router.post(
  "/:id/sandbox/start",
  authMiddleware,
  ChapterController.startSandbox
);

// Bölüm sandbox'ını durdur
router.post("/:id/sandbox/stop", authMiddleware, ChapterController.stopSandbox);

module.exports = router;
