const AdminService = require("../services/adminService");

class AdminController {
  // User management endpoints
  static async blockUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await AdminService.blockUser(userId);
      res.status(200).json({
        message: "Kullanıcı engellendi",
        block: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async unblockUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await AdminService.unblockUser(userId);
      res.status(200).json({
        message: "Kullanıcı engeli kaldırıldı",
        unblock: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Category management endpoints
  static async createCategory(req, res) {
    try {
      const categoryData = req.body;
      const newCategory = await AdminService.createCategory(categoryData);
      res.status(201).json({
        message: "Kategori oluşturuldu",
        category: newCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      const updatedCategory = await AdminService.updateCategory(
        id,
        categoryData
      );
      res.status(200).json({
        message: "Kategori güncellendi",
        category: updatedCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await AdminService.deleteCategory(id);
      res.status(200).json({ message: "Kategori silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Training management endpoints
  static async createTraining(req, res) {
    try {
      const trainingData = req.body;
      const newTraining = await AdminService.createTraining(trainingData);
      res.status(201).json({
        message: "Eğitim oluşturuldu",
        training: newTraining,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateTraining(req, res) {
    try {
      const { id } = req.params;
      const trainingData = req.body;
      const updatedTraining = await AdminService.updateTraining(
        id,
        trainingData
      );
      res.status(200).json({
        message: "Eğitim güncellendi",
        training: updatedTraining,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteTraining(req, res) {
    try {
      const { id } = req.params;
      await AdminService.deleteTraining(id);
      res.status(200).json({ message: "Eğitim silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Chapter management endpoints
  static async createChapter(req, res) {
    try {
      const chapterData = req.body;
      const newChapter = await AdminService.createChapter(chapterData);
      res.status(201).json({
        message: "Bölüm oluşturuldu",
        chapter: newChapter,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateChapter(req, res) {
    try {
      const { id } = req.params;
      const chapterData = req.body;
      const updatedChapter = await AdminService.updateChapter(id, chapterData);
      res.status(200).json({
        message: "Bölüm güncellendi",
        chapter: updatedChapter,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteChapter(req, res) {
    try {
      const { id } = req.params;
      await AdminService.deleteChapter(id);
      res.status(200).json({ message: "Bölüm silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Instruction management endpoints
  static async createInstruction(req, res) {
    try {
      const instructionData = req.body;
      const newInstruction = await AdminService.createInstruction(
        instructionData
      );
      res.status(201).json({
        message: "Yönerge oluşturuldu",
        instruction: newInstruction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateInstruction(req, res) {
    try {
      const { id } = req.params;
      const instructionData = req.body;
      const updatedInstruction = await AdminService.updateInstruction(
        id,
        instructionData
      );
      res.status(200).json({
        message: "Yönerge güncellendi",
        instruction: updatedInstruction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteInstruction(req, res) {
    try {
      const { id } = req.params;
      await AdminService.deleteInstruction(id);
      res.status(200).json({ message: "Yönerge silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // WriteUp management endpoints
  static async createWriteUp(req, res) {
    try {
      const writeUpData = req.body;
      const newWriteUp = await AdminService.createWriteUp(writeUpData);
      res.status(201).json({
        message: "Yazı oluşturuldu",
        writeUp: newWriteUp,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateWriteUp(req, res) {
    try {
      const { id } = req.params;
      const writeUpData = req.body;
      const updatedWriteUp = await AdminService.updateWriteUp(id, writeUpData);
      res.status(200).json({
        message: "Yazı güncellendi",
        writeUp: updatedWriteUp,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteWriteUp(req, res) {
    try {
      const { id } = req.params;
      await AdminService.deleteWriteUp(id);
      res.status(200).json({ message: "Yazı silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Achievement management endpoints
  static async createAchievement(req, res) {
    try {
      const achievementData = req.body;
      const newAchievement = await AdminService.createAchievement(
        achievementData
      );
      res.status(201).json({
        message: "Başarı oluşturuldu",
        achievement: newAchievement,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateAchievement(req, res) {
    try {
      const { id } = req.params;
      const achievementData = req.body;
      const updatedAchievement = await AdminService.updateAchievement(
        id,
        achievementData
      );
      res.status(200).json({
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
      await AdminService.deleteAchievement(id);
      res.status(200).json({ message: "Başarı silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Sandbox management endpoints
  static async createSandbox(req, res) {
    try {
      const sandboxData = req.body;
      const newSandbox = await AdminService.createSandbox(sandboxData);
      res.status(201).json({
        message: "Sandbox oluşturuldu",
        sandbox: newSandbox,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateSandbox(req, res) {
    try {
      const { id } = req.params;
      const sandboxData = req.body;
      const updatedSandbox = await AdminService.updateSandbox(id, sandboxData);
      res.status(200).json({
        message: "Sandbox güncellendi",
        sandbox: updatedSandbox,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteSandbox(req, res) {
    try {
      const { id } = req.params;
      await AdminService.deleteSandbox(id);
      res.status(200).json({ message: "Sandbox silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Dashboard and analytics endpoints
  static async getDashboardStats(req, res) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({ stats });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }
}

module.exports = AdminController;
