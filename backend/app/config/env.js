const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

const list = (value, fallback) =>
  (value ?? fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const bool = (value, fallback) =>
  value === undefined || value === "" ? fallback : value === "true";

// A fixed secret keeps development sessions valid across nodemon restarts.
// Production must provide its own; the previous secret was committed to git.
const DEV_JWT_SECRET = "velox-development-secret-do-not-use-in-production";

const jwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (isProduction)
    throw new Error("JWT_SECRET ortam değişkeni üretim ortamında zorunludur.");

  if (env !== "test")
    console.warn(
      "JWT_SECRET tanımlı değil; geliştirme için sabit bir anahtar kullanılıyor."
    );
  return DEV_JWT_SECRET;
};

const config = {
  env,
  isProduction,
  isTest: env === "test",
  port: Number(process.env.PORT) || 5001,
  // Express "trust proxy" setting, needed for correct client IPs (rate
  // limiting) behind a load balancer. E.g. "1" or "loopback".
  trustProxy: process.env.TRUST_PROXY || false,
  corsOrigins: list(process.env.CORS_ORIGINS, "http://localhost:3000"),

  auth: {
    jwtSecret: jwtSecret(),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
    cookieName: "token",
    cookieMaxAgeMs:
      (Number(process.env.SESSION_MAX_AGE_HOURS) || 24) * 60 * 60 * 1000,
    cookieSecure: bool(process.env.COOKIE_SECURE, isProduction),
    cookieSameSite: process.env.COOKIE_SAMESITE || "lax",
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    // Login/register attempts per IP per 15 minutes.
    rateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  },

  sandbox: {
    // "gcp" creates a Compute Engine VM per learner and training, "local"
    // points every learner at one sandbox service (vm-image/) for development,
    // "disabled" turns sandboxes off.
    provider: process.env.SANDBOX_PROVIDER || (isProduction ? "gcp" : "local"),
    port: Number(process.env.SANDBOX_PORT) || 9000,
    local: {
      // URL the learner's browser uses to reach the local sandbox service.
      url: process.env.LOCAL_SANDBOX_URL || "http://localhost:9000",
      // Must match SANDBOX_TOKEN of that service (empty: no token required).
      token: process.env.LOCAL_SANDBOX_TOKEN || null,
    },
    gcp: {
      projectId: process.env.GCP_PROJECT_ID || "primal-gear-461809-v7",
      zone: process.env.GCP_ZONE || "europe-west1-b",
      instanceTemplate: process.env.GCP_INSTANCE_TEMPLATE || "velox-images-sql-101",
    },
  },

  uploads: {
    imagesDir: path.join(__dirname, "..", "images"),
    maxImageBytes: 5 * 1024 * 1024,
  },
};

module.exports = config;
