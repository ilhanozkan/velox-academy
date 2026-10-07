const db = require("../config/db");
const Instruction = require("../models/Instruction");
const Chapter = require("../models/Chapter");
const Enrollment = require("../models/Enrollment");
const Achievement = require("../models/Achievement");
const { notFound, forbidden, conflict } = require("../utils/httpError");

const percent = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

/**
 * Learning progress: completed instructions and chapters, training completion
 * and the achievements they award. All writes are idempotent, so repeating a
 * request (double click, retry) never awards anything twice.
 */
class ProgressService {
  static async requireEnrollment(userId, trainingId, trx) {
    const enrollment = await Enrollment.query(trx)
      .where({ user_id: userId, training_id: trainingId })
      .first();

    if (!enrollment) throw forbidden("Önce bu eğitime kayıt olmalısınız");
    return enrollment;
  }

  /** Instruction ids of a training, in curriculum order. */
  static async trainingInstructionIds(trainingId, trx) {
    const rows = await Instruction.query(trx)
      .select("instructions.id", "instructions.chapter_id")
      .join("chapters", "chapters.id", "instructions.chapter_id")
      .where("chapters.training_id", trainingId)
      .orderBy(["chapters.position", "instructions.position"]);
    return rows;
  }

  static async completedInstructionIds(userId, instructionIds, trx) {
    if (!instructionIds.length) return new Set();

    const rows = await (trx || db)("instruction_completions")
      .where("user_id", userId)
      .whereIn("instruction_id", instructionIds)
      .select("instruction_id");
    return new Set(rows.map((row) => row.instruction_id));
  }

  static async getTrainingProgress(userId, trainingId, trx) {
    const instructions = await this.trainingInstructionIds(trainingId, trx);
    const done = await this.completedInstructionIds(
      userId,
      instructions.map((i) => i.id),
      trx
    );

    return {
      completedInstructions: done.size,
      totalInstructions: instructions.length,
      percent: percent(done.size, instructions.length),
    };
  }

  /** Marks the training complete once every instruction is done. */
  static async syncTrainingCompletion(userId, trainingId, trx) {
    const progress = await this.getTrainingProgress(userId, trainingId, trx);
    const complete =
      progress.totalInstructions > 0 &&
      progress.completedInstructions === progress.totalInstructions;

    const enrollment = await this.requireEnrollment(userId, trainingId, trx);
    let trainingCompleted = false;

    if (complete && !enrollment.completed) {
      await Enrollment.query(trx)
        .findById(enrollment.id)
        .patch({ completed: true, completed_at: new Date().toISOString() });
      trainingCompleted = true;
    } else if (!complete && enrollment.completed && progress.totalInstructions > 0) {
      await Enrollment.query(trx)
        .findById(enrollment.id)
        .patch({ completed: false, completed_at: null });
    }

    return { progress, trainingCompleted };
  }

  /** Records a chapter completion once all of its instructions are done. */
  static async syncChapterCompletion(userId, chapterId, trx) {
    const instructionIds = (
      await Instruction.query(trx).where("chapter_id", chapterId).select("id")
    ).map((i) => i.id);
    const done = await this.completedInstructionIds(userId, instructionIds, trx);

    if (done.size < instructionIds.length) {
      await trx("chapter_completions").where({ user_id: userId, chapter_id: chapterId }).delete();
      return false;
    }

    const inserted = await trx("chapter_completions")
      .insert({ user_id: userId, chapter_id: chapterId })
      .onConflict(["user_id", "chapter_id"])
      .ignore()
      .returning("id");
    return inserted.length > 0;
  }

  static async completeInstruction(userId, instructionId) {
    const instruction = await Instruction.query()
      .findById(instructionId)
      .withGraphFetched("[chapter, achievements]");
    if (!instruction) throw notFound("Yönerge bulunamadı");

    const trainingId = instruction.chapter.training_id;

    return await db.transaction(async (trx) => {
      await this.requireEnrollment(userId, trainingId, trx);

      await trx("instruction_completions")
        .insert({ user_id: userId, instruction_id: instructionId })
        .onConflict(["user_id", "instruction_id"])
        .ignore();

      // Only achievements earned by *this* request are reported as new.
      const newAchievements = [];
      for (const achievement of instruction.achievements) {
        const inserted = await trx("user_achievements")
          .insert({ user_id: userId, achievement_id: achievement.id })
          .onConflict(["user_id", "achievement_id"])
          .ignore()
          .returning("id");
        if (inserted.length) newAchievements.push(achievement);
      }

      const chapterCompleted = await this.syncChapterCompletion(
        userId,
        instruction.chapter_id,
        trx
      );
      const { progress, trainingCompleted } = await this.syncTrainingCompletion(
        userId,
        trainingId,
        trx
      );

      return {
        instructionId,
        completed: true,
        newAchievements,
        chapterCompleted,
        trainingCompleted,
        progress,
      };
    });
  }

  /** Lets learners reset a step. Achievements already earned are kept. */
  static async uncompleteInstruction(userId, instructionId) {
    const instruction = await Instruction.query()
      .findById(instructionId)
      .withGraphFetched("chapter");
    if (!instruction) throw notFound("Yönerge bulunamadı");

    const trainingId = instruction.chapter.training_id;

    return await db.transaction(async (trx) => {
      await this.requireEnrollment(userId, trainingId, trx);

      await trx("instruction_completions")
        .where({ user_id: userId, instruction_id: instructionId })
        .delete();
      await this.syncChapterCompletion(userId, instruction.chapter_id, trx);
      const { progress } = await this.syncTrainingCompletion(userId, trainingId, trx);

      return { instructionId, completed: false, progress };
    });
  }

