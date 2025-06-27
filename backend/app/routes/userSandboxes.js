const express = require("express");

const UserSandboxController = require("../controllers/userSandboxController");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Create a new sandbox for user and training
router.post("/", authMiddleware, UserSandboxController.createSandbox);

// Get all sandboxes for authenticated user
router.get("/", authMiddleware, UserSandboxController.getUserSandboxes);

// Get specific sandbox by training ID (query parameter)
router.get("/training", authMiddleware, UserSandboxController.getSandbox);

// Delete a sandbox
router.delete("/", authMiddleware, UserSandboxController.deleteSandbox);

// Recreate a deleted sandbox
router.post(
  "/:id/recreate",
  authMiddleware,
  UserSandboxController.recreateSandbox
);

// Refresh sandbox IP
router.post(
  "/:id/refresh-ip",
  authMiddleware,
  UserSandboxController.refreshSandboxIP
);

module.exports = router;
