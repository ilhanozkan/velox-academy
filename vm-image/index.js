const http = require("http");
const crypto = require("crypto");
const express = require("express");
const fs = require("fs/promises");
const { Server: SocketServer } = require("socket.io");
const path = require("path");
const cors = require("cors");
const chokidar = require("chokidar");
const { execFile } = require("child_process");
const pty = require("node-pty");

const { runQuery } = require("./database/database");

const PORT = Number(process.env.PORT) || 9000;
// Learner workspace. Every file operation is confined to this directory.
const USER_DIR = path.resolve(process.env.USER_DIR || path.join(__dirname, "user"));
const RUN_TIMEOUT_MS = Number(process.env.RUN_TIMEOUT_MS) || 15000;
const MAX_OUTPUT_BYTES = 1024 * 1024;
const IGNORED_ENTRIES = new Set(["node_modules", ".git"]);

// ---------------------------------------------------------------------------
// Access token
// ---------------------------------------------------------------------------
// The API creates a random token for every sandbox and passes it to the VM
// through instance metadata; locally it comes from SANDBOX_TOKEN. Without a
// token anyone who knows the VM's IP could open a terminal on it.
const METADATA_URL =
  "http://metadata.google.internal/computeMetadata/v1/instance/attributes/velox-sandbox-token";

const loadToken = async () => {
  if (process.env.SANDBOX_TOKEN) return process.env.SANDBOX_TOKEN;

  try {
    const response = await fetch(METADATA_URL, {
      headers: { "Metadata-Flavor": "Google" },
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) return (await response.text()).trim() || null;
  } catch {
    // Not running on Compute Engine.
  }
  return null;
};

let accessToken = null;

const tokenMatches = (candidate) => {
  if (!accessToken) return true;
  if (typeof candidate !== "string") return false;

  const expected = Buffer.from(accessToken);
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
/** Resolves a client path ("/notes/a.sql") inside USER_DIR or returns null. */
const resolveUserPath = (clientPath) => {
  if (typeof clientPath !== "string" || !clientPath.trim()) return null;

  const resolved = path.resolve(USER_DIR, "." + path.posix.normalize("/" + clientPath));
  return resolved === USER_DIR || resolved.startsWith(USER_DIR + path.sep) ? resolved : null;
};

const toClientPath = (absolutePath) =>
  "/" + path.relative(USER_DIR, absolutePath).split(path.sep).join("/");

// Show workspace-relative paths ("/simple.py") instead of server paths in
// error messages and tracebacks.
const hideServerPaths = (text) => String(text).split(USER_DIR + path.sep).join("/");

const fileErrorMessage = (error) =>
  error.code === "ENOENT" ? "Dosya bulunamadı" : hideServerPaths(error.message);

async function generateFileTree(directory) {
  const tree = {};

  async function buildTree(currentDir, currentTree) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORED_ENTRIES.has(entry.name)) continue;

      if (entry.isDirectory()) {
        currentTree[entry.name] = {};
        await buildTree(path.join(currentDir, entry.name), currentTree[entry.name]);
      } else {
        currentTree[entry.name] = null;
      }
    }
  }

  await buildTree(directory, tree);
  return tree;
}

// ---------------------------------------------------------------------------
// Running files
// ---------------------------------------------------------------------------
const RUNNERS = {
  ".py": "python3",
  ".js": "node",
};

const runProgram = (command, filePath) =>
  new Promise((resolve) => {
    const startedAt = Date.now();

    execFile(
      command,
      [filePath],
      { cwd: USER_DIR, timeout: RUN_TIMEOUT_MS, maxBuffer: MAX_OUTPUT_BYTES },
      (error, stdout, stderr) => {
        const durationMs = Date.now() - startedAt;

        if (error) {
          const message = error.killed
            ? `Program ${RUN_TIMEOUT_MS / 1000} saniye içinde bitmediği için durduruldu.`
            : hideServerPaths(stderr || error.message);
          return resolve({
            error: true,
            message: [stdout, message].filter(Boolean).join("\n"),
            durationMs,
          });
        }

        // Successful output stays a plain string, as older clients expect.
        resolve(stdout || stderr || "Program çıktı üretmeden tamamlandı.");
      }
    );
  });

