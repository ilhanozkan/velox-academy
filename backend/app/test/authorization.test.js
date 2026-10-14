const fs = require("fs");
const path = require("path");

const db = require("../config/db");
const { app, request, newLearner, adminAgent } = require("./helpers");

afterAll(() => db.destroy());

describe("content management requires an admin", () => {
  // Every row has a body (null when there is none): with fewer arguments
  // Jest would pass its `done` callback in that position.
  const writes = [
    ["post", "/api/categories", { name: "Hacked" }],
    ["post", "/api/trainings", { id: "hacked", name: "x", slug: "hacked", image_file_path: "x" }],
    ["delete", "/api/trainings/web-dev-101", null],
    ["post", "/api/chapters", { id: "x", name: "x", training_id: "web-dev-101" }],
    ["put", "/api/instructions/db101-ch1-what-is-sql", { name: "x" }],
    ["post", "/api/achievements", { id: "x", name: "x" }],
    ["post", "/api/admin/categories", { name: "Hacked" }],
    ["get", "/api/admin/dashboard/stats", null],
    ["get", "/api/admin/users", null],
    ["get", "/api/users", null],
    ["get", "/api/static-images/list", null],
    ["post", "/api/machines", null],
  ];

  it.each(writes)("%s %s is forbidden for learners", async (method, url, body) => {
    const { agent } = await newLearner();
    const res = await agent[method](url).send(body);
    expect(res.status).toBe(403);
  });

  it.each(writes)("%s %s is unauthorized without a session", async (method, url, body) => {
    const res = await request(app)[method](url).send(body);
    expect(res.status).toBe(401);
  });

  it("lets an admin manage categories", async () => {
    const admin = await adminAgent();
    const name = `Kategori ${Date.now()}`;

    const created = await admin.post("/api/categories").send({ name }).expect(201);
    await admin.put(`/api/categories/${created.body.category.id}`).send({ description: "d" }).expect(200);
    await admin.delete(`/api/categories/${created.body.category.id}`).expect(200);
    await admin.delete(`/api/categories/${created.body.category.id}`).expect(404);
  });
});

describe("user accounts", () => {
  it("only allows users to read and change their own account", async () => {
    const alice = await newLearner();
    const bob = await newLearner();

    await alice.agent.get(`/api/users/${alice.user.id}`).expect(200);
    await alice.agent.get(`/api/users/${bob.user.id}`).expect(403);
    await alice.agent.put(`/api/users/${bob.user.id}`).send({ full_name: "x" }).expect(403);
    await alice.agent.delete(`/api/users/${bob.user.id}`).expect(403);
    await alice.agent.get(`/api/users/${bob.user.id}/stats`).expect(403);
  });

  it("does not let a user change their role, status or password via PUT", async () => {
    const { agent, user, credentials } = await newLearner();

    const res = await agent
      .put(`/api/users/${user.id}`)
      .send({ role: "admin", status: "blocked", password: "hijacked1" })
      .expect(200);
    expect(res.body.user).toMatchObject({ role: "user", status: "active" });

    // The password was not changed.
    await request(app).post("/api/auth/login").send(credentials).expect(200);
  });

  it("hashes passwords an admin resets", async () => {
    const { user, credentials } = await newLearner();
    const admin = await adminAgent();

    await admin.put(`/api/users/${user.id}`).send({ password: "resetpass1" }).expect(200);

    const row = await db("users").where({ id: user.id }).first();
    expect(row.password).toMatch(/^\$2[aby]\$/);
    await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "resetpass1" })
      .expect(200);
  });
});

describe("static images", () => {
  const imagesDir = path.join(__dirname, "..", "images");

  it("blocks path traversal on delete", async () => {
    const admin = await adminAgent();
    const canary = path.join(__dirname, "..", "canary-test.jpg");
    fs.writeFileSync(canary, "canary");

    try {
      const res = await admin.delete("/api/static-images/..%2Fcanary-test.jpg");
      expect(res.status).toBe(400);
      expect(fs.existsSync(canary)).toBe(true);
    } finally {
      fs.unlinkSync(canary);
    }
  });

  it("accepts image uploads and rejects other files", async () => {
    const admin = await adminAgent();
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );

    const uploaded = await admin
      .post("/api/static-images/upload")
      .attach("image", png, { filename: "pixel.png", contentType: "image/png" })
      .expect(200);
    expect(uploaded.body.filename).toMatch(/\.png$/);
    expect(fs.existsSync(path.join(imagesDir, uploaded.body.filename))).toBe(true);

    await admin
      .post("/api/static-images/upload")
      .attach("image", Buffer.from("#!/bin/sh"), { filename: "evil.sh", contentType: "text/x-sh" })
      .expect(400);

    await admin.delete(`/api/static-images/${uploaded.body.filename}`).expect(200);
  });
});

describe("misc", () => {
  it("reports health", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body.status).toBe("ok");
  });

  it("returns JSON 404 for unknown API routes and 400 for malformed JSON", async () => {
    await request(app).get("/api/does-not-exist").expect(404);
    await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{not json")
      .expect(400);
  });
});
