// Account management columns. The admin API (block/unblock, role checks) and
// profile settings depend on them; previously the code referenced columns that
// did not exist, so those endpoints failed with 500.
exports.up = async function (knex) {
  await knex.schema.alterTable("users", function (table) {
    table.enu("role", ["user", "admin"]).notNullable().defaultTo("user");
    table.enu("status", ["active", "blocked"]).notNullable().defaultTo("active");
    table.string("full_name");
    table.string("profile_image");
    table.timestamp("blocked_at");
    table.timestamp("last_login_at");
  });

  // The account created by the initial setup predates roles.
  await knex("users").where({ username: "admin" }).update({ role: "admin" });
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
