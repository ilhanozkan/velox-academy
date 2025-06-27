// // Create a connection to the postgresql database
// const Pool = require("pg").Pool;

// const pool = new Pool({
//   host: "localhost",
//   port: 5432,
//   password: "postgres",
//   database: "velox",
//   user: "postgres",
// });

// // Create a table in the database named users if it doesn't exist
// // The table has three columns: id, name, email
// pool.query(
//   `CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(50),
//         email VARCHAR(50),

//     )`,
//   (err, res) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(res);
//     }
//   }
// );

// module.exports = {
//   pool,
//   query: (text, params) => pool.query(text, params),
// };

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
