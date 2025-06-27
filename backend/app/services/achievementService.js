const Achievement = require("../models/Achievement");

class AchievementService {
  static async getAllAchievements() {
    return await Achievement.query();
  }

  static async getAchievementById(id) {
    return await Achievement.query().findById(id);
  }

  static async createAchievement(achievementData) {
    return await Achievement.query().insert(achievementData);
  }

  static async updateAchievement(id, achievementData) {
    return await Achievement.query().patchAndFetchById(id, achievementData);
  }

  static async deleteAchievement(id) {
    await Achievement.query().deleteById(id);
  }
}

module.exports = AchievementService;
