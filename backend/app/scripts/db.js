#!/usr/bin/env node
/**
 * Database maintenance commands. Prefer these over the raw knex CLI: they apply
 * the same legacy-migration fixups the API runs on startup.
 *
 *   node scripts/db.js migrate        apply pending migrations
 *   node scripts/db.js rollback       undo the last migration batch
 *   node scripts/db.js rollback --all undo every migration
 *   node scripts/db.js seed           run the (idempotent) seed files
 *   node scripts/db.js reset          rollback everything, migrate and seed
 *   node scripts/db.js status         list completed and pending migrations
 *   node scripts/db.js make-admin <email>  give an existing account the admin role
 */
const db = require("../config/db");
const {
  waitForDatabase,
  renameLegacyMigrations,
  migrateLatest,
  runSeeds,
} = require("../utils/createTables");

const rollback = async (all) => {
  const [batch, migrations] = await db.migrate.rollback(undefined, all);
  console.log(
    migrations.length
      ? `Batch ${batch} geri alındı: ${migrations.join(", ")}`
      : "Geri alınacak migration yok."
  );
};

const status = async () => {
  const [completed, pending] = await db.migrate.list();
  completed.forEach((m) => console.log(`  [x] ${m.name}`));
  pending.forEach((m) => console.log(`  [ ] ${m.file}`));
};

const makeAdmin = async () => {
  const email = process.argv[3];
  if (!email) throw new Error("Kullanım: node scripts/db.js make-admin <e-posta>");

  const updated = await db("users")
    .whereRaw("lower(email) = ?", [email.trim().toLowerCase()])
    .update({ role: "admin" });
  if (!updated) throw new Error(`${email} adresiyle kayıtlı kullanıcı bulunamadı.`);
  console.log(`${email} artık yönetici.`);
};

const commands = {
  migrate: migrateLatest,
  rollback: () => rollback(process.argv.includes("--all")),
  seed: runSeeds,
  reset: async () => {
    await rollback(true);
    await migrateLatest();
    await runSeeds();
  },
  status,
  "make-admin": makeAdmin,
};

const main = async () => {
  const command = commands[process.argv[2]];

  if (!command) {
    console.error(`Kullanım: node scripts/db.js <${Object.keys(commands).join("|")}>`);
    process.exitCode = 1;
    return;
  }

  await waitForDatabase({ retries: 3 });
  // Every knex command validates the migration list, not only "migrate".
  await renameLegacyMigrations();
  await command();
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
