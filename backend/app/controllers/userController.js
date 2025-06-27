const UserService = require("../services/userService");

class UserController {
  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({ users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const updatedUser = await UserService.updateUser(id, userData);
      res
        .status(200)
        .json({ message: "Kullanıcı güncellendi", user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      res.status(200).json({ message: "Kullanıcı silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Business logic endpoints
  static async earnAchievement(req, res) {
    try {
      const { id } = req.params;
      const { achievementId } = req.body;
      const result = await UserService.earnAchievement(id, achievementId);
      res.status(200).json({
        message: "Başarı kazanıldı",
        achievement: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getAchievements(req, res) {
    try {
      const { id } = req.params;
      const achievements = await UserService.getAchievements(id);
      res.status(200).json({ achievements });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async enrollTraining(req, res) {
    try {
      const { id } = req.params;
      const { trainingId } = req.body;
      const result = await UserService.enrollTraining(id, trainingId);
      res.status(201).json({
        message: "Eğitime kayıt olundu",
        enrollment: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }

  static async getUserEnrollments(req, res) {
    try {
      const { id } = req.params;
      const enrollments = await UserService.getUserEnrollments(id);
      res.status(200).json({ enrollments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async completeTraining(req, res) {
    try {
      const { id } = req.params;
      const { trainingId } = req.body;
      const result = await UserService.completeTraining(id, trainingId);
      res.status(200).json({
        message: "Eğitim tamamlandı",
        completion: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }

  static async startChapter(req, res) {
    try {
      const { id } = req.params;
      const { chapterId } = req.body;
      const result = await UserService.startChapter(id, chapterId);
      res.status(200).json({
        message: "Bölüm başlatıldı",
        chapter: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async completeChapter(req, res) {
    try {
      const { id } = req.params;
      const { chapterId } = req.body;
      const result = await UserService.completeChapter(id, chapterId);
      res.status(200).json({
        message: "Bölüm tamamlandı",
        completion: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getInstruction(req, res) {
    try {
      const { id, instructionId } = req.params;
      const result = await UserService.getInstruction(id, instructionId);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getWriteUp(req, res) {
    try {
      const { id, writeUpId } = req.params;
      const result = await UserService.getWriteUp(id, writeUpId);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async uploadProfileImage(req, res) {
    try {
      const { id } = req.params;
      const imageData = req.body;
      const result = await UserService.uploadProfileImage(id, imageData);
      res.status(200).json({
        message: "Profil resmi yüklendi",
        upload: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }
}

module.exports = UserController;
