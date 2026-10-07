// Referential integrity. The original foreign keys had no ON DELETE action, so
// deleting a training that had chapters (or a user with enrollments) failed
// with a constraint violation. PostgreSQL also does not index foreign keys
// automatically, and nothing prevented duplicate enrollments.

// [table, column, referenced table, ON DELETE action]
const FOREIGN_KEYS = [
  ["trainings", "category_id", "categories", "SET NULL"],
  ["chapters", "training_id", "trainings", "CASCADE"],
  ["instructions", "chapter_id", "chapters", "CASCADE"],
  ["write_ups", "chapter_id", "chapters", "CASCADE"],
  // Keep achievements (and who earned them) when an instruction is removed.
  ["achievements", "instruction_id", "instructions", "SET NULL"],
  ["sandboxes", "chapter_id", "chapters", "CASCADE"],
  ["images", "sandbox_id", "sandboxes", "CASCADE"],
  ["enrollments", "user_id", "users", "CASCADE"],
  ["enrollments", "training_id", "trainings", "CASCADE"],
];

// Foreign key columns that are not already the leading column of an index.
const INDEXES = [
  ["trainings", "category_id"],
  ["chapters", "training_id"],
  ["instructions", "chapter_id"],
  ["write_ups", "chapter_id"],
  ["achievements", "instruction_id"],
  ["sandboxes", "chapter_id"],
  ["images", "sandbox_id"],
  ["enrollments", "training_id"],
  ["user_sandboxes", "training_id"],
];

const replaceForeignKey = (knex, [tableName, column, refTable, onDelete]) =>
  knex.schema.alterTable(tableName, function (table) {
    table.dropForeign(column);
    const foreign = table.foreign(column).references("id").inTable(refTable);
    if (onDelete) foreign.onDelete(onDelete);
  });

exports.up = async function (knex) {
  for (const foreignKey of FOREIGN_KEYS) {
    await replaceForeignKey(knex, foreignKey);
  }

  for (const [tableName, column] of INDEXES) {
    await knex.schema.alterTable(tableName, function (table) {
      table.index(column);
    });
  }

  // Enrollments: one row per user and training.
  await knex("enrollments").whereNull("user_id").delete();
  // Keep the oldest duplicate, but preserve completion from any of them.
  await knex.raw(`
    UPDATE enrollments AS keep SET completed = true
    FROM enrollments AS dup
    WHERE dup.user_id = keep.user_id
      AND dup.training_id = keep.training_id
      AND dup.completed AND NOT keep.completed
  `);
  await knex.raw(`
    DELETE FROM enrollments AS e
    USING enrollments AS older
    WHERE e.user_id = older.user_id
      AND e.training_id = older.training_id
      AND e.id > older.id
  `);

  await knex.schema.alterTable("enrollments", function (table) {
    table.integer("user_id").notNullable().alter();
    table.boolean("completed").notNullable().defaultTo(false).alter();
    table.timestamp("completed_at");
    table.unique(["user_id", "training_id"]);
  });

  await knex("enrollments")
    .where({ completed: true })
    .update({ completed_at: knex.ref("updated_at") });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("enrollments", function (table) {
    table.dropUnique(["user_id", "training_id"]);
    table.dropColumn("completed_at");
    table.integer("user_id").nullable().alter();
    table.boolean("completed").nullable().defaultTo(false).alter();
  });

  for (const [tableName, column] of INDEXES) {
    await knex.schema.alterTable(tableName, function (table) {
      table.dropIndex(column);
    });
  }

  // Restore the original constraints, which had no ON DELETE action.
  for (const [tableName, column, refTable] of FOREIGN_KEYS) {
    await replaceForeignKey(knex, [tableName, column, refTable, null]);
  }
};
