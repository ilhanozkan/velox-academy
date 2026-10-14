const Achievement = require("../models/Achievement");
const { notFound } = require("../utils/httpError");

// Columns an admin may set on an achievement.
const ACHIEVEMENT_FIELDS = ["id", "name", "description", "instruction_id", "icon", "points"];

class AchievementService {
  static get FIELDS() {
    return ACHIEVEMENT_FIELDS;
  }

  static async getAllAchievements() {
    return await Achievement.query().orderBy("name");
  }

  static async getAchievementById(id) {
    return await Achievement.query().findById(id);
  }

  static async createAchievement(achievementData) {
    return await Achievement.query().insert(achievementData);
  }

  static async updateAchievement(id, achievementData) {
    const { id: _ignored, ...changes } = achievementData;
    const achievement = await Achievement.query().patchAndFetchById(id, changes);
    if (!achievement) throw notFound("Başarı bulunamadı");
    return achievement;
  }

  static async deleteAchievement(id) {
    const deleted = await Achievement.query().deleteById(id);
    if (!deleted) throw notFound("Başarı bulunamadı");
  }
}

module.exports = AchievementService;
