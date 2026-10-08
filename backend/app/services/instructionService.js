const Instruction = require("../models/Instruction");
const { notFound } = require("../utils/httpError");
const ProgressService = require("./progressService");

// Columns an admin may set on an instruction.
const INSTRUCTION_FIELDS = ["id", "name", "description", "content", "chapter_id", "position"];

class InstructionService {
  static get FIELDS() {
    return INSTRUCTION_FIELDS;
  }

  static async getAllInstructions() {
    return await Instruction.query().orderBy(["chapter_id", "position"]);
  }

  static async getInstructionById(id) {
    return await Instruction.query().findById(id);
  }

  static async createInstruction(instructionData) {
    // New instructions go to the end of the chapter unless a position is given.
    if (instructionData.position === undefined && instructionData.chapter_id) {
      const { max } = await Instruction.query()
        .where("chapter_id", instructionData.chapter_id)
        .max("position as max")
        .first();
      instructionData = { ...instructionData, position: (max || 0) + 1 };
    }
    return await Instruction.query().insert(instructionData);
  }

  static async updateInstruction(id, instructionData) {
    const { id: _ignored, ...changes } = instructionData;
    const instruction = await Instruction.query().patchAndFetchById(id, changes);
    if (!instruction) throw notFound("Yönerge bulunamadı");
    return instruction;
  }

  static async deleteInstruction(id) {
    const deleted = await Instruction.query().deleteById(id);
    if (!deleted) throw notFound("Yönerge bulunamadı");
  }

  // Business logic methods based on UML diagram
  static async completeInstruction(instructionId, userId) {
    return await ProgressService.completeInstruction(userId, instructionId);
  }

  static async uncompleteInstruction(instructionId, userId) {
    return await ProgressService.uncompleteInstruction(userId, instructionId);
  }
}

module.exports = InstructionService;
