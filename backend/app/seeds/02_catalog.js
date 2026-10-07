const fs = require("fs");
const path = require("path");

const { categories, trainings } = require("./data/catalog");

const CONTENT_DIR = path.join(__dirname, "content");

const readContent = (instructionId) =>
  fs.readFileSync(path.join(CONTENT_DIR, `${instructionId}.md`), "utf8");

// The first paragraph line of an instruction becomes its short description.
const summarize = (markdown) =>
  markdown
    .split("\n")
    .find((line) => line.trim() && !line.startsWith("#"))
    ?.trim()
    .slice(0, 280) ?? null;

// Seeds only insert rows that are missing (ON CONFLICT DO NOTHING), so they are
// safe to run on every start and never overwrite edits made by an admin.
exports.seed = async function (knex) {
  await knex("categories").insert(categories).onConflict("name").ignore();

  const categoryIds = Object.fromEntries(
    (await knex("categories").select("id", "name")).map((c) => [c.name, c.id])
  );

  for (const { chapters, category, ...training } of trainings) {
    await knex("trainings")
      .insert({ ...training, category_id: categoryIds[category] ?? null })
      .onConflict("id")
      .ignore();

    // Trainings created before the duration column existed get a value, but
    // one set by an admin is never replaced.
    await knex("trainings")
      .where({ id: training.id })
      .whereNull("estimated_minutes")
      .update({ estimated_minutes: training.estimated_minutes });

    for (const [chapterIndex, { instructions, ...chapter }] of chapters.entries()) {
      await knex("chapters")
        .insert({ ...chapter, training_id: training.id, position: chapterIndex + 1 })
        .onConflict("id")
        .ignore();

      for (const [index, { achievement, ...instruction }] of instructions.entries()) {
        const content = readContent(instruction.id);

        await knex("instructions")
          .insert({
            ...instruction,
            chapter_id: chapter.id,
            position: index + 1,
            description: summarize(content),
            content,
          })
          .onConflict("id")
          .ignore();

        if (achievement) {
          await knex("achievements")
            .insert({ ...achievement, instruction_id: instruction.id })
            .onConflict("id")
            .ignore();
        }
      }
    }
  }
};
