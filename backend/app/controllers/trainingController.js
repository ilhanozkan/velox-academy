const TrainingService = require("../services/trainingService");

class TrainingController {
  static async getAllTrainings(req, res) {
    try {
      const trainings = await TrainingService.getAllTrainings(req.user.userId);
      res.status(200).json({ trainings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getTrainingById(req, res) {
    try {
      const { id } = req.params;
      const training = await TrainingService.getTrainingById(id);
      if (!training) {
        return res.status(404).json({ error: "Eğitim bulunamadı" });
      }
      res.status(200).json({ training });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async createTraining(req, res) {
    try {
      const trainingData = req.body;
      const newTraining = await TrainingService.createTraining(trainingData);
      res
        .status(201)
        .json({ message: "Eğitim oluşturuldu", training: newTraining });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async updateTraining(req, res) {
    try {
      const { id } = req.params;
      const trainingData = req.body;
      const updatedTraining = await TrainingService.updateTraining(
        id,
        trainingData
      );
      res
        .status(200)
        .json({ message: "Eğitim güncellendi", training: updatedTraining });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async deleteTraining(req, res) {
    try {
      const { id } = req.params;
      await TrainingService.deleteTraining(id);
      res.status(200).json({ message: "Eğitim silindi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  // Business logic endpoints
  static async getChapters(req, res) {
    try {
      const { id } = req.params;
      const chapters = await TrainingService.getChapters(id);
      res.status(200).json({ chapters });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async findChapter(req, res) {
    try {
      const { id, chapterId } = req.params;
      const chapter = await TrainingService.findChapter(id, chapterId);
      if (!chapter) {
        return res.status(404).json({ error: "Bölüm bulunamadı" });
      }
      res.status(200).json({ chapter });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async completeTraining(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId; // Get userId from JWT token
      const result = await TrainingService.completeTraining(id, userId);
      res.status(200).json({
        message: "Eğitim tamamlandı",
        completion: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }

  static async enrollUser(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId; // Get userId from JWT token
      const result = await TrainingService.enrollUser(id, userId);
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
      const userId = req.user.userId; // Get userId from JWT token
      const enrollments = await TrainingService.getUserEnrollments(userId);
      res.status(200).json({ enrollments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getTrainingEnrollments(req, res) {
    try {
      const { id } = req.params;
      const enrollments = await TrainingService.getTrainingEnrollments(id);
      res.status(200).json({ enrollments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  }

  static async getUserSandbox(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId; // Get userId from JWT token

      const sandbox = await TrainingService.getUserSandbox(id, userId);

      if (!sandbox) {
        return res.status(404).json({ error: "Sandbox not found" });
      }

      res.status(200).json({
        sandbox: {
          id: sandbox.id,
          vmInstanceName: sandbox.vm_instance_name,
          vmExternalIp: sandbox.vm_external_ip,
          vmStatus: sandbox.vm_status,
          accessUrl: sandbox.vm_external_ip
            ? `http://${sandbox.vm_external_ip}:9000`
            : null,
          createdAt: sandbox.created_at,
          updatedAt: sandbox.updated_at,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }

  static async deleteUserSandbox(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId; // Get userId from JWT token

      const result = await TrainingService.deleteUserSandbox(id, userId);
      res.status(200).json({
        message: "Sandbox deleted successfully",
        result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Sunucu hatası" });
    }
  }
}

module.exports = TrainingController;
