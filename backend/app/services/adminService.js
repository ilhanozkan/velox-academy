const db = require("../config/db");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const { notFound, conflict } = require("../utils/httpError");
const CategoryService = require("./categoryService");
const TrainingService = require("./trainingService");
const ChapterService = require("./chapterService");
const InstructionService = require("./instructionService");
const WriteUpService = require("./writeUpService");
const AchievementService = require("./achievementService");
const SandboxService = require("./sandboxService");

const count = async (query) => Number((await query.count("* as count").first()).count);

class AdminService {
  // User management methods
  static async listUsers() {
    const users = await User.query().orderBy("id");

    const enrollmentCounts = Object.fromEntries(
      (
        await db("enrollments")
          .select("user_id")
          .count("* as total")
          .count({ completed: db.raw("case when completed then 1 end") })
          .groupBy("user_id")
      ).map((row) => [row.user_id, row])
    );
    const achievementCounts = Object.fromEntries(
      (
        await db("user_achievements").select("user_id").count("* as total").groupBy("user_id")
      ).map((row) => [row.user_id, Number(row.total)])
    );

    return users.map((user) => ({
      ...user.toJSON(),
      enrollmentCount: Number(enrollmentCounts[user.id]?.total || 0),
      completedTrainingCount: Number(enrollmentCounts[user.id]?.completed || 0),
      achievementCount: achievementCounts[user.id] || 0,
    }));
  }

  static async setStatus(actor, userId, status) {
    if (Number(userId) === actor.id)
      throw conflict("Kendi hesabınızın durumunu değiştiremezsiniz");

    const user = await User.query().patchAndFetchById(userId, {
      status,
      blocked_at: status === "blocked" ? new Date().toISOString() : null,
    });
    if (!user) throw notFound("Kullanıcı bulunamadı");
    return user;
  }

  static async blockUser(actor, userId) {
    const user = await this.setStatus(actor, userId, "blocked");
    return { userId: user.id, blocked: true, blockedAt: user.blocked_at, user };
  }

  static async unblockUser(actor, userId) {
    const user = await this.setStatus(actor, userId, "active");
    return { userId: user.id, blocked: false, unblockedAt: new Date(), user };
  }

  static async setRole(actor, userId, role) {
    if (Number(userId) === actor.id)
      throw conflict("Kendi rolünüzü değiştiremezsiniz");

    const user = await User.query().patchAndFetchById(userId, { role });
    if (!user) throw notFound("Kullanıcı bulunamadı");
    return user;
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
    const totalEnrollments = await count(db("enrollments"));
    const completedEnrollments = await count(db("enrollments").where("completed", true));

    const popularTrainings = await db("trainings as t")
      .leftJoin("enrollments as e", "e.training_id", "t.id")
      .select("t.id", "t.name")
      .count("e.id as enrollments")
      .count({ completed: db.raw("case when e.completed then 1 end") })
      .groupBy("t.id", "t.name")
      .orderBy([{ column: "enrollments", order: "desc" }, { column: "t.name" }])
      .limit(5);

    const recentEnrollments = await Enrollment.query()
      .withGraphFetched("[user, training]")
      .orderBy("created_at", "desc")
      .limit(8);

    return {
      totalUsers: await count(db("users")),
      activeUsers: await count(db("users").where("status", "active")),
      blockedUsers: await count(db("users").where("status", "blocked")),
      adminUsers: await count(db("users").where("role", "admin")),
      totalCategories: await count(db("categories")),
      totalTrainings: await count(db("trainings")),
      totalChapters: await count(db("chapters")),
      totalInstructions: await count(db("instructions")),
      totalEnrollments,
      completedEnrollments,
      enrollmentCompletionRate:
        totalEnrollments > 0
          ? Number(((completedEnrollments / totalEnrollments) * 100).toFixed(2))
          : 0,
      completedInstructions: await count(db("instruction_completions")),
      achievementsEarned: await count(db("user_achievements")),
      runningSandboxes: await count(db("user_sandboxes").where("vm_status", "running")),
      popularTrainings: popularTrainings.map((t) => ({
        ...t,
        enrollments: Number(t.enrollments),
        completed: Number(t.completed),
      })),
      recentEnrollments,
      generatedAt: new Date(),
    };
  }

  // Enrollment management methods
  static async getAllEnrollments() {
    return await Enrollment.query()
      .withGraphFetched("[user, training]")
      .orderBy("created_at", "desc");
  }

  static async getEnrollmentById(id) {
    return await Enrollment.query()
      .findById(id)
      .withGraphFetched("[user, training]");
  }

  static async deleteEnrollment(id) {
    const deleted = await Enrollment.query().deleteById(id);
    if (!deleted) throw notFound("Kayıt bulunamadı");

    return { enrollmentId: Number(id), deletedAt: new Date(), status: "deleted" };
  }
}

module.exports = AdminService;
