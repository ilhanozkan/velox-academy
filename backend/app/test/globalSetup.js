// Creates (if needed) and resets the test database before the suite runs.
const { Client } = require("pg");

module.exports = async () => {
  process.env.NODE_ENV = "test";

  const knexConfig = require("../knexfile").test;
  const connection = knexConfig.connection;

  // The suite rolls back every migration: refuse anything but a test database.
  const database =
    typeof connection === "string" ? new URL(connection).pathname.slice(1) : connection.database;
  if (!database.endsWith("_test"))
    throw new Error(`Refusing to run tests against "${database}": the database name must end with "_test".`);

  if (typeof connection === "object") {
    const admin = new Client({ ...connection, database: "postgres" });
    await admin.connect();
    const { rowCount } = await admin.query("select 1 from pg_database where datname = $1", [
      connection.database,
    ]);
    if (!rowCount) await admin.query(`create database "${connection.database}"`);
    await admin.end();
  }

  const Knex = require("knex");
  const knex = Knex(knexConfig);
  await knex.migrate.rollback(undefined, true);
  await knex.migrate.latest();
  await knex.seed.run();
  await knex.destroy();
};
