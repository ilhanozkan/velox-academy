const UserService = require("../services/userService");
const User = require("../models/User");
const {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} = require("../middleware/auth");
const { unauthorized, forbidden, pick, wrapController } = require("../utils/httpError");

const startSession = (res, user) => {
  const token = signToken(user);
  setAuthCookie(res, token);
  return token;
};

class AuthController {
  // Kayıt ol
  static async register(req, res) {
    const user = await UserService.register(
      pick(req.body, ["username", "email", "password", "full_name"])
    );
    startSession(res, user);
    res.status(201).json({ message: "Kayıt başarılı", user });
  }

  // Giriş yap
  static async login(req, res) {
    const { email, password } = req.body || {};
    const user = await UserService.findByEmail(email);

    // Same message for unknown e-mail and wrong password.
    if (!user || !(await user.verifyPassword(password)))
      throw unauthorized("Geçersiz e-posta veya parola");
    if (user.isBlocked) throw forbidden("Hesabınız engellenmiş. Lütfen yöneticinizle iletişime geçin.");

    const loggedIn = await User.query().patchAndFetchById(user.id, {
      last_login_at: new Date().toISOString(),
    });
    const token = startSession(res, loggedIn);

    // The token is also returned for API clients that use the Bearer header;
    // the browser app relies on the httpOnly cookie.
    res.status(200).json({ token, user: loggedIn });
  }

  static async logout(req, res) {
    clearAuthCookie(res);
    res.status(200).json({ message: "Çıkış yapıldı" });
  }

  // Profil
  static async profile(req, res) {
    res.status(200).json({ user: req.currentUser });
  }

  static async updateProfile(req, res) {
    const user = await UserService.updateUser(
      req.currentUser.id,
      pick(req.body, UserService.PROFILE_FIELDS)
    );
    res.status(200).json({ message: "Profil güncellendi", user });
  }

  static async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body || {};
    const user = await UserService.changePassword(req.currentUser.id, currentPassword, newPassword);

    // Other sessions end with the old password; keep this one signed in.
    startSession(res, user);
    res.status(200).json({ message: "Parolanız güncellendi" });
  }
}

module.exports = wrapController(AuthController);
