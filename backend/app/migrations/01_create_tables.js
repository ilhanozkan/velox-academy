// server/migrations/create_tables.js
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
    })
    .then(async () => {
      console.log("Creating admin user");
      await knex("users")
        .select("*")
        .where("username", "admin")
        .then(async (user) => {
          if (user.length === 0) {
            await knex("users").insert({
              username: "admin",
              email: "contact.ilhanozkan@gmail.com",
              password:
                "$2b$10$Row.T00TQFXIVyAQfyVFYetZoI/IVII4zyLyUD9XXp4WFoEXxPTkK", // hashed password for pass '1234'
            });
          }
        });
      // Create mock data for categories, trainings, chapters, instructions, write_ups, achievements, sandboxes, and images
      console.log("Creating mock data");
      await knex("categories")
        .select("*")
        .then(async (categories) => {
          const mockCategories = [
            {
              name: "Web Development",
              description: "Learn to build web applications",
            },
            {
              name: "Data Science",
              description: "Explore data analysis and machine learning",
            },
            {
              name: "Cybersecurity",
              description: "Understand security principles and practices",
            },
            {
              name: "Database Management",
              description: "Learn about database design and SQL",
            },
          ];

          if (categories.length === 0) {
            await knex("categories").insert(mockCategories);

            console.log("Mock categories created");

            // Create mock trainings
            const mockTrainings = [
              {
                id: "web-dev-101",
                name: "Web Development 101",
                description: "Introduction to web development",
                category_id: 1, // Assuming the first category is Web Development
                slug: "web-development-101",
                image_file_path: "images/web-dev-101.jpg",
              },
              {
                id: "data-science-101",
                name: "Data Science 101",
                description: "Introduction to data science",
                category_id: 2, // Assuming the second category is Data Science
                slug: "data-science-101",
                image_file_path: "images/data-science-101.jpg",
              },
              {
                id: "cybersecurity-101",
                name: "Cybersecurity 101",
                description: "Introduction to cybersecurity",
                category_id: 3, // Assuming the third category is Cybersecurity
                slug: "cybersecurity-101",
                image_file_path: "images/cybersecurity-101.jpg",
              },
              {
                id: "database-management-101",
                name: "Database Management 101",
                description: "Introduction to database management",
                category_id: 4, // Assuming the fourth category is Database Management
                slug: "database-management-101",
                image_file_path: "images/database-management-101.jpg",
              },
            ];

            await knex("trainings")
              .select("*")
              .then(async (trainings) => {
                if (trainings.length === 0) {
                  console.log("Inserting mock trainings");
                  await knex("trainings").insert(mockTrainings);
                }
              });

            console.log("Mock trainings created");

            // Create mock chapters
            const mockChapters = [
              {
                id: "web-dev-101-chapter-1",
                name: "Web Development 101 - Chapter 1",
                description: "Introduction to HTML",
                training_id: "web-dev-101",
              },
              {
                id: "data-science-101-chapter-1",
                name: "Data Science 101 - Chapter 1",
                description: "Introduction to Python",
                training_id: "data-science-101",
              },
              {
                id: "cybersecurity-101-chapter-1",
                name: "Cybersecurity 101 - Chapter 1",
                description: "Introduction to Networks",
                training_id: "cybersecurity-101",
              },
              {
                id: "database-management-101-chapter-1",
                name: "Database Management 101 - Chapter 1",
                description: "Introduction to SQL",
                training_id: "database-management-101",
              },
            ];

            await knex("chapters")
              .select("*")
              .then(async (chapters) => {
                if (chapters.length === 0) {
                  console.log("Inserting mock chapters");
                  await knex("chapters").insert(mockChapters);
                }
              });
          }
        });
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
