const express = require("express");

const TrainingController = require("../controllers/trainingController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const router = express.Router();

router.get("/", requireAuth, TrainingController.getAllTrainings);

// Must be declared before "/:id", which used to swallow it ("enrollments"
// was looked up as a training id and returned 404).
router.get("/enrollments", requireAuth, TrainingController.getUserEnrollments);

router.get("/:id", requireAuth, TrainingController.getTrainingById);

router.post("/", requireAdmin, TrainingController.createTraining);

router.put("/:id", requireAdmin, TrainingController.updateTraining);

router.delete("/:id", requireAdmin, TrainingController.deleteTraining);

// Business logic routes
router.get("/:id/chapters", requireAuth, TrainingController.getChapters);

router.get("/:id/chapters/:chapterId", requireAuth, TrainingController.findChapter);

router.post("/:id/complete", requireAuth, TrainingController.completeTraining);

router.post("/:id/enroll", requireAuth, TrainingController.enrollUser);

router.get("/:id/enrollments", requireAdmin, TrainingController.getTrainingEnrollments);

// Sandbox management routes
// Get user's sandbox for a training
router.get("/:id/sandbox", requireAuth, TrainingController.getUserSandbox);

// Create (or retry/recreate) the user's sandbox for a training
router.post("/:id/sandbox", requireAuth, TrainingController.createUserSandbox);

// Delete user's sandbox for a training
router.delete("/:id/sandbox", requireAuth, TrainingController.deleteUserSandbox);

module.exports = router;
