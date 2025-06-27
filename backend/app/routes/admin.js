const express = require("express");
const AdminController = require("../controllers/adminController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Admin authentication middleware (you might want to create a specific admin middleware)
const adminMiddleware = (req, res, next) => {
  // In a real implementation, this would check if user has admin role
  // For now, we'll use the existing auth middleware
  authMiddleware(req, res, next);
};

// Dashboard and analytics
router.get(
  "/dashboard/stats",
  adminMiddleware,
  AdminController.getDashboardStats
);

// User management routes
router.post("/users/:userId/block", adminMiddleware, AdminController.blockUser);
router.post(
  "/users/:userId/unblock",
  adminMiddleware,
  AdminController.unblockUser
);

// Category management routes
router.post("/categories", adminMiddleware, AdminController.createCategory);
router.put("/categories/:id", adminMiddleware, AdminController.updateCategory);
router.delete(
  "/categories/:id",
  adminMiddleware,
  AdminController.deleteCategory
);

// Training management routes
router.post("/trainings", adminMiddleware, AdminController.createTraining);
router.put("/trainings/:id", adminMiddleware, AdminController.updateTraining);
router.delete(
  "/trainings/:id",
  adminMiddleware,
  AdminController.deleteTraining
);

// Chapter management routes
router.post("/chapters", adminMiddleware, AdminController.createChapter);
router.put("/chapters/:id", adminMiddleware, AdminController.updateChapter);
router.delete("/chapters/:id", adminMiddleware, AdminController.deleteChapter);

// Instruction management routes
router.post(
  "/instructions",
  adminMiddleware,
  AdminController.createInstruction
);
router.put(
  "/instructions/:id",
  adminMiddleware,
  AdminController.updateInstruction
);
router.delete(
  "/instructions/:id",
  adminMiddleware,
  AdminController.deleteInstruction
);

// WriteUp management routes
router.post("/writeups", adminMiddleware, AdminController.createWriteUp);
router.put("/writeups/:id", adminMiddleware, AdminController.updateWriteUp);
router.delete("/writeups/:id", adminMiddleware, AdminController.deleteWriteUp);

// Achievement management routes
router.post(
  "/achievements",
  adminMiddleware,
  AdminController.createAchievement
);
router.put(
  "/achievements/:id",
  adminMiddleware,
  AdminController.updateAchievement
);
router.delete(
  "/achievements/:id",
  adminMiddleware,
  AdminController.deleteAchievement
);

// Sandbox management routes
router.post("/sandboxes", adminMiddleware, AdminController.createSandbox);
router.put("/sandboxes/:id", adminMiddleware, AdminController.updateSandbox);
router.delete("/sandboxes/:id", adminMiddleware, AdminController.deleteSandbox);

module.exports = router;
