const express = require("express");
const SandboxController = require("../controllers/sandboxController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Tüm sandbox'ları getir
router.get("/", SandboxController.getAllSandboxes);

// Belirli bir sandbox'ı getir
router.get("/:id", SandboxController.getSandboxById);

// Yeni sandbox oluştur
router.post("/", authMiddleware, SandboxController.createSandbox);

// Sandbox'ı güncelle
router.put("/:id", authMiddleware, SandboxController.updateSandbox);

// Sandbox'ı sil
router.delete("/:id", authMiddleware, SandboxController.deleteSandbox);

// Business logic routes
// Sandbox imajını başlat
router.post("/:id/initiate", authMiddleware, SandboxController.initiateImage);

// Sandbox imajını durdur
router.post("/:id/stop", authMiddleware, SandboxController.stopImage);

module.exports = router;
