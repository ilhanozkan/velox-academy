// Migration to add user_sandboxes table for tracking user-specific VM instances
exports.up = function (knex) {
  return knex.schema.createTable("user_sandboxes", function (table) {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .string("training_id")
      .references("id")
      .inTable("trainings")
      .onDelete("CASCADE");
    table.string("vm_instance_name").notNullable();
    table.string("vm_external_ip");
    table.string("vm_status").defaultTo("creating"); // creating, running, stopped, deleted
    table.string("vm_zone").defaultTo("europe-west1-b");
    table.string("project_id").defaultTo("primal-gear-461809-v7");
    table.timestamps(true, true);

    // Ensure one sandbox per user per training
    table.unique(["user_id", "training_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user_sandboxes");
};
