const InstructionService = require("../services/instructionService");
const { notFound, pick, wrapController } = require("../utils/httpError");

class InstructionController {
  static async getAllInstructions(req, res) {
    const instructions = await InstructionService.getAllInstructions();
    res.status(200).json({ instructions });
  }

  static async getInstructionById(req, res) {
    const instruction = await InstructionService.getInstructionById(req.params.id);
    if (!instruction) throw notFound("Yönerge bulunamadı");
    res.status(200).json({ instruction });
  }

  static async createInstruction(req, res) {
    const instruction = await InstructionService.createInstruction(
      pick(req.body, InstructionService.FIELDS)
    );
    res.status(201).json({ message: "Yönerge oluşturuldu", instruction });
  }

  static async updateInstruction(req, res) {
    const instruction = await InstructionService.updateInstruction(
      req.params.id,
      pick(req.body, InstructionService.FIELDS)
    );
    res.status(200).json({ message: "Yönerge güncellendi", instruction });
  }

  static async deleteInstruction(req, res) {
    await InstructionService.deleteInstruction(req.params.id);
    res.status(200).json({ message: "Yönerge silindi" });
  }

  // Business logic endpoints
  static async completeInstruction(req, res) {
    const completion = await InstructionService.completeInstruction(req.params.id, req.user.userId);
    res.status(200).json({ message: "Yönerge tamamlandı", completion });
  }

  static async uncompleteInstruction(req, res) {
    const completion = await InstructionService.uncompleteInstruction(req.params.id, req.user.userId);
    res.status(200).json({ message: "Yönerge tamamlanmadı olarak işaretlendi", completion });
  }
}

module.exports = wrapController(InstructionController);
