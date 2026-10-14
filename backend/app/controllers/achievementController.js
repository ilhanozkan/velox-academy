const AchievementService = require("../services/achievementService");
const { notFound, pick, wrapController } = require("../utils/httpError");

class AchievementController {
  static async getAllAchievements(req, res) {
    const achievements = await AchievementService.getAllAchievements();
    res.status(200).json({ achievements });
  }

  static async getAchievementById(req, res) {
    const achievement = await AchievementService.getAchievementById(req.params.id);
    if (!achievement) throw notFound("Başarı bulunamadı");
    res.status(200).json({ achievement });
  }

  static async createAchievement(req, res) {
    const achievement = await AchievementService.createAchievement(pick(req.body, AchievementService.FIELDS));
    res.status(201).json({ message: "Başarı oluşturuldu", achievement });
  }

  static async updateAchievement(req, res) {
    const achievement = await AchievementService.updateAchievement(
      req.params.id,
      pick(req.body, AchievementService.FIELDS)
    );
    res.status(200).json({ message: "Başarı güncellendi", achievement });
  }

  static async deleteAchievement(req, res) {
    await AchievementService.deleteAchievement(req.params.id);
    res.status(200).json({ message: "Başarı silindi" });
  }
}

module.exports = wrapController(AchievementController);