  static async completeChapter(userId, chapterId) {
    const chapter = await Chapter.query().findById(chapterId);
    if (!chapter) throw notFound("Bölüm bulunamadı");

    return await db.transaction(async (trx) => {
      await this.requireEnrollment(userId, chapter.training_id, trx);

      const instructionIds = (
        await Instruction.query(trx).where("chapter_id", chapterId).select("id")
      ).map((i) => i.id);
      const done = await this.completedInstructionIds(userId, instructionIds, trx);
      const remaining = instructionIds.length - done.size;

      if (remaining > 0)
        throw conflict(`Bölümü tamamlamak için ${remaining} yönerge daha tamamlamalısınız`, {
          remaining,
        });

      await trx("chapter_completions")
        .insert({ user_id: userId, chapter_id: chapterId })
        .onConflict(["user_id", "chapter_id"])
        .ignore();

      const { progress, trainingCompleted } = await this.syncTrainingCompletion(
        userId,
        chapter.training_id,
        trx
      );

      return { chapterId, userId, completed: true, trainingCompleted, progress };
    });
  }

  static async completeTraining(userId, trainingId) {
    return await db.transaction(async (trx) => {
      const enrollment = await this.requireEnrollment(userId, trainingId, trx);
      const progress = await this.getTrainingProgress(userId, trainingId, trx);
      const remaining = progress.totalInstructions - progress.completedInstructions;

      if (remaining > 0)
        throw conflict(`Eğitimi tamamlamak için ${remaining} yönerge daha tamamlamalısınız`, {
          remaining,
        });

      const updated = enrollment.completed
        ? enrollment
        : await Enrollment.query(trx).patchAndFetchById(enrollment.id, {
            completed: true,
            completed_at: new Date().toISOString(),
          });

      return { trainingId, userId, status: "completed", enrollment: updated, progress };
    });
  }

  /** Completion status of one instruction for a user. */
  static async getInstructionProgress(userId, instructionId) {
    const row = await db("instruction_completions")
      .where({ user_id: userId, instruction_id: instructionId })
      .first();

    return {
      userId: Number(userId),
      instructionId,
      status: row ? "completed" : "not_started",
      completedAt: row?.completed_at ?? null,
    };
  }

  /** Data for the learner's statistics page. */
  static async getUserStats(userId) {
    const enrollments = await Enrollment.query()
      .where("user_id", userId)
      .withGraphFetched("training")
      .orderBy("created_at", "desc");

    const trainings = await Promise.all(
      enrollments.map(async (enrollment) => ({
        trainingId: enrollment.training_id,
        name: enrollment.training?.name,
        imageFilePath: enrollment.training?.image_file_path,
        enrolledAt: enrollment.created_at,
        completed: enrollment.completed,
        completedAt: enrollment.completed_at,
        progress: await this.getTrainingProgress(userId, enrollment.training_id),
      }))
    );

    const achievements = await Achievement.query()
      .select("achievements.*", "user_achievements.earned_at")
      .join("user_achievements", "user_achievements.achievement_id", "achievements.id")
      .where("user_achievements.user_id", userId)
      .orderBy("user_achievements.earned_at", "desc");

    const recentActivity = await db("instruction_completions as ic")
      .join("instructions as i", "i.id", "ic.instruction_id")
      .join("chapters as c", "c.id", "i.chapter_id")
      .join("trainings as t", "t.id", "c.training_id")
      .where("ic.user_id", userId)
      .orderBy("ic.completed_at", "desc")
      .limit(10)
      .select(
        "ic.instruction_id as instructionId",
        "i.name as instructionName",
        "c.name as chapterName",
        "t.id as trainingId",
        "t.name as trainingName",
        "ic.completed_at as completedAt"
      );

    // Completions per day for the last 14 days (activity chart).
    // Days are bucketed in UTC to match the keys generated below.
    const daily = await db("instruction_completions")
      .where("user_id", userId)
      .where(
        "completed_at",
        ">=",
        db.raw("(date_trunc('day', now() at time zone 'UTC') - interval '13 days') at time zone 'UTC'")
      )
      .select(
        db.raw("to_char(date_trunc('day', completed_at at time zone 'UTC'), 'YYYY-MM-DD') as day")
      )
      .count("* as count")
      .groupBy("day");
    const dailyCounts = Object.fromEntries(daily.map((d) => [d.day, Number(d.count)]));
    const activity = Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - (13 - index));
      const day = date.toISOString().slice(0, 10);
      return { day, count: dailyCounts[day] || 0 };
    });

    const completedInstructions = trainings.reduce(
      (sum, t) => sum + t.progress.completedInstructions,
      0
    );

    return {
      totals: {
        enrolledTrainings: trainings.length,
        completedTrainings: trainings.filter((t) => t.completed).length,
        completedInstructions,
        achievements: achievements.length,
        points: achievements.reduce((sum, a) => sum + (a.points || 0), 0),
      },
      trainings,
      achievements,
      recentActivity,
      activity,
    };
  }
}

module.exports = ProgressService;
