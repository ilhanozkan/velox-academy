const jwt = require("jsonwebtoken");

// Kimlik doğrulama işlemi
const authMiddleware = (req, res, next) => {
  const token = req.headers.cookie
    ? req.headers.cookie
        ?.split("; ")
        ?.find((cookie) => cookie.startsWith("token="))
        ?.split("=")[1]
    : null;

  if (!token)
    return res
      .status(401)
      .json({ error: "Yetkilendirme reddedildi, token eksik" });

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Yetkilendirme reddedildi, geçersiz token" });
  }
};

module.exports = authMiddleware;
