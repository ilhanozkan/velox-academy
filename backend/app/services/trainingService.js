const Training = require("../models/Training");
const Enrollment = require("../models/Enrollment");
const UserSandboxService = require("./userSandboxService");

class TrainingService {
  static async getAllTrainings(userId = null) {
    const trainings = await Training.query();

    if (!userId) {
      return trainings;
    }

    const enrollments = await Enrollment.query()
      .where("user_id", userId)
      .select("training_id");

    const enrolledTrainingIds = new Set(enrollments.map((e) => e.training_id));

    return trainings.map((training) => ({
      ...training,
      isEnrolled: enrolledTrainingIds.has(training.id),
    }));
  }

  static async getTrainingById(id) {
    return await Training.query().findById(id);
  }

  static async createTraining(trainingData) {
    return await Training.query().insert(trainingData);
  }

  static async updateTraining(id, trainingData) {
    return await Training.query().patchAndFetchById(id, trainingData);
  }

  static async deleteTraining(id) {
    await Training.query().deleteById(id);
  }

  static async isUserEnrolled(trainingId, userId) {
    const enrollment = await Enrollment.query()
      .where("user_id", userId)
      .where("training_id", trainingId)
      .first();

    return !!enrollment;
  }

  static async completeTraining(trainingId, userId) {
    const enrollment = await Enrollment.query()
      .where("user_id", userId)
      .where("training_id", trainingId)
      .first();

    if (!enrollment) throw new Error("User is not enrolled in this training");

    const updatedEnrollment = await Enrollment.query().patchAndFetchById(
      enrollment.id,
      {
        completed: true,
        updated_at: new Date(),
      }
    );

    return {
      trainingId,
      userId,
      completedAt: new Date(),
      status: "completed",
      enrollment: updatedEnrollment,
    };
  }

  static async enrollUser(trainingId, userId) {
    const existingEnrollment = await Enrollment.query()
      .where("user_id", userId)
      .where("training_id", trainingId)
      .first();

    if (existingEnrollment)
      throw new Error("User is already enrolled in this training");

    try {
      // Create new enrollment
      const enrollment = await Enrollment.query().insert({
        user_id: userId,
        training_id: trainingId,
        completed: false,
      });

      console.log(
        `Creating sandbox for user ${userId} in training ${trainingId}`
      );
      const sandbox = await UserSandboxService.createUserSandbox(
        userId,
        trainingId
      );

      return {
        trainingId,
        userId,
        enrolledAt: new Date(),
        status: "enrolled",
        enrollment,
        sandbox: {
          id: sandbox.id,
          vmInstanceName: sandbox.vm_instance_name,
          vmExternalIp: sandbox.vm_external_ip,
          vmStatus: sandbox.vm_status,
          accessUrl: sandbox.vm_external_ip
            ? `http://${sandbox.vm_external_ip}:9000`
            : null,
        },
      };
    } catch (error) {
      console.error("Error during enrollment:", error);

      // Try to delete the enrollment if it was created
      try {
        await Enrollment.query()
          .where("user_id", userId)
          .where("training_id", trainingId)
          .delete();
      } catch (cleanupError) {
        console.error("Error cleaning up enrollment:", cleanupError);
      }

      throw new Error(`Enrollment failed: ${error.message}`);
    }
  }

  static async getUserEnrollments(userId) {
    return await Enrollment.query()
      .where("user_id", userId)
      .withGraphFetched("training");
  }

  static async getTrainingEnrollments(trainingId) {
    return await Enrollment.query()
      .where("training_id", trainingId)
      .withGraphFetched("user");
  }

  static async getUserSandbox(trainingId, userId) {
    return await UserSandboxService.getUserSandbox(userId, trainingId);
  }

  static async deleteUserSandbox(trainingId, userId) {
    return await UserSandboxService.deleteUserSandbox(userId, trainingId);
  }
}

module.exports = TrainingService;
