const db = require("../config/db");

// Migrations that were renamed after they had already been applied somewhere.
// Knex refuses to run when a recorded migration file is missing, so existing
// databases get their bookkeeping rows renamed before migrating.
const RENAMED_MIGRATIONS = {
  "add_user_sandboxes.js": "02_add_user_sandboxes.js",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Waits until PostgreSQL accepts connections. docker-compose starts the API
 * container before the database is ready, which used to make the very first
 * migration fail and leave the server running without any tables.
 */
const waitForDatabase = async ({
  retries = Number(process.env.DB_CONNECT_RETRIES) || 10,
  delayMs = 2000,
} = {}) => {
  for (let attempt = 1; ; attempt++) {
    try {
      await db.raw("select 1");
      return;
    } catch (error) {
      if (attempt >= retries) throw error;

      console.warn(
        `Veritabanına bağlanılamadı (deneme ${attempt}/${retries}): ${error.message}`
      );
      await sleep(delayMs);
    }
  }
};

const renameLegacyMigrations = async () => {
  const tableName = db.client.config.migrations?.tableName || "knex_migrations";

  if (!(await db.schema.hasTable(tableName))) return;

  for (const [oldName, newName] of Object.entries(RENAMED_MIGRATIONS)) {
    await db(tableName).where({ name: oldName }).update({ name: newName });
  }
};

const migrateLatest = async () => {
  await renameLegacyMigrations();

  const [batch, migrations] = await db.migrate.latest();

  if (migrations.length)
    console.log(`Migration batch ${batch} uygulandı: ${migrations.join(", ")}`);
  else console.log("Veritabanı şeması güncel.");
};

const runSeeds = async () => {
  const [seeds] = await db.seed.run();
  console.log(`Seed dosyaları çalıştırıldı (${seeds.length}).`);
};

// Seeds create a default admin and demo content. They run automatically in
// development; production opts in explicitly with SEED_ON_START=true.
const shouldSeedOnStart = () =>
  process.env.SEED_ON_START
    ? process.env.SEED_ON_START === "true"
    : process.env.NODE_ENV !== "production";

const createTables = async () => {
  await waitForDatabase();
  await migrateLatest();

  if (shouldSeedOnStart()) await runSeeds();

  console.log("Tablolar başarıyla oluşturuldu.");
};

module.exports = createTables;
module.exports.waitForDatabase = waitForDatabase;
module.exports.renameLegacyMigrations = renameLegacyMigrations;
module.exports.migrateLatest = migrateLatest;
module.exports.runSeeds = runSeeds;
