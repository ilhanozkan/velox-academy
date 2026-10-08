const { Model } = require("objection");
const Knex = require("knex");

const knexConfig = require("../knexfile");

const environment = process.env.NODE_ENV || "development";

// Knex bağlantısını oluştur
const knex = Knex(knexConfig[environment] || knexConfig.development);

// Model sınıflarını knex bağlantısıyla ilişkilendir
Model.knex(knex);

// Veritabanı bağlantısını dışa aktar
module.exports = knex;
