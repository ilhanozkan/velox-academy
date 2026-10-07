const { UniqueViolationError } = require("objection");

const db = require("../config/db");
const Training = require("../models/Training");
const Enrollment = require("../models/Enrollment");
const UserSandboxService = require("./userSandboxService");
const ProgressService = require("./progressService");
const { notFound, conflict, HttpError } = require("../utils/httpError");

const percent = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

// Columns an admin may set on a training.
const TRAINING_FIELDS = [
  "id",
  "name",
  "slug",
  "description",
  "image_file_path",
  "category_id",
  "level",
  "estimated_minutes",
  "sandbox_template",
];

class TrainingService {
  static get FIELDS() {
    return TRAINING_FIELDS;
  }

  /** Catalog with per-user enrollment and progress. */
  static async getAllTrainings(userId = null) {
    const trainings = await Training.query()
      .withGraphFetched("category")
      .orderBy("created_at")
      .orderBy("id");

    const counts = await db("chapters")
      .leftJoin("instructions", "instructions.chapter_id", "chapters.id")
      .select("chapters.training_id")
      .count("instructions.id as instructions")
      .countDistinct("chapters.id as chapters")
      .groupBy("chapters.training_id");
    const countsByTraining = Object.fromEntries(counts.map((c) => [c.training_id, c]));

    let enrollments = {};
    let completedByTraining = {};

    if (userId) {
      enrollments = Object.fromEntries(
        (await Enrollment.query().where("user_id", userId)).map((e) => [e.training_id, e])
      );

      const completed = await db("instruction_completions")
        .join("instructions", "instructions.id", "instruction_completions.instruction_id")
        .join("chapters", "chapters.id", "instructions.chapter_id")
        .where("instruction_completions.user_id", userId)
        .select("chapters.training_id")
        .count("* as done")
        .groupBy("chapters.training_id");
      completedByTraining = Object.fromEntries(
        completed.map((c) => [c.training_id, Number(c.done)])
      );
    }

    return trainings.map((training) => {
      const total = Number(countsByTraining[training.id]?.instructions || 0);
      const done = completedByTraining[training.id] || 0;
      const enrollment = enrollments[training.id];

      return {
        ...training.toJSON(),
        chapterCount: Number(countsByTraining[training.id]?.chapters || 0),
        instructionCount: total,
        isEnrolled: Boolean(enrollment),
        isCompleted: Boolean(enrollment?.completed),
        progress: {
          completedInstructions: done,
          totalInstructions: total,
          percent: percent(done, total),
        },
      };
    });
  }

  static async getTrainingById(id) {
    return await Training.query().findById(id);
  }

  /**
   * Training with its ordered curriculum (chapters → instructions, with the
   * markdown content and achievements) and the user's progress on it.
   */
  static async getTrainingDetail(id, userId = null) {
    const training = await Training.query()
      .findById(id)
      .withGraphFetched("[category, chapters.instructions.achievements]");
    if (!training) return null;

    const instructionIds = training.chapters.flatMap((c) => c.instructions.map((i) => i.id));
    const completed = userId
      ? await ProgressService.completedInstructionIds(userId, instructionIds)
      : new Set();
    const enrollment = userId
      ? await Enrollment.query().where({ user_id: userId, training_id: id }).first()
      : null;

    const chapters = training.chapters.map((chapter) => {
      const instructions = chapter.instructions.map((instruction) => ({
        ...instruction.toJSON(),
        completed: completed.has(instruction.id),
      }));
      const done = instructions.filter((i) => i.completed).length;

      return {
        ...chapter.toJSON(),
        instructions,
        completed: instructions.length > 0 && done === instructions.length,
        progress: {
          completedInstructions: done,
          totalInstructions: instructions.length,
          percent: percent(done, instructions.length),
        },
      };
    });

    return {
      ...training.toJSON(),
      chapters,
      isEnrolled: Boolean(enrollment),
      isCompleted: Boolean(enrollment?.completed),
      progress: {
        completedInstructions: completed.size,
        totalInstructions: instructionIds.length,
        percent: percent(completed.size, instructionIds.length),
      },
    };
  }

  static async createTraining(trainingData) {
    return await Training.query().insert(trainingData);
  }

  static async updateTraining(id, trainingData) {
    const { id: _ignored, ...changes } = trainingData;
    const training = await Training.query().patchAndFetchById(id, changes);
    if (!training) throw notFound("Eğitim bulunamadı");
    return training;
  }

  static async deleteTraining(id) {
    const training = await Training.query().findById(id);
    if (!training) throw notFound("Eğitim bulunamadı");

    // Cascades remove the sandbox rows, so release the VMs behind them first.
    await UserSandboxService.releaseAll({ training_id: id });
    await Training.query().deleteById(id);
  }

  static async getChapters(trainingId) {
    const training = await Training.query()
      .findById(trainingId)
      .withGraphFetched("chapters");
    if (!training) throw notFound("Eğitim bulunamadı");
    return training.chapters;
  }

  static async findChapter(trainingId, chapterId) {
    const chapters = await this.getChapters(trainingId);
    return chapters.find((chapter) => chapter.id === chapterId) || null;
  }

  static async isUserEnrolled(trainingId, userId) {
    const enrollment = await Enrollment.query()
      .where({ user_id: userId, training_id: trainingId })
      .first();
    return Boolean(enrollment);
  }

  static async completeTraining(trainingId, userId) {
    return await ProgressService.completeTraining(userId, trainingId);
  }

  /**
   * Enrolls the user and starts provisioning their sandbox in the background.
   * Enrollment succeeds even if sandboxes are unavailable; the learner can
   * retry the sandbox from the training page.
   */
  static async enrollUser(trainingId, userId) {
    const training = await Training.query().findById(trainingId);
    if (!training) throw notFound("Eğitim bulunamadı");

    let enrollment;
    try {
      enrollment = await Enrollment.query().insert({
        user_id: Number(userId),
        training_id: trainingId,
        completed: false,
      });
    } catch (error) {
      if (error instanceof UniqueViolationError)
        throw conflict("Bu eğitime zaten kayıtlısınız");
      throw error;
    }

    let sandbox = null;
    let sandboxError = null;
    try {
      sandbox = await UserSandboxService.ensureSandbox(Number(userId), trainingId);
    } catch (error) {
      if (!(error instanceof HttpError)) throw error;
      sandboxError = error.message;
    }

    return {
      trainingId,
      userId: Number(userId),
      enrolledAt: enrollment.created_at,
      status: "enrolled",
      enrollment,
      sandbox: UserSandboxService.serialize(sandbox, { includeToken: true }),
      sandboxError,
    };
  }

  static async getUserEnrollments(userId) {
    const enrollments = await Enrollment.query()
      .where("user_id", userId)
      .withGraphFetched("training")
      .orderBy("created_at", "desc");

    return await Promise.all(
      enrollments.map(async (enrollment) => ({
        ...enrollment.toJSON(),
        progress: await ProgressService.getTrainingProgress(userId, enrollment.training_id),
      }))
    );
  }

  static async getTrainingEnrollments(trainingId) {
    return await Enrollment.query()
      .where("training_id", trainingId)
      .withGraphFetched("user")
      .orderBy("created_at", "desc");
  }
}

module.exports = TrainingService;
