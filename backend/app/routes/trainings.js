const express = require("express");

const TrainingController = require("../controllers/trainingController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, TrainingController.getAllTrainings);

router.get("/:id", authMiddleware, TrainingController.getTrainingById);

router.post("/", authMiddleware, TrainingController.createTraining);

router.put("/:id", authMiddleware, TrainingController.updateTraining);

router.delete("/:id", authMiddleware, TrainingController.deleteTraining);

// Business logic routes
router.get("/:id/chapters", authMiddleware, TrainingController.getChapters);

router.get(
  "/:id/chapters/:chapterId",
  authMiddleware,
  TrainingController.findChapter
);

router.post(
  "/:id/complete",
  authMiddleware,
  TrainingController.completeTraining
);

router.post("/:id/enroll", authMiddleware, TrainingController.enrollUser);

router.get(
  "/:id/enrollments",
  authMiddleware,
  TrainingController.getTrainingEnrollments
);

router.get(
  "/enrollments",
  authMiddleware,
  TrainingController.getUserEnrollments
);

// Sandbox management routes
// Get user's sandbox for a training
router.get("/:id/sandbox", authMiddleware, TrainingController.getUserSandbox);

// Delete user's sandbox for a training
router.delete(
  "/:id/sandbox",
  authMiddleware,
  TrainingController.deleteUserSandbox
);

module.exports = router;
