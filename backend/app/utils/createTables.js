const db = require("../config/db");

const createTables = async () => {
  try {
    await db.migrate.latest();

    console.log("Tablolar başarıyla oluşturuldu.");
  } catch (error) {
    console.error("Tablolar oluşturulurken bir hata oluştu:", error);
  } finally {
    // db.destroy();
  }
};

module.exports = createTables;
