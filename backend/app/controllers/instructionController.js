const InstructionService = require("../services/instructionService");

class InstructionController {
  static async getAllInstructions(req, res) {
    try {
      const instructions = await InstructionService.getAllInstructions();
      res.status(200).json({ instructions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getInstructionById(req, res) {
    try {
      const { id } = req.params;
      const instruction = await InstructionService.getInstructionById(id);
      if (!instruction) {
        return res.status(404).json({ error: "Yönerge bulunamadı" });
      }
      res.status(200).json({ instruction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async createInstruction(req, res) {
    try {
      const instructionData = req.body;
      const newInstruction = await InstructionService.createInstruction(
        instructionData
      );
      res
        .status(201)
        .json({ message: "Yönerge oluşturuldu", instruction: newInstruction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateInstruction(req, res) {
    try {
      const { id } = req.params;
      const instructionData = req.body;
      const updatedInstruction = await InstructionService.updateInstruction(
        id,
        instructionData
      );
      res.status(200).json({
        message: "Yönerge güncellendi",
        instruction: updatedInstruction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteInstruction(req, res) {
    try {
      const { id } = req.params;
      await InstructionService.deleteInstruction(id);
      res.status(200).json({ message: "Yönerge silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Business logic endpoints
  static async completeInstruction(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const result = await InstructionService.completeInstruction(id, userId);
      res.status(200).json({
        message: "Yönerge tamamlandı",
        completion: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = InstructionController;
