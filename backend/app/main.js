const express = require("express");
const app = express();
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const db = require("./config/db");
const { createVM, getVmExternalIp } = require("./services/vmServices");
const getUsers = require("./controllers/getUsers");
// const authenticateGCloud = require("./services/authenticateGCloud");

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
const createTables = require("./utils/createTables");

const port = 5001;

app.use(
  cors({
    origin: [
      "http://localhost:3000", // Frontend development server
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the images directory
app.use("/static/images", express.static(path.join(__dirname, "images")));

// Use environment variables
require("dotenv").config();

// Use the router
app.use("/", router);

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

// Create a new route for creating a new machine relational with user id in google cloud
router.post("/api/machines", async (req, res) => {
  const vm = await createVM();

  res.status(200).send(vm);
});

// // Get machine external ip
// router.get("/api/machines/:id/ip", async (req, res) => {
//   await res.status(200).send(getVmExternalIp());
// });

// // // Authenticate in google cloud
// // router.post("/api/auth/gcloud", (req, res) => {
// //   authenticateGCloud();
// // });

createTables().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
