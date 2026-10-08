const express = require("express");
const ChapterController = require("../controllers/chapterController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Tüm bölümleri getir
router.get("/", ChapterController.getAllChapters);

// Belirli bir bölümü getir
router.get("/:id", ChapterController.getChapterById);

// Yeni bölüm oluştur
router.post("/", requireAdmin, ChapterController.createChapter);

// Bölümü güncelle
router.put("/:id", requireAdmin, ChapterController.updateChapter);

// Bölümü sil
router.delete("/:id", requireAdmin, ChapterController.deleteChapter);

// Business logic routes
// Bölümü tamamla
router.post("/:id/complete", requireAuth, ChapterController.completeChapter);

// Bölüme ait yazıları getir
router.get("/:id/writeups", requireAuth, ChapterController.getWriteUps);

// Bölüme ait yönergeleri getir
router.get("/:id/instructions", ChapterController.getInstructions);

// Bölümde belirli bir yönergeyi bul
router.get("/:id/instructions/:instructionId", ChapterController.findInstruction);

// Bölüm sandbox'ını başlat
router.post("/:id/sandbox/start", requireAuth, ChapterController.startSandbox);

// Bölüm sandbox'ını durdur
router.post("/:id/sandbox/stop", requireAuth, ChapterController.stopSandbox);

module.exports = router;
