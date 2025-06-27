const mysql = require("mysql2");
// Load environment variables
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

async function runQuery(query) {
  const [rows] = await pool.query(query);
  return rows;
}

module.exports = { runQuery };
