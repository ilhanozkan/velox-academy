const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

// Connection settings come from the environment so the same code runs inside
// docker-compose (host "db"), on a laptop, in CI and in production.
// DATABASE_URL takes precedence over the individual DB_* variables.
const connection = (database) =>
  process.env.DATABASE_URL || {
    host: process.env.DB_HOST || "db",
    port: Number(process.env.DB_PORT) || 5432,
    database,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  };

const base = {
  client: "pg",
  pool: { min: 0, max: Number(process.env.DB_POOL_MAX) || 10 },
  migrations: {
    directory: path.join(__dirname, "migrations"),
    tableName: "knex_migrations",
  },
  seeds: {
    directory: path.join(__dirname, "seeds"),
  },
};

module.exports = {
  development: {
    ...base,
    connection: connection(process.env.DB_NAME || "velox"),
  },
  test: {
    ...base,
    connection: connection(process.env.DB_NAME || "velox_test"),
  },
  production: {
    ...base,
    connection: connection(process.env.DB_NAME || "velox"),
  },
};
