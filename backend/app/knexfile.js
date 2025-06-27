module.exports = {
  development: {
    client: "postgresql",
    connection: {
      host: "db",
      database: "velox",
      user: "postgres",
      password: "postgres",
    },
    migrations: {
      directory: "./migrations",
    },
  },
  production: {
    client: "postgresql",
    connection: {
      host: "db",
      database: "velox",
      user: "postgres",
      password: "postgres",
    },
    migrations: {
      directory: "./migrations",
    },
  },
};
