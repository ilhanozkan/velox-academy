const express = require("express");
const AdminController = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Every admin route requires an authenticated admin. This used to be any
// logged-in user.
router.use(requireAdmin);

// Dashboard and analytics
router.get("/dashboard/stats", AdminController.getDashboardStats);

// User management routes
router.get("/users", AdminController.listUsers);
router.post("/users/:userId/block", AdminController.blockUser);
router.post("/users/:userId/unblock", AdminController.unblockUser);
router.put("/users/:userId/role", AdminController.setRole);

// Enrollment management routes
router.get("/enrollments", AdminController.getAllEnrollments);
router.get("/enrollments/:id", AdminController.getEnrollmentById);
router.delete("/enrollments/:id", AdminController.deleteEnrollment);

// Category management routes
router.post("/categories", AdminController.createCategory);
router.put("/categories/:id", AdminController.updateCategory);
router.delete("/categories/:id", AdminController.deleteCategory);

// Training management routes
router.post("/trainings", AdminController.createTraining);
router.put("/trainings/:id", AdminController.updateTraining);
router.delete("/trainings/:id", AdminController.deleteTraining);

// Chapter management routes
router.post("/chapters", AdminController.createChapter);
router.put("/chapters/:id", AdminController.updateChapter);
router.delete("/chapters/:id", AdminController.deleteChapter);

// Instruction management routes
router.post("/instructions", AdminController.createInstruction);
router.put("/instructions/:id", AdminController.updateInstruction);
router.delete("/instructions/:id", AdminController.deleteInstruction);

// WriteUp management routes
router.post("/writeups", AdminController.createWriteUp);
router.put("/writeups/:id", AdminController.updateWriteUp);
router.delete("/writeups/:id", AdminController.deleteWriteUp);

// Achievement management routes
router.post("/achievements", AdminController.createAchievement);
router.put("/achievements/:id", AdminController.updateAchievement);
router.delete("/achievements/:id", AdminController.deleteAchievement);

// Sandbox management routes
router.post("/sandboxes", AdminController.createSandbox);
router.put("/sandboxes/:id", AdminController.updateSandbox);
router.delete("/sandboxes/:id", AdminController.deleteSandbox);

module.exports = router;
