const express = require("express");

const UserSandboxController = require("../controllers/userSandboxController");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

// Create a new sandbox for user and training
router.post("/", requireAuth, UserSandboxController.createSandbox);

// Get all sandboxes for authenticated user
router.get("/", requireAuth, UserSandboxController.getUserSandboxes);

// Get specific sandbox by training ID (query parameter)
router.get("/training", requireAuth, UserSandboxController.getSandbox);

// Delete a sandbox
router.delete("/", requireAuth, UserSandboxController.deleteSandbox);

// Recreate a deleted sandbox
router.post("/:id/recreate", requireAuth, UserSandboxController.recreateSandbox);

// Refresh sandbox IP
router.post("/:id/refresh-ip", requireAuth, UserSandboxController.refreshSandboxIP);

module.exports = router;
