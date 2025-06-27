const User = require("../models/User");
const Enrollment = require("../models/Enrollment");

class UserService {
  static async getAllUsers() {
    return await User.query();
  }

  static async getUserById(id) {
    return await User.query().findById(id);
  }

  static async updateUser(id, userData) {
    return await User.query().patchAndFetchById(id, userData);
  }

  static async deleteUser(id) {
    await User.query().deleteById(id);
  }

  // Business logic methods based on UML diagram
  static async earnAchievement(userId, achievementId) {
    // In a real implementation, this would insert into a user_achievements table
    // or update the achievement record with user_id
    return {
      userId,
      achievementId,
      earnedAt: new Date(),
      status: "earned",
    };
  }

  static async getAchievements(userId) {
    const user = await User.query()
      .findById(userId)
      .withGraphFetched("achievements");

    return user ? user.achievements : [];
  }

  static async enrollTraining(userId, trainingId) {
    // Use the TrainingService to create actual enrollment
    const TrainingService = require("./trainingService");
    return await TrainingService.enrollUser(trainingId, userId);
  }

  static async completeTraining(userId, trainingId) {
    // Use the TrainingService to complete actual enrollment
    const TrainingService = require("./trainingService");
    return await TrainingService.completeTraining(trainingId, userId);
  }

  static async getUserEnrollments(userId) {
    return await Enrollment.query()
      .where("user_id", userId)
      .withGraphFetched("training");
  }

  static async startChapter(userId, chapterId) {
    return {
      userId,
      chapterId,
      startedAt: new Date(),
      status: "in_progress",
    };
  }

  static async completeChapter(userId, chapterId) {
    return {
      userId,
      chapterId,
      completedAt: new Date(),
      status: "completed",
    };
  }

  static async getInstruction(userId, instructionId) {
    // In a real implementation, this might include user's progress on the instruction
    const InstructionService = require("./instructionService");
    const instruction = await InstructionService.getInstructionById(
      instructionId
    );

    return {
      instruction,
      userProgress: {
        userId,
        instructionId,
        status: "not_started", // This would come from user progress tracking
        startedAt: null,
        completedAt: null,
      },
    };
  }

  static async getWriteUp(userId, writeUpId) {
    // In a real implementation, this might track user access to write-ups
    const WriteUpService = require("./writeUpService");
    const writeUp = await WriteUpService.getWriteUpById(writeUpId);

    return {
      writeUp,
      userAccess: {
        userId,
        writeUpId,
        accessedAt: new Date(),
        downloadCount: 0, // This would come from user access tracking
      },
    };
  }

  static async uploadProfileImage(userId, imageData) {
    // In a real implementation, this would handle file upload
    const updatedUser = await User.query().patchAndFetchById(userId, {
      profileImage: imageData.url || imageData.path,
    });

    return {
      user: updatedUser,
      image: {
        url: imageData.url,
        uploadedAt: new Date(),
      },
    };
  }
}

module.exports = UserService;
