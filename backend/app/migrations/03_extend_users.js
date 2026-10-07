// Account management columns used by roles, blocking users and profile
// settings. (The existing admin service referenced such columns before they
// existed; the backend changes switch it to these.)
exports.up = async function (knex) {
  await knex.schema.alterTable("users", function (table) {
    table.enu("role", ["user", "admin"]).notNullable().defaultTo("user");
    table.enu("status", ["active", "blocked"]).notNullable().defaultTo("active");
    table.string("full_name");
    table.string("profile_image");
    table.timestamp("blocked_at");
    table.timestamp("last_login_at");
  });

  // The account created by the original initial migration predates roles.
  // Match it exactly (username and e-mail it was created with) so that a
  // self-registered "admin" account can never be promoted.
  await knex("users")
    .where({ username: "admin", email: "contact.ilhanozkan@gmail.com" })
    .update({ role: "admin" });
};

exports.down = function (knex) {
  return knex.schema.alterTable("users", function (table) {
    table.dropColumns(
      "role",
      "status",
      "full_name",
      "profile_image",
      "blocked_at",
      "last_login_at"
    );
  });
};