const runFile = async (clientPath) => {
  const filePath = resolveUserPath(clientPath);
  if (!filePath) return { error: true, message: "Geçersiz dosya yolu" };

  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".sql") {
    const query = await fs.readFile(filePath, "utf-8");
    if (!query.trim()) return { error: true, message: "Dosya boş. Önce bir sorgu yazın." };

    try {
      const rows = await runQuery(query);
      if (Array.isArray(rows)) return rows;
      return `Sorgu çalıştırıldı: ${rows.affectedRows ?? 0} satır etkilendi.`;
    } catch (error) {
      return { error: true, code: error.code, message: error.sqlMessage || error.message };
    }
  }

  if (RUNNERS[extension]) return await runProgram(RUNNERS[extension], filePath);

  // Other files are shown as text.
  return await fs.readFile(filePath, "utf-8");
};

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const app = express();
const server = http.createServer(app);
const io = new SocketServer({ cors: { origin: "*" } });

app.use(cors());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((req, res, next) => {
  const token = req.get("x-sandbox-token") || req.query.token;
  if (tokenMatches(token)) return next();
  res.status(401).json({ error: "Geçersiz erişim anahtarı" });
});

app.get("/files", async (req, res) => {
  try {
    res.json({ tree: await generateFileTree(USER_DIR) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Used to crash the whole service: a rejected readFile (missing file) in an
// async handler was an unhandled rejection.
app.get("/files/content", async (req, res) => {
  const filePath = resolveUserPath(req.query.path);
  if (!filePath) return res.status(400).json({ error: "Geçersiz dosya yolu" });

  try {
    res.json({ content: await fs.readFile(filePath, "utf-8") });
  } catch (error) {
    res.status(error.code === "ENOENT" ? 404 : 500).json({ error: fileErrorMessage(error) });
  }
});

io.attach(server);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (tokenMatches(token)) return next();
  next(new Error("unauthorized"));
});

// One shell per sandbox, shared by the learner's tabs. It is restarted when the
// learner types `exit`, which used to leave the terminal dead.
let ptyProcess;
const startShell = () => {
  ptyProcess = pty.spawn("bash", [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: USER_DIR,
    env: process.env,
  });

  ptyProcess.onData((data) => io.emit("terminal:data", data));
  ptyProcess.onExit(() => {
    io.emit("terminal:data", "\r\n[Terminal yeniden başlatıldı]\r\n");
    startShell();
  });
};

const handleError = (error) => {
  console.error(error);
  return { message: fileErrorMessage(error) };
};

io.on("connection", (socket) => {
  console.log(`Socket connected`, socket.id);

  socket.emit("file:refresh");

  // The optional ack lets clients wait for the write before running the file.
  socket.on("file:change", async ({ path: clientPath, content } = {}, ack) => {
    const filePath = resolveUserPath(clientPath);

    try {
      if (!filePath) throw new Error("Geçersiz dosya yolu");
      await fs.writeFile(filePath, typeof content === "string" ? content : "");
      if (typeof ack === "function") ack({ ok: true });
    } catch (error) {
      socket.emit("file:error", handleError(error));
      if (typeof ack === "function") ack({ ok: false, error: error.message });
    }
  });

  // Run the given file and send its output (rows, text or { error, message }).
  socket.on("run:file", async (file) => {
    try {
      if (!file?.path) throw new Error("Dosya yolu gereklidir");
      socket.emit("result", await runFile(file.path));
    } catch (error) {
      socket.emit("result", { error: true, message: fileErrorMessage(error) });
    }
  });

  // Run sql queries on run event triggered from the client
  socket.on("run:query", async (query) => {
    try {
      socket.emit("result", await runQuery(query));
    } catch (error) {
      socket.emit("result", { error: true, code: error.code, message: error.sqlMessage || error.message });
    }
  });

  socket.on("terminal:write", (data) => {
    if (typeof data === "string") ptyProcess.write(data);
  });

  socket.on("terminal:resize", ({ cols, rows } = {}) => {
    if (Number.isInteger(cols) && Number.isInteger(rows) && cols > 0 && rows > 0)
      ptyProcess.resize(Math.min(cols, 500), Math.min(rows, 200));
  });
});

const main = async () => {
  accessToken = await loadToken();
  if (!accessToken)
    console.warn("SANDBOX_TOKEN tanımlı değil: sandbox kimlik doğrulaması olmadan çalışıyor.");

  startShell();

  chokidar
    .watch(USER_DIR, { ignored: /(^|[/\\])(node_modules|\.git)([/\\]|$)/, ignoreInitial: true })
    .on("all", (event, changedPath) => io.emit("file:refresh", toClientPath(changedPath)));

  server.listen(PORT, () => console.log(`🐳 Docker server running on port ${PORT}`));
};

main();
