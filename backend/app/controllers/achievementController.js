const AchievementService = require("../services/achievementService");

class AchievementController {
  static async getAllAchievements(req, res) {
    try {
      const achievements = await AchievementService.getAllAchievements();
      res.status(200).json({ achievements });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getAchievementById(req, res) {
    try {
      const { id } = req.params;
      const achievement = await AchievementService.getAchievementById(id);
      if (!achievement) {
        return res.status(404).json({ error: "Başarı bulunamadı" });
      }
      res.status(200).json({ achievement });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async createAchievement(req, res) {
    try {
      const achievementData = req.body;
      const newAchievement = await AchievementService.createAchievement(
        achievementData
      );
      res
        .status(201)
        .json({ message: "Başarı oluşturuldu", achievement: newAchievement });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateAchievement(req, res) {
    try {
      const { id } = req.params;
      const achievementData = req.body;
      const updatedAchievement = await AchievementService.updateAchievement(
        id,
        achievementData
      );
      res
        .status(200)
        .json({
          message: "Başarı güncellendi",
          achievement: updatedAchievement,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteAchievement(req, res) {
    try {
      const { id } = req.params;
      await AchievementService.deleteAchievement(id);
      res.status(200).json({ message: "Başarı silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }
}

module.exports = AchievementController;
