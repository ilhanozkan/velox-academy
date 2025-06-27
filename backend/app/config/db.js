const { Model } = require("objection");
const Knex = require("knex");

// Knex bağlantısını oluştur
const knex = Knex({
  client: "pg",
  connection: {
    host: "db",
    port: 5432,
    user: "postgres",
    database: "velox",
    password: "postgres",
  },
});

// Model sınıflarını knex bağlantısıyla ilişkilendir
Model.knex(knex);

// Veritabanı bağlantısını dışa aktar
module.exports = knex;
