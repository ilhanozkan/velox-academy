// Sandbox provisioning metadata:
// - provider: which backend created the sandbox ("gcp" VMs or a "local"
//   development sandbox), so the API knows how to reach and delete it.
// - access_token: shared secret the sandbox service requires before it opens a
//   terminal or touches files. Sandboxes used to accept anyone who knew the IP.
// - error_message: why provisioning failed, shown to the learner with a retry.
exports.up = async function (knex) {
  await knex.schema.alterTable("user_sandboxes", function (table) {
    table.string("provider", 32).notNullable().defaultTo("gcp");
    table.string("access_token", 128);
    table.text("error_message");
  });

  // Zone and project were hard-coded column defaults; they are now always
  // written by the provider (and are meaningless for local sandboxes).
  await knex.schema.alterTable("user_sandboxes", function (table) {
    table.string("vm_zone").nullable().alter();
    table.string("project_id").nullable().alter();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("user_sandboxes", function (table) {
    table.string("vm_zone").defaultTo("europe-west1-b").alter();
    table.string("project_id").defaultTo("primal-gear-461809-v7").alter();
  });

  await knex.schema.alterTable("user_sandboxes", function (table) {
    table.dropColumns("provider", "access_token", "error_message");
  });
};
