const bcrypt = require("bcrypt");

// Default development credentials. Override with ADMIN_EMAIL / ADMIN_PASSWORD;
// production refuses to create an admin with the default password.
const DEFAULT_ADMIN_EMAIL = "contact.ilhanozkan@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "1234";

exports.seed = async function (knex) {
  const username = process.env.ADMIN_USERNAME || "admin";
  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  const existing = await knex("users")
    .where({ username })
    .orWhere({ email })
    .first();

  if (existing) {
    // Accounts created before roles existed are promoted, nothing else changes.
    if (existing.role !== "admin" && existing.username === username) {
      await knex("users").where({ id: existing.id }).update({ role: "admin" });
    }
    return;
  }

  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
    console.warn(
      "ADMIN_PASSWORD tanımlı değil: üretim ortamında varsayılan parolayla yönetici oluşturulmadı."
    );
    return;
  }

  await knex("users").insert({
    username,
    email,
    password: await bcrypt.hash(password, 10),
    role: "admin",
  });
};
