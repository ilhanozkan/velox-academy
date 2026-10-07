const express = require("express");
const rateLimit = require("express-rate-limit");

const config = require("../config/env");
const AuthController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

// Slows down password guessing and mass registration.
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.auth.rateLimitMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin." },
});

// Kayıt ol
router.post("/register", credentialsLimiter, AuthController.register);

// Giriş yap
router.post("/login", credentialsLimiter, AuthController.login);

// Çıkış yap (httpOnly cookie can only be cleared by the server)
router.post("/logout", AuthController.logout);

// Profil
router.get("/profile", requireAuth, AuthController.profile);
router.patch("/profile", requireAuth, AuthController.updateProfile);
router.post("/change-password", requireAuth, credentialsLimiter, AuthController.changePassword);

module.exports = router;
