const config = require("./config/env");
const app = require("./app");
const db = require("./config/db");
const createTables = require("./utils/createTables");
const UserSandboxService = require("./services/userSandboxService");

const start = async () => {
  await createTables();

  if (config.sandbox.reconcileOnStart) {
    const interrupted = await UserSandboxService.failInterruptedProvisioning();
    if (interrupted)
      console.warn(`${interrupted} yarım kalmış sandbox kurulumu hata olarak işaretlendi.`);
  }

  const server = app.listen(config.port, () => {
    console.log(
      `Server is running on port ${config.port} (sandbox provider: ${config.sandbox.provider})`
    );
  });

  const shutdown = (signal) => {
    console.log(`${signal} alındı, sunucu kapatılıyor...`);
    server.close(async () => {
      await UserSandboxService.waitForProvisioning();
      await db.destroy();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((error) => {
  // Without a migrated database every endpoint would fail; exit so the
  // container restarts instead of serving errors.
  console.error("Veritabanı hazırlanamadı, sunucu başlatılmıyor:", error);
  process.exit(1);
});
