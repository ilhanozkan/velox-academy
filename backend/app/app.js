const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const config = require("./config/env");
const db = require("./config/db");
const { createVM } = require("./services/vmServices");
const { requireAdmin } = require("./middleware/auth");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { asyncHandler } = require("./utils/httpError");

// Import routers
const categoriesRouter = require("./routes/categories");
const trainingsRouter = require("./routes/trainings");
const chaptersRouter = require("./routes/chapters");
const instructionsRouter = require("./routes/instructions");
const writeUpsRouter = require("./routes/writeups");
const achievementsRouter = require("./routes/achievements");
const sandboxesRouter = require("./routes/sandboxes");
const imagesRouter = require("./routes/images");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const staticImagesRouter = require("./routes/staticImages");
const userSandboxesRouter = require("./routes/userSandboxes");

const app = express();

app.set("trust proxy", config.trustProxy);

app.use(
  helmet({
    // Course images are embedded by the frontend, which runs on another origin.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Serve static files from the images directory
app.use(
  "/static/images",
  express.static(config.uploads.imagesDir, { maxAge: config.isProduction ? "7d" : 0 })
);

// Liveness/readiness probe: checks that the database answers.
app.get(
  "/api/health",
  asyncHandler(async (req, res) => {
    await db.raw("select 1");
    res.status(200).json({ status: "ok", sandboxProvider: config.sandbox.provider });
  })
);

// Routes
app.use("/api/categories", categoriesRouter);
app.use("/api/trainings", trainingsRouter);
app.use("/api/chapters", chaptersRouter);
app.use("/api/instructions", instructionsRouter);
app.use("/api/writeups", writeUpsRouter);
app.use("/api/achievements", achievementsRouter);
app.use("/api/sandboxes", sandboxesRouter);
app.use("/api/user-sandboxes", userSandboxesRouter);
app.use("/api/images", imagesRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/static-images", staticImagesRouter);

// Creates the VM the sandbox image is built from. It used to be callable
// without logging in, letting anyone start Compute Engine instances.
app.post(
  "/api/machines",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const vm = await createVM();
    res.status(200).send(vm);
  })
);

app.use("/api", notFoundHandler);
app.use(errorHandler);

module.exports = app;
