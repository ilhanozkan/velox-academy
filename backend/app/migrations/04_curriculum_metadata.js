// Curriculum content and ordering. Instructions used to be hard-coded in the
// frontend because the table had nowhere to store their markdown body, and
// chapters/instructions had no stable order.
exports.up = async function (knex) {
  // Descriptions were varchar(255), too short for real course copy.
  for (const tableName of [
    "categories",
    "trainings",
    "chapters",
    "instructions",
    "achievements",
    "sandboxes",
  ]) {
    await knex.schema.alterTable(tableName, function (table) {
      table.text("description").alter();
    });
  }

  await knex.schema.alterTable("trainings", function (table) {
    table
      .enu("level", ["beginner", "intermediate", "advanced"])
      .notNullable()
      .defaultTo("beginner");
    table.integer("estimated_minutes").unsigned();
    // Compute Engine instance template used for this training's sandboxes.
    // NULL falls back to the server-wide default template.
    table.string("sandbox_template");
  });

  await knex.schema.alterTable("chapters", function (table) {
    table.integer("position").notNullable().defaultTo(0);
  });

  await knex.schema.alterTable("instructions", function (table) {
    table.text("content");
    table.integer("position").notNullable().defaultTo(0);
  });

  await knex.schema.alterTable("achievements", function (table) {
    table.string("icon");
    table.integer("points").notNullable().defaultTo(10);
  });

  // The WriteUp and Image models declared a `file` relation through a file_id
  // column that was never created.
  await knex.schema.alterTable("write_ups", function (table) {
    table.string("title");
    table.string("file_id").references("id").inTable("files").onDelete("SET NULL");
  });

  await knex.schema.alterTable("images", function (table) {
    table.string("file_id").references("id").inTable("files").onDelete("SET NULL");
  });

  // Give existing rows a deterministic order (creation order).
  await knex.raw(`
    UPDATE chapters AS c SET position = o.rn
    FROM (
      SELECT id, row_number() OVER (PARTITION BY training_id ORDER BY created_at, id) AS rn
      FROM chapters
    ) AS o
    WHERE c.id = o.id
  `);
  await knex.raw(`
    UPDATE instructions AS i SET position = o.rn
    FROM (
      SELECT id, row_number() OVER (PARTITION BY chapter_id ORDER BY created_at, id) AS rn
      FROM instructions
    ) AS o
    WHERE i.id = o.id
  `);
};

exports.down = async function (knex) {
  await knex.schema.alterTable("images", function (table) {
    table.dropForeign("file_id");
    table.dropColumn("file_id");
  });
  await knex.schema.alterTable("write_ups", function (table) {
    table.dropForeign("file_id");
    table.dropColumns("file_id", "title");
  });
  await knex.schema.alterTable("achievements", function (table) {
    table.dropColumns("icon", "points");
  });
  await knex.schema.alterTable("instructions", function (table) {
    table.dropColumns("content", "position");
  });
  await knex.schema.alterTable("chapters", function (table) {
    table.dropColumn("position");
  });
  await knex.schema.alterTable("trainings", function (table) {
    table.dropColumns("level", "estimated_minutes", "sandbox_template");
  });
  // Descriptions intentionally stay `text`: narrowing back to varchar(255)
  // could fail (or truncate) once longer copy has been stored.
};
