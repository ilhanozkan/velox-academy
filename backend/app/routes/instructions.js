const express = require("express");
const InstructionController = require("../controllers/instructionController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Tüm yönergeleri getir
router.get("/", InstructionController.getAllInstructions);

// Belirli bir yönergeyi getir
router.get("/:id", InstructionController.getInstructionById);

// Yeni yönerge oluştur
router.post("/", authMiddleware, InstructionController.createInstruction);

// Yönergeyi güncelle
router.put("/:id", authMiddleware, InstructionController.updateInstruction);

// Yönergeyi sil
router.delete("/:id", authMiddleware, InstructionController.deleteInstruction);

// Business logic routes
// Yönergeyi tamamla
router.post(
  "/:id/complete",
  authMiddleware,
  InstructionController.completeInstruction
);

module.exports = router;
