// Per-user learning progress. Completing an instruction, finishing a chapter
// and earning an achievement were all stubs that returned fake objects without
// persisting anything.
exports.up = function (knex) {
  return knex.schema
    .createTable("user_achievements", function (table) {
      table.increments("id").primary();
      table
        .integer("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .string("achievement_id")
        .notNullable()
        .references("id")
        .inTable("achievements")
        .onDelete("CASCADE");
      table.timestamp("earned_at").notNullable().defaultTo(knex.fn.now());
      table.unique(["user_id", "achievement_id"]);
      table.index("achievement_id");
    })
    .createTable("instruction_completions", function (table) {
      table.increments("id").primary();
      table
        .integer("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .string("instruction_id")
        .notNullable()
        .references("id")
        .inTable("instructions")
        .onDelete("CASCADE");
      table.timestamp("completed_at").notNullable().defaultTo(knex.fn.now());
      table.unique(["user_id", "instruction_id"]);
      table.index("instruction_id");
    })
    .createTable("chapter_completions", function (table) {
      table.increments("id").primary();
      table
        .integer("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .string("chapter_id")
        .notNullable()
        .references("id")
        .inTable("chapters")
        .onDelete("CASCADE");
      table.timestamp("completed_at").notNullable().defaultTo(knex.fn.now());
      table.unique(["user_id", "chapter_id"]);
      table.index("chapter_id");
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("chapter_completions")
    .dropTableIfExists("instruction_completions")
    .dropTableIfExists("user_achievements");
};
