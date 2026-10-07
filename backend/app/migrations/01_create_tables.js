// Initial schema. Demo content and the default admin user live in ../seeds.
exports.up = function (knex) {
  return knex.schema
    .createTable("users", function (table) {
      table.increments("id").primary();
      table.string("username").notNullable().unique();
      table.string("email").notNullable().unique();
      table.string("password").notNullable();
      table.timestamps(true, true);
    })
    .createTable("categories", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable().unique();
      table.string("description");
      table.timestamps(true, true);
    })
    .createTable("trainings", function (table) {
      table.string("id").primary();
      table.string("name").notNullable();
      table.string("slug").notNullable().unique();
      table.string("image_file_path").notNullable();
      table.string("description");
      table
        .integer("category_id")
        .unsigned()
        .references("id")
        .inTable("categories");
      table.timestamps(true, true);
    })
    .createTable("chapters", function (table) {
      table.string("id").primary();
      table.string("name").notNullable();
      table.string("description");
      table
        .string("training_id")
        .notNullable()
        .references("id")
        .inTable("trainings");
      table.timestamps(true, true);
    })
    .createTable("instructions", function (table) {
      table.string("id").primary();
      table.string("name").notNullable();
      table.string("description");
      table
        .string("chapter_id")
        .notNullable()
        .references("id")
        .inTable("chapters");
      table.timestamps(true, true);
    })
    .createTable("write_ups", function (table) {
      table.string("id").primary();
      table.string("file_path").notNullable();
      table
        .string("chapter_id")
        .notNullable()
        .references("id")
        .inTable("chapters");
      table.timestamps(true, true);
    })
    .createTable("achievements", function (table) {
      table.string("id").primary();
      table.string("name").notNullable();
      table.string("description");
      table.string("instruction_id").references("id").inTable("instructions");
      // table.string("user_id").references("id").inTable("users");
      table.timestamps(true, true);
    })
    .createTable("sandboxes", function (table) {
      table.string("id").primary();
      table.string("name").notNullable();
      table.string("description");
      table.string("image_file_path").notNullable();
      table
        .string("chapter_id")
        .notNullable()
        .references("id")
        .inTable("chapters");
      table.timestamps(true, true);
    })
    .createTable("images", function (table) {
      table.string("id").primary();
      table.string("name").notNullable();
      table.string("file_path").notNullable();
      table
        .string("sandbox_id")
        .notNullable()
        .references("id")
        .inTable("sandboxes");
      table.timestamps(true, true);
    })
    .createTable("files", function (table) {
      table.string("id").primary();
      table.string("name").notNullable();
      table.string("file_path").notNullable();
      table.string("file_type").notNullable();
      table.timestamps(true, true);
    })
    .createTable("enrollments", function (table) {
      table.increments("id").primary();
      table.integer("user_id").unsigned().references("id").inTable("users");
      table
        .string("training_id")
        .notNullable()
        .references("id")
        .inTable("trainings");
      table.boolean("completed").defaultTo(false);
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("enrollments")
    .dropTableIfExists("files")
    .dropTableIfExists("images")
    .dropTableIfExists("sandboxes")
    .dropTableIfExists("achievements")
    .dropTableIfExists("write_ups")
    .dropTableIfExists("instructions")
    .dropTableIfExists("chapters")
    .dropTableIfExists("trainings")
    .dropTableIfExists("categories")
    .dropTableIfExists("users");
};
