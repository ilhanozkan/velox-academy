const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../utils/authMiddleware");
const router = express.Router();

// Kayıt ol
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.query().insert({ username, email, password });
    res.status(201).json({ message: "Kayıt başarılı", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Giriş yap
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.query().findOne({ email });

    if (!user)
      return res
        .status(401)
        .json({ error: "Geçersiz kullanıcı adı veya şifre" });

    const validPassword = await user.verifyPassword(password);

    if (!validPassword)
      return res
        .status(401)
        .json({ error: "Geçersiz kullanıcı adı veya şifre" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set token as a cookie
    res.cookie("token", token, {
      maxAge: 86400000, // 24 hours
      // httpOnly: true, // Prevents XSS attacks
      // secure: process.env.NODE_ENV === "production", // HTTPS only in production
      // sameSite: "lax", // CSRF protection
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// Profil
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    console.log(req);

    const user = await User.query().findById(req.user.userId);
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
