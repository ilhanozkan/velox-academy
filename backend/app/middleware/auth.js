const jwt = require("jsonwebtoken");

const config = require("../config/env");
const User = require("../models/User");
const { unauthorized, forbidden, asyncHandler } = require("../utils/httpError");

const cookieOptions = () => ({
  httpOnly: true, // not readable from JavaScript, so XSS cannot steal it
  secure: config.auth.cookieSecure,
  sameSite: config.auth.cookieSameSite,
  domain: config.auth.cookieDomain,
  path: "/",
});

const signToken = (user) =>
  jwt.sign({ userId: user.id, role: user.role }, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });

const setAuthCookie = (res, token) =>
  res.cookie(config.auth.cookieName, token, {
    ...cookieOptions(),
    maxAge: config.auth.cookieMaxAgeMs,
  });

const clearAuthCookie = (res) =>
  res.clearCookie(config.auth.cookieName, cookieOptions());

// Cookie for the browser app, Bearer header for API clients.
const readToken = (req) => {
  const header = req.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();
  return req.cookies?.[config.auth.cookieName] || null;
};

const authenticate = async (req) => {
  const token = readToken(req);
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, config.auth.jwtSecret);
  } catch {
    throw unauthorized("Oturumunuzun süresi dolmuş, lütfen tekrar giriş yapın");
  }

  // Load the account on every request so that blocking a user or changing
  // their role takes effect immediately rather than when the token expires.
  const user = await User.query().findById(payload.userId);
  if (!user) throw unauthorized("Oturumunuzun süresi dolmuş, lütfen tekrar giriş yapın");
  if (user.isBlocked) throw forbidden("Hesabınız engellenmiş");

  return user;
};

const attachUser = (req, user) => {
  req.currentUser = user;
  // Kept for existing handlers that read req.user.userId.
  req.user = { userId: user.id, role: user.role };
};

/** Requires a valid session. */
const requireAuth = asyncHandler(async (req, res, next) => {
  const user = await authenticate(req);
  if (!user) throw unauthorized("Yetkilendirme reddedildi, token eksik");

  attachUser(req, user);
  next();
});

/** Loads the user when a session exists, but lets anonymous requests through. */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const user = await authenticate(req).catch(() => null);
  if (user) attachUser(req, user);
  next();
});

/** Requires an admin session. */
const requireAdmin = [
  requireAuth,
  (req, res, next) =>
    req.currentUser.isAdmin ? next() : next(forbidden("Bu işlem yalnızca yöneticiler içindir")),
];

/** Requires the user in req.params[param] to be the current user, or an admin. */
const requireSelfOrAdmin = (param = "id") => [
  requireAuth,
  (req, res, next) =>
    req.currentUser.isAdmin || String(req.currentUser.id) === String(req.params[param])
      ? next()
      : next(forbidden()),
];

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
  requireSelfOrAdmin,
  signToken,
  setAuthCookie,
  clearAuthCookie,
};
