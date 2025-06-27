const Instruction = require("../models/Instruction");

class InstructionService {
  static async getAllInstructions() {
    return await Instruction.query();
  }

  static async getInstructionById(id) {
    return await Instruction.query().findById(id);
  }

  static async createInstruction(instructionData) {
    return await Instruction.query().insert(instructionData);
  }

  static async updateInstruction(id, instructionData) {
    return await Instruction.query().patchAndFetchById(id, instructionData);
  }

  static async deleteInstruction(id) {
    await Instruction.query().deleteById(id);
  }

  // Business logic methods based on UML diagram
  static async completeInstruction(instructionId, userId) {
    // This method would typically:
    // 1. Mark the instruction as completed for the user
    // 2. Award any associated achievements
    // 3. Update user progress

    const instruction = await Instruction.query()
      .findById(instructionId)
      .withGraphFetched("achievements");

    if (!instruction) {
      throw new Error("Instruction not found");
    }

    // Award achievements if any exist for this instruction
    const achievements = [];
    if (instruction.achievements && instruction.achievements.length > 0) {
      for (const achievement of instruction.achievements) {
        achievements.push({
          achievementId: achievement.id,
          userId: userId,
          earnedAt: new Date(),
        });
      }
    }

    return {
      instructionId,
      userId,
      completedAt: new Date(),
      status: "completed",
      achievements: achievements,
    };
  }
}

module.exports = InstructionService;
