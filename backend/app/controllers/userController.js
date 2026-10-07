const UserService = require("../services/userService");
const { notFound, forbidden, conflict, pick, wrapController } = require("../utils/httpError");

class UserController {
  static async getAllUsers(req, res) {
    const users = await UserService.getAllUsers();
    res.status(200).json({ users });
  }

  static async getUserById(req, res) {
    const user = await UserService.getUserById(req.params.id);
    if (!user) throw notFound("Kullanıcı bulunamadı");
    res.status(200).json({ user });
  }

  // Profile fields only. Admins may additionally reset the password; roles
  // and blocking go through /api/admin. Previously any logged-in user could
  // change any account, including its password (stored unhashed).
  static async updateUser(req, res) {
    const fields = req.currentUser.isAdmin
      ? [...UserService.PROFILE_FIELDS, "password"]
      : UserService.PROFILE_FIELDS;

    const user = await UserService.updateUser(req.params.id, pick(req.body, fields));
    res.status(200).json({ message: "Kullanıcı güncellendi", user });
  }

  static async deleteUser(req, res) {
    if (req.currentUser.isAdmin && String(req.currentUser.id) === String(req.params.id))
      throw conflict("Yönetici hesabınızı buradan silemezsiniz");

    await UserService.deleteUser(req.params.id);
    res.status(200).json({ message: "Kullanıcı silindi" });
  }

  // Business logic endpoints
  static async earnAchievement(req, res) {
    if (!req.currentUser.isAdmin) throw forbidden("Başarılar yalnızca yöneticiler tarafından verilebilir");

    const achievement = await UserService.earnAchievement(req.params.id, req.body?.achievementId);
    res.status(200).json({ message: "Başarı kazanıldı", achievement });
  }

  static async getAchievements(req, res) {
    const achievements = await UserService.getAchievements(req.params.id);
    res.status(200).json({ achievements });
  }

  static async enrollTraining(req, res) {
    const enrollment = await UserService.enrollTraining(req.params.id, req.body?.trainingId);
    res.status(201).json({ message: "Eğitime kayıt olundu", enrollment });
  }

  static async getUserEnrollments(req, res) {
    const enrollments = await UserService.getUserEnrollments(req.params.id);
    res.status(200).json({ enrollments });
  }

  static async completeTraining(req, res) {
    const completion = await UserService.completeTraining(req.params.id, req.body?.trainingId);
    res.status(200).json({ message: "Eğitim tamamlandı", completion });
  }

  static async startChapter(req, res) {
    const chapter = await UserService.startChapter(req.params.id, req.body?.chapterId);
    res.status(200).json({ message: "Bölüm başlatıldı", chapter });
  }

  static async completeChapter(req, res) {
    const completion = await UserService.completeChapter(req.params.id, req.body?.chapterId);
    res.status(200).json({ message: "Bölüm tamamlandı", completion });
  }

  static async getInstruction(req, res) {
    const result = await UserService.getInstruction(req.params.id, req.params.instructionId);
    res.status(200).json(result);
  }

  static async getWriteUp(req, res) {
    const result = await UserService.getWriteUp(req.params.id, req.params.writeUpId);
    res.status(200).json(result);
  }

  static async getStats(req, res) {
    const stats = await UserService.getStats(req.params.id);
    res.status(200).json({ stats });
  }

  static async uploadProfileImage(req, res) {
    const upload = await UserService.uploadProfileImage(req.params.id, req.file);
    res.status(200).json({ message: "Profil resmi yüklendi", upload });
  }

  static async removeProfileImage(req, res) {
    const user = await UserService.removeProfileImage(req.params.id);
    res.status(200).json({ message: "Profil resmi kaldırıldı", user });
  }
}

module.exports = wrapController(UserController);
