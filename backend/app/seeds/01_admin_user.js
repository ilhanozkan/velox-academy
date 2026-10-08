const bcrypt = require("bcrypt");

// Creates the admin account when it does not exist yet. Default development
// credentials can be overridden with ADMIN_EMAIL / ADMIN_PASSWORD; production
// refuses to create an admin with the default password. Existing accounts are
// never modified: promoting an account by name would let anyone who registers
// that username become an admin.
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

  if (existing) return;

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
