const TrainingService = require("../services/trainingService");
const UserSandboxService = require("../services/userSandboxService");
const { notFound, pick, wrapController } = require("../utils/httpError");

class TrainingController {
  static async getAllTrainings(req, res) {
    const trainings = await TrainingService.getAllTrainings(req.user.userId);
    res.status(200).json({ trainings });
  }

  // Curriculum (chapters → instructions) with the user's progress.
  static async getTrainingById(req, res) {
    const training = await TrainingService.getTrainingDetail(req.params.id, req.user.userId);
    if (!training) throw notFound("Eğitim bulunamadı");
    res.status(200).json({ training });
  }

  static async createTraining(req, res) {
    const training = await TrainingService.createTraining(pick(req.body, TrainingService.FIELDS));
    res.status(201).json({ message: "Eğitim oluşturuldu", training });
  }

  static async updateTraining(req, res) {
    const training = await TrainingService.updateTraining(
      req.params.id,
      pick(req.body, TrainingService.FIELDS)
    );
    res.status(200).json({ message: "Eğitim güncellendi", training });
  }

  static async deleteTraining(req, res) {
    await TrainingService.deleteTraining(req.params.id);
    res.status(200).json({ message: "Eğitim silindi" });
  }

  // Business logic endpoints
  static async getChapters(req, res) {
    const chapters = await TrainingService.getChapters(req.params.id);
    res.status(200).json({ chapters });
  }

  static async findChapter(req, res) {
    const chapter = await TrainingService.findChapter(req.params.id, req.params.chapterId);
    if (!chapter) throw notFound("Bölüm bulunamadı");
    res.status(200).json({ chapter });
  }

  static async completeTraining(req, res) {
    const completion = await TrainingService.completeTraining(req.params.id, req.user.userId);
    res.status(200).json({ message: "Eğitim tamamlandı", completion });
  }

  static async enrollUser(req, res) {
    const enrollment = await TrainingService.enrollUser(req.params.id, req.user.userId);
    res.status(201).json({ message: "Eğitime kayıt olundu", enrollment });
  }

  static async getUserEnrollments(req, res) {
    const enrollments = await TrainingService.getUserEnrollments(req.user.userId);
    res.status(200).json({ enrollments });
  }

  static async getTrainingEnrollments(req, res) {
    const enrollments = await TrainingService.getTrainingEnrollments(req.params.id);
    res.status(200).json({ enrollments });
  }

  static async getUserSandbox(req, res) {
    const sandbox = await UserSandboxService.getUserSandbox(req.user.userId, req.params.id);
    if (!sandbox) throw notFound("Sandbox bulunamadı");
    res.status(200).json({ sandbox: UserSandboxService.serialize(sandbox, { includeToken: true }) });
  }

  // Creates the sandbox if it is missing, deleted or failed (retry button).
  static async createUserSandbox(req, res) {
    const enrolled = await TrainingService.isUserEnrolled(req.params.id, req.user.userId);
    if (!enrolled) throw notFound("Bu eğitime kayıtlı değilsiniz");

    const sandbox = await UserSandboxService.ensureSandbox(req.user.userId, req.params.id, {
      recreate: req.body?.recreate === true,
    });
    res.status(202).json({ sandbox: UserSandboxService.serialize(sandbox, { includeToken: true }) });
  }

  static async deleteUserSandbox(req, res) {
    const result = await UserSandboxService.deleteUserSandbox(req.user.userId, req.params.id);
    res.status(200).json({ message: "Sandbox silindi", result });
  }
}

module.exports = wrapController(TrainingController);
