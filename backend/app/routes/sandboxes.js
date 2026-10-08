const express = require("express");
const SandboxController = require("../controllers/sandboxController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Tüm sandbox'ları getir
router.get("/", requireAuth, SandboxController.getAllSandboxes);

// Belirli bir sandbox'ı getir
router.get("/:id", requireAuth, SandboxController.getSandboxById);

// Yeni sandbox oluştur
router.post("/", requireAdmin, SandboxController.createSandbox);

// Sandbox'ı güncelle
router.put("/:id", requireAdmin, SandboxController.updateSandbox);

// Sandbox'ı sil
router.delete("/:id", requireAdmin, SandboxController.deleteSandbox);

// Business logic routes
// Sandbox imajını başlat
router.post("/:id/initiate", requireAdmin, SandboxController.initiateImage);

// Sandbox imajını durdur
router.post("/:id/stop", requireAdmin, SandboxController.stopImage);

module.exports = router;
