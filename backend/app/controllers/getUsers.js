const db = require("../config/db");

async function getUsers() {
  const query = "SELECT * FROM users";
  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Veritabanı sorgusu hatası:", error);
    throw error;
  }
}

module.exports = getUsers;
