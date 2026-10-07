const fs = require("fs/promises");
const path = require("path");

const config = require("../config/env");
const User = require("../models/User");
const UserAchievement = require("../models/UserAchievement");
const Achievement = require("../models/Achievement");
const { notFound, conflict, badRequest, unauthorized } = require("../utils/httpError");
const ProgressService = require("./progressService");
const UserSandboxService = require("./userSandboxService");

// Profile fields users can change themselves; role and status are managed
// through the admin API and the password through changePassword.
const PROFILE_FIELDS = ["username", "email", "full_name"];

const normalize = (data) => ({
  ...data,
  ...(typeof data.email === "string" && { email: data.email.trim().toLowerCase() }),
  ...(typeof data.username === "string" && { username: data.username.trim() }),
  ...(typeof data.full_name === "string" && { full_name: data.full_name.trim() || null }),
});

const AVATAR_DIR = "avatars";

class UserService {
  static get PROFILE_FIELDS() {
    return PROFILE_FIELDS;
  }

  static normalize(data) {
    return normalize(data);
  }

  static async getAllUsers() {
    return await User.query().orderBy("id");
  }

  static async getUserById(id) {
    return await User.query().findById(id);
  }

  static async findByEmail(email) {
    return await User.query()
      .whereRaw("lower(email) = ?", [String(email || "").trim().toLowerCase()])
      .first();
  }

  static async register({ username, email, password, full_name }) {
    const data = normalize({ username, email, password, full_name });

    if (await this.findByEmail(data.email))
      throw conflict("Bu e-posta adresiyle kayıtlı bir hesap zaten var", { email: "Bu e-posta zaten kullanılıyor" });
    if (data.username && (await User.query().where("username", data.username).first()))
      throw conflict("Bu kullanıcı adı alınmış", { username: "Bu kullanıcı adı alınmış" });

    return await User.query().insert({ ...data, role: "user", status: "active" });
  }

  static async updateUser(id, userData) {
    const data = normalize(userData);

    if (data.email) {
      const owner = await this.findByEmail(data.email);
      if (owner && owner.id !== Number(id))
        throw conflict("Bu e-posta adresi başka bir hesapta kullanılıyor", { email: "Bu e-posta zaten kullanılıyor" });
    }
    if (data.username) {
      const owner = await User.query().where("username", data.username).first();
      if (owner && owner.id !== Number(id))
        throw conflict("Bu kullanıcı adı alınmış", { username: "Bu kullanıcı adı alınmış" });
    }

    const user = await User.query().patchAndFetchById(id, data);
    if (!user) throw notFound("Kullanıcı bulunamadı");
    return user;
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.query().findById(userId);
    if (!user) throw notFound("Kullanıcı bulunamadı");

    if (!(await user.verifyPassword(currentPassword)))
      throw unauthorized("Mevcut parolanız hatalı");
    if (typeof newPassword !== "string" || !newPassword)
      throw badRequest("Yeni parola zorunludur", { newPassword: "Yeni parola zorunludur" });

    // The model validates the length and hashes the new password.
    return await User.query().patchAndFetchById(userId, { password: newPassword });
  }

  static async deleteUser(id) {
    const user = await User.query().findById(id);
    if (!user) throw notFound("Kullanıcı bulunamadı");

    // Cascades remove the sandbox rows, so release the VMs behind them first.
    await UserSandboxService.releaseAll({ user_id: user.id });
    await User.query().deleteById(user.id);
    await this.removeAvatarFile(user.profile_image);
  }

  // Business logic methods based on UML diagram
  static async earnAchievement(userId, achievementId) {
    const achievement = await Achievement.query().findById(achievementId);
    if (!achievement) throw notFound("Başarı bulunamadı");

    const inserted = await UserAchievement.query()
      .insert({ user_id: Number(userId), achievement_id: achievementId })
      .onConflict(["user_id", "achievement_id"])
      .ignore();

    return {
      userId: Number(userId),
      achievementId,
      status: inserted?.id ? "earned" : "already_earned",
    };
  }

  static async getAchievements(userId) {
    return await Achievement.query()
      .select("achievements.*", "user_achievements.earned_at")
      .join("user_achievements", "user_achievements.achievement_id", "achievements.id")
      .where("user_achievements.user_id", userId)
      .orderBy("user_achievements.earned_at", "desc");
  }

  static async enrollTraining(userId, trainingId) {
    const TrainingService = require("./trainingService");
    return await TrainingService.enrollUser(trainingId, userId);
  }

  static async completeTraining(userId, trainingId) {
    return await ProgressService.completeTraining(userId, trainingId);
  }

  static async getUserEnrollments(userId) {
    const TrainingService = require("./trainingService");
    return await TrainingService.getUserEnrollments(userId);
  }

  static async startChapter(userId, chapterId) {
    const Chapter = require("../models/Chapter");
    const chapter = await Chapter.query().findById(chapterId).withGraphFetched("instructions");
    if (!chapter) throw notFound("Bölüm bulunamadı");

    await ProgressService.requireEnrollment(userId, chapter.training_id);
    const done = await ProgressService.completedInstructionIds(
      userId,
      chapter.instructions.map((i) => i.id)
    );

    return {
      userId: Number(userId),
      chapterId,
      status: done.size && done.size === chapter.instructions.length ? "completed" : "in_progress",
      completedInstructions: done.size,
      totalInstructions: chapter.instructions.length,
    };
  }

  static async completeChapter(userId, chapterId) {
    return await ProgressService.completeChapter(userId, chapterId);
  }

  static async getInstruction(userId, instructionId) {
    const InstructionService = require("./instructionService");
    const instruction = await InstructionService.getInstructionById(instructionId);
    if (!instruction) throw notFound("Yönerge bulunamadı");

    return {
      instruction,
      userProgress: await ProgressService.getInstructionProgress(userId, instructionId),
    };
  }

  static async getWriteUp(userId, writeUpId) {
    const WriteUpService = require("./writeUpService");
    const writeUp = await WriteUpService.getWriteUpById(writeUpId);
    if (!writeUp) throw notFound("Yazı bulunamadı");

    return { writeUp, userAccess: { userId: Number(userId), writeUpId, accessedAt: new Date() } };
  }

  static async getStats(userId) {
    return await ProgressService.getUserStats(userId);
  }

  /** Stores an uploaded avatar (multer file) and replaces the previous one. */
  static async uploadProfileImage(userId, file) {
    if (!file) throw badRequest("Lütfen bir görsel seçin");

    const user = await User.query().findById(userId);
    if (!user) throw notFound("Kullanıcı bulunamadı");

    const profileImage = `images/${AVATAR_DIR}/${file.filename}`;
    const updatedUser = await User.query().patchAndFetchById(userId, {
      profile_image: profileImage,
    });
    await this.removeAvatarFile(user.profile_image);

    return {
      user: updatedUser,
      image: { url: `/static/${profileImage}`, uploadedAt: new Date() },
    };
  }

  static async removeProfileImage(userId) {
    const user = await User.query().findById(userId);
    if (!user) throw notFound("Kullanıcı bulunamadı");

    const updatedUser = await User.query().patchAndFetchById(userId, { profile_image: null });
    await this.removeAvatarFile(user.profile_image);
    return updatedUser;
  }

  static async removeAvatarFile(profileImage) {
    if (!profileImage?.startsWith(`images/${AVATAR_DIR}/`)) return;

    const file = path.join(config.uploads.imagesDir, AVATAR_DIR, path.basename(profileImage));
    await fs.unlink(file).catch(() => {});
  }
}

UserService.AVATAR_DIR = AVATAR_DIR;

module.exports = UserService;
