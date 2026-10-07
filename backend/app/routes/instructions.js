const express = require("express");
const InstructionController = require("../controllers/instructionController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Tüm yönergeleri getir
router.get("/", InstructionController.getAllInstructions);

// Belirli bir yönergeyi getir
router.get("/:id", InstructionController.getInstructionById);

// Yeni yönerge oluştur
router.post("/", requireAdmin, InstructionController.createInstruction);

// Yönergeyi güncelle
router.put("/:id", requireAdmin, InstructionController.updateInstruction);

// Yönergeyi sil
router.delete("/:id", requireAdmin, InstructionController.deleteInstruction);

// Business logic routes
// Yönergeyi tamamla
router.post("/:id/complete", requireAuth, InstructionController.completeInstruction);

// Yönergeyi tamamlanmadı olarak işaretle
router.delete("/:id/complete", requireAuth, InstructionController.uncompleteInstruction);

module.exports = router;
