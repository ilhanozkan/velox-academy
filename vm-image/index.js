const http = require("http");
const express = require("express");
const fs = require("fs/promises");
const { Server: SocketServer } = require("socket.io");
const path = require("path");
const cors = require("cors");
const chokidar = require("chokidar");
const { runQuery } = require("./database/database");

const pty = require("node-pty");

const ptyProcess = pty.spawn("bash", [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD + "/user",
  env: process.env,
});

// Code compiler
const { exec } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = new SocketServer({
  cors: "*",
});

app.use(cors());

io.attach(server);

chokidar.watch("./user").on("all", (event, path) => {
  io.emit("file:refresh", path);
});

ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
});

const handleError = (error) => {
  console.error(error);
  return {
    message: error.message,
    stack: error.stack,
  };
};

io.on("connection", (socket) => {
  console.log(`Socket connected`, socket.id);

  socket.emit("file:refresh");

  socket.on("file:change", async ({ path, content }) => {
    console.log(`File changed: ${path}`, "content:", content);
    await fs.writeFile(`./user${path}`, content).catch((err) => {
      // Handle error
      socket.emit("file:error", handleError(err));
    });
  });

  // Run sql queries on run event triggered from the client
  socket.on("run:file", async (file) => {
    try {
      if (!file?.path) {
        socket.emit("result", "File path is required");
        throw new Error("Dosya yolu gereklidir");
      }

      console.log("File path", file.path.split(".").pop() == "sql");

      if (file.path.split(".").pop() == "sql") {
        const query = await fs.readFile(`./user${file.path}`, "utf-8");
        try {
          const rows = await runQuery(query);
          socket.emit("result", rows);
        } catch (error) {
          console.log(error);
          socket.emit("result", error);
        }
      } else if (file.path.split(".").pop() == "py") {
        const myShellScript = exec(`python3 ./user/${file.path}`);

        myShellScript.stdout.on("data", (data) => {
          socket.emit("result", data);
        });

        myShellScript.stderr.on("data", (data) => {
          console.log(data);
          socket.emit("result", "Kod çalıştırılırken bir hata oluştu");
        });
      } else if (file.path.split(".").pop() == "js") {
        const myShellScript = exec(`node ./user/${file.path}`);

        myShellScript.stdout.on("data", (data) => {
          socket.emit("result", data);
        });

        myShellScript.stderr.on("data", (data) => {
          console.log(data);
          socket.emit("result", "Kod çalıştırılırken bir hata oluştu");
        });
      } else {
        const content = await fs.readFile(`./user${file.path}`, "utf-8");
        socket.emit("result", content);
      }
    } catch (error) {
      socket.emit("result", error);
    }
  });

  // Run sql queries on run event triggered from the client
  socket.on("run:query", async (query) => {
    try {
      const rows = await runQuery(query);
      socket.emit("result", rows);
    } catch (error) {
      socket.emit("result", error);
    }
  });

  socket.on("terminal:write", (data) => {
    ptyProcess.write(data);
  });
});

app.get("/files", async (req, res) => {
  const fileTree = await generateFileTree("./user");
  return res.json({ tree: fileTree });
});

app.get("/files/content", async (req, res) => {
  const path = req.query.path;
  const content = await fs.readFile(`./user${path}`, "utf-8");
  return res.json({ content });
});

server.listen(9000, () => console.log(`🐳 Docker server running on port 9000`));

async function generateFileTree(directory) {
  const tree = {};

  async function buildTree(currentDir, currentTree) {
    const files = await fs.readdir(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        currentTree[file] = {};
        await buildTree(filePath, currentTree[file]);
      } else {
        currentTree[file] = null;
      }
    }
  }

  await buildTree(directory, tree);
  return tree;
}
