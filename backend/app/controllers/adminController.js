const AdminService = require("../services/adminService");
const CategoryService = require("../services/categoryService");
const TrainingService = require("../services/trainingService");
const ChapterService = require("../services/chapterService");
const InstructionService = require("../services/instructionService");
const WriteUpService = require("../services/writeUpService");
const AchievementService = require("../services/achievementService");
const SandboxService = require("../services/sandboxService");
const User = require("../models/User");
const { badRequest, notFound, pick, wrapController } = require("../utils/httpError");
const { FIELDS: CATEGORY_FIELDS } = require("./categoryController");

class AdminController {
  // User management endpoints
  static async listUsers(req, res) {
    const users = await AdminService.listUsers();
    res.status(200).json({ users });
  }

  static async blockUser(req, res) {
    const block = await AdminService.blockUser(req.currentUser, req.params.userId);
    res.status(200).json({ message: "Kullanıcı engellendi", block });
  }

  static async unblockUser(req, res) {
    const unblock = await AdminService.unblockUser(req.currentUser, req.params.userId);
    res.status(200).json({ message: "Kullanıcı engeli kaldırıldı", unblock });
  }

  static async setRole(req, res) {
    const { role } = req.body || {};
    if (!User.ROLES.includes(role))
      throw badRequest(`Rol şunlardan biri olmalıdır: ${User.ROLES.join(", ")}`);

    const user = await AdminService.setRole(req.currentUser, req.params.userId, role);
    res.status(200).json({ message: "Kullanıcı rolü güncellendi", user });
  }

  // Category management endpoints
  static async createCategory(req, res) {
    const category = await AdminService.createCategory(pick(req.body, CATEGORY_FIELDS));
    res.status(201).json({ message: "Kategori oluşturuldu", category });
  }

  static async updateCategory(req, res) {
    const category = await AdminService.updateCategory(req.params.id, pick(req.body, CATEGORY_FIELDS));
    res.status(200).json({ message: "Kategori güncellendi", category });
  }

  static async deleteCategory(req, res) {
    await AdminService.deleteCategory(req.params.id);
    res.status(200).json({ message: "Kategori silindi" });
  }

  // Training management endpoints
  static async createTraining(req, res) {
    const training = await AdminService.createTraining(pick(req.body, TrainingService.FIELDS));
    res.status(201).json({ message: "Eğitim oluşturuldu", training });
  }

  static async updateTraining(req, res) {
    const training = await AdminService.updateTraining(
      req.params.id,
      pick(req.body, TrainingService.FIELDS)
    );
    res.status(200).json({ message: "Eğitim güncellendi", training });
  }

  static async deleteTraining(req, res) {
    await AdminService.deleteTraining(req.params.id);
    res.status(200).json({ message: "Eğitim silindi" });
  }

  // Chapter management endpoints
  static async createChapter(req, res) {
    const chapter = await AdminService.createChapter(pick(req.body, ChapterService.FIELDS));
    res.status(201).json({ message: "Bölüm oluşturuldu", chapter });
  }

  static async updateChapter(req, res) {
    const chapter = await AdminService.updateChapter(req.params.id, pick(req.body, ChapterService.FIELDS));
    res.status(200).json({ message: "Bölüm güncellendi", chapter });
  }

  static async deleteChapter(req, res) {
    await AdminService.deleteChapter(req.params.id);
    res.status(200).json({ message: "Bölüm silindi" });
  }

  // Instruction management endpoints
  static async createInstruction(req, res) {
    const instruction = await AdminService.createInstruction(
      pick(req.body, InstructionService.FIELDS)
    );
    res.status(201).json({ message: "Yönerge oluşturuldu", instruction });
  }

  static async updateInstruction(req, res) {
    const instruction = await AdminService.updateInstruction(
      req.params.id,
      pick(req.body, InstructionService.FIELDS)
    );
    res.status(200).json({ message: "Yönerge güncellendi", instruction });
  }

  static async deleteInstruction(req, res) {
    await AdminService.deleteInstruction(req.params.id);
    res.status(200).json({ message: "Yönerge silindi" });
  }

  // WriteUp management endpoints
  static async createWriteUp(req, res) {
    const writeUp = await AdminService.createWriteUp(pick(req.body, WriteUpService.FIELDS));
    res.status(201).json({ message: "Yazı oluşturuldu", writeUp });
  }

  static async updateWriteUp(req, res) {
    const writeUp = await AdminService.updateWriteUp(req.params.id, pick(req.body, WriteUpService.FIELDS));
    res.status(200).json({ message: "Yazı güncellendi", writeUp });
  }

  static async deleteWriteUp(req, res) {
    await AdminService.deleteWriteUp(req.params.id);
    res.status(200).json({ message: "Yazı silindi" });
  }

  // Achievement management endpoints
  static async createAchievement(req, res) {
    const achievement = await AdminService.createAchievement(
      pick(req.body, AchievementService.FIELDS)
    );
    res.status(201).json({ message: "Başarı oluşturuldu", achievement });
  }

  static async updateAchievement(req, res) {
    const achievement = await AdminService.updateAchievement(
      req.params.id,
      pick(req.body, AchievementService.FIELDS)
    );
    res.status(200).json({ message: "Başarı güncellendi", achievement });
  }

  static async deleteAchievement(req, res) {
    await AdminService.deleteAchievement(req.params.id);
    res.status(200).json({ message: "Başarı silindi" });
  }

  // Sandbox management endpoints
  static async createSandbox(req, res) {
    const sandbox = await AdminService.createSandbox(pick(req.body, SandboxService.FIELDS));
    res.status(201).json({ message: "Sandbox oluşturuldu", sandbox });
  }

  static async updateSandbox(req, res) {
    const sandbox = await AdminService.updateSandbox(req.params.id, pick(req.body, SandboxService.FIELDS));
    res.status(200).json({ message: "Sandbox güncellendi", sandbox });
  }

  static async deleteSandbox(req, res) {
    await AdminService.deleteSandbox(req.params.id);
    res.status(200).json({ message: "Sandbox silindi" });
  }

  // Enrollment management endpoints
  static async getAllEnrollments(req, res) {
    const enrollments = await AdminService.getAllEnrollments();
    res.status(200).json({ enrollments });
  }

  static async getEnrollmentById(req, res) {
    const enrollment = await AdminService.getEnrollmentById(req.params.id);
    if (!enrollment) throw notFound("Kayıt bulunamadı");
    res.status(200).json({ enrollment });
  }

  static async deleteEnrollment(req, res) {
    const result = await AdminService.deleteEnrollment(req.params.id);
    res.status(200).json({ message: "Kayıt silindi", result });
  }

  // Dashboard and analytics endpoints
  static async getDashboardStats(req, res) {
    const stats = await AdminService.getDashboardStats();
    res.status(200).json({ stats });
  }
}

module.exports = wrapController(AdminController);
