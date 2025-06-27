const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const CategoryService = require("./categoryService");
const TrainingService = require("./trainingService");
const ChapterService = require("./chapterService");
const InstructionService = require("./instructionService");
const WriteUpService = require("./writeUpService");
const AchievementService = require("./achievementService");
const SandboxService = require("./sandboxService");

class AdminService {
  // User management methods
  static async blockUser(userId) {
    const updatedUser = await User.query().patchAndFetchById(userId, {
      blocked: true,
      status: "blocked",
    });

    return {
      userId,
      blocked: true,
      blockedAt: new Date(),
      user: updatedUser,
    };
  }

  static async unblockUser(userId) {
    const updatedUser = await User.query().patchAndFetchById(userId, {
      blocked: false,
      status: "active",
    });

    return {
      userId,
      blocked: false,
      unblockedAt: new Date(),
      user: updatedUser,
    };
  }

  // Category management methods
  static async createCategory(categoryData) {
    return await CategoryService.createCategory(categoryData);
  }

  static async updateCategory(id, categoryData) {
    return await CategoryService.updateCategory(id, categoryData);
  }

  static async deleteCategory(id) {
    return await CategoryService.deleteCategory(id);
  }

  // Training management methods
  static async createTraining(trainingData) {
    return await TrainingService.createTraining(trainingData);
  }

  static async updateTraining(id, trainingData) {
    return await TrainingService.updateTraining(id, trainingData);
  }

  static async deleteTraining(id) {
    return await TrainingService.deleteTraining(id);
  }

  // Chapter management methods
  static async createChapter(chapterData) {
    return await ChapterService.createChapter(chapterData);
  }

  static async updateChapter(id, chapterData) {
    return await ChapterService.updateChapter(id, chapterData);
  }

  static async deleteChapter(id) {
    return await ChapterService.deleteChapter(id);
  }

  // Instruction management methods
  static async createInstruction(instructionData) {
    return await InstructionService.createInstruction(instructionData);
  }

  static async updateInstruction(id, instructionData) {
    return await InstructionService.updateInstruction(id, instructionData);
  }

  static async deleteInstruction(id) {
    return await InstructionService.deleteInstruction(id);
  }

  // WriteUp management methods
  static async createWriteUp(writeUpData) {
    return await WriteUpService.createWriteUp(writeUpData);
  }

  static async updateWriteUp(id, writeUpData) {
    return await WriteUpService.updateWriteUp(id, writeUpData);
  }

  static async deleteWriteUp(id) {
    return await WriteUpService.deleteWriteUp(id);
  }

  // Achievement management methods
  static async createAchievement(achievementData) {
    return await AchievementService.createAchievement(achievementData);
  }

  static async updateAchievement(id, achievementData) {
    return await AchievementService.updateAchievement(id, achievementData);
  }

  static async deleteAchievement(id) {
    return await AchievementService.deleteAchievement(id);
  }

  // Sandbox management methods
  static async createSandbox(sandboxData) {
    return await SandboxService.createSandbox(sandboxData);
  }

  static async updateSandbox(id, sandboxData) {
    return await SandboxService.updateSandbox(id, sandboxData);
  }

  static async deleteSandbox(id) {
    return await SandboxService.deleteSandbox(id);
  }

  // Dashboard and analytics methods
  static async getDashboardStats() {
    // In a real implementation, this would gather various statistics
    const totalEnrollments = await Enrollment.query().count();
    const completedEnrollments = await Enrollment.query()
      .where("completed", true)
      .count();

    return {
      totalUsers: await User.query().count(),
      activeUsers: await User.query().where("status", "active").count(),
      blockedUsers: await User.query().where("blocked", true).count(),
      totalCategories: await CategoryService.getAllCategories().then(
        (categories) => categories.length
      ),
      totalTrainings: await TrainingService.getAllTrainings().then(
        (trainings) => trainings.length
      ),
      totalChapters: await ChapterService.getAllChapters().then(
        (chapters) => chapters.length
      ),
      totalEnrollments: totalEnrollments[0].count,
      completedEnrollments: completedEnrollments[0].count,
      enrollmentCompletionRate:
        totalEnrollments[0].count > 0
          ? (
              (completedEnrollments[0].count / totalEnrollments[0].count) *
              100
            ).toFixed(2)
          : 0,
      generatedAt: new Date(),
    };
  }

  // Enrollment management methods
  static async getAllEnrollments() {
    return await Enrollment.query().withGraphFetched("[user, training]");
  }

  static async getEnrollmentById(id) {
    return await Enrollment.query()
      .findById(id)
      .withGraphFetched("[user, training]");
  }

  static async deleteEnrollment(id) {
    await Enrollment.query().deleteById(id);
    return {
      enrollmentId: id,
      deletedAt: new Date(),
      status: "deleted",
    };
  }
}

module.exports = AdminService;
