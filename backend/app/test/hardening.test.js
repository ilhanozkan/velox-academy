// Regression tests for issues found while reviewing the backend changes.
const fs = require("fs");
const path = require("path");

const db = require("../config/db");
const { parseTrustProxy } = require("../config/env");
const { PROVIDERS } = require("../services/sandboxProviders");
const UserSandboxService = require("../services/userSandboxService");
const { app, request, newLearner, adminAgent } = require("./helpers");

afterEach(() => jest.restoreAllMocks());
afterAll(async () => {
  await UserSandboxService.waitForProvisioning();
  await db.destroy();
});

const TRAINING = "web-dev-101";
const sandboxRow = (userId) =>
  db("user_sandboxes").where({ user_id: userId, training_id: TRAINING }).first();

// Makes local provisioning take a while so tests can act in between.
const slowCreate = () => {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const create = jest.spyOn(PROVIDERS.local, "create").mockImplementation(async () => {
    await gate;
    return {};
  });
  return { create, release };
};

describe("sessions", () => {
  it("ends other sessions when the password changes, but keeps the current one", async () => {
    const { agent, credentials } = await newLearner();
    const { body } = await request(app).post("/api/auth/login").send(credentials).expect(200);

    await agent
      .post("/api/auth/change-password")
      .send({ currentPassword: credentials.password, newPassword: "brandnew1" })
      .expect(200);

    await request(app).get("/api/auth/profile").set("Authorization", `Bearer ${body.token}`).expect(401);
    await agent.get("/api/auth/profile").expect(200);
  });

  it("answers 401, not 500, for a non-string password", async () => {
    const { credentials } = await newLearner();
    await request(app).post("/api/auth/login").send({ email: credentials.email, password: 1 }).expect(401);
  });

  it("hashes a new password even if it looks like a bcrypt hash", async () => {
    const { agent, user, credentials } = await newLearner();
    const tricky = "$2b$10$abcdefghijk";

    await agent
      .post("/api/auth/change-password")
      .send({ currentPassword: credentials.password, newPassword: tricky })
      .expect(200);

    const row = await db("users").where({ id: user.id }).first();
    expect(row.password).not.toBe(tricky);
    await request(app).post("/api/auth/login").send({ email: credentials.email, password: tricky }).expect(200);
  });
});

describe("requests", () => {
  it("rejects state-changing requests from foreign origins", async () => {
    await request(app)
      .post("/api/auth/login")
      .set("Origin", "https://evil.example")
      .send({ email: "a@b.co", password: "x" })
      .expect(403);
    await request(app)
      .post("/api/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({ email: "a@b.co", password: "x" })
      .expect(401);
  });

  it("answers 400 for a malformed URL", async () => {
    const { agent } = await newLearner();
    await agent.get("/api/trainings/%E0%A4%A").expect(400);
  });

  it("parses TRUST_PROXY hop counts as numbers", () => {
    expect(parseTrustProxy("1")).toBe(1);
    expect(parseTrustProxy("true")).toBe(true);
    expect(parseTrustProxy("loopback")).toBe("loopback");
    expect(parseTrustProxy(undefined)).toBe(false);
  });

  it("does not keep avatar files of failed uploads", async () => {
    const admin = await adminAgent();
    const avatars = path.join(__dirname, "..", "images", "avatars");
    const before = fs.existsSync(avatars) ? fs.readdirSync(avatars).length : 0;
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );

    await admin
      .post("/api/users/99999999/profile-image")
      .attach("image", png, { filename: "a.png", contentType: "image/png" })
      .expect(404);
    expect(fs.existsSync(avatars) ? fs.readdirSync(avatars).length : 0).toBe(before);
  });
});

describe("progress", () => {
  it("completes the training when all instructions are completed concurrently", async () => {
    const { agent, user } = await newLearner();
    await agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    const { body } = await agent.get(`/api/trainings/${TRAINING}`).expect(200);
    const ids = body.training.chapters.flatMap((c) => c.instructions.map((i) => i.id));

    await Promise.all(ids.map((id) => agent.post(`/api/instructions/${id}/complete`).expect(200)));

    const enrollment = await db("enrollments").where({ user_id: user.id, training_id: TRAINING }).first();
    expect(enrollment.completed).toBe(true);
    expect(await db("chapter_completions").where({ user_id: user.id })).toHaveLength(2);
  });
});

describe("sandbox lifecycle", () => {
  it("provisions a sandbox once when retries arrive together", async () => {
    const { agent, user } = await newLearner();
    await agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    await UserSandboxService.waitForProvisioning();
    await db("user_sandboxes").where({ user_id: user.id }).update({ vm_status: "error" });

    const { create, release } = slowCreate();
    const responses = await Promise.all([1, 2, 3].map(() => agent.post(`/api/trainings/${TRAINING}/sandbox`)));
    release();
    await UserSandboxService.waitForProvisioning();

    expect(responses.every((r) => r.status === 202)).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
    expect((await sandboxRow(user.id)).vm_status).toBe("running");
  });

  it("keeps a sandbox deleted while it was being created, and releases the new VM", async () => {
    const { agent, user } = await newLearner();
    const { release } = slowCreate();
    const destroy = jest.spyOn(PROVIDERS.local, "destroy");

    await agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    await agent.delete(`/api/trainings/${TRAINING}/sandbox`).expect(200);

    // While the job is still running a retry is refused instead of racing it.
    await agent.post(`/api/trainings/${TRAINING}/sandbox`).expect(409);

    release();
    await UserSandboxService.waitForProvisioning();

    expect((await sandboxRow(user.id)).vm_status).toBe("deleted");
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("releases the sandbox when an admin removes the enrollment", async () => {
    const { agent, user } = await newLearner();
    await agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    await UserSandboxService.waitForProvisioning();
    const sandbox = await sandboxRow(user.id);
    const enrollment = await db("enrollments").where({ user_id: user.id, training_id: TRAINING }).first();
    const admin = await adminAgent();

    await admin.delete(`/api/admin/enrollments/${enrollment.id}`).expect(200);

    expect((await sandboxRow(user.id)).vm_status).toBe("deleted");
    await agent.post(`/api/user-sandboxes/${sandbox.id}/recreate`).expect(404);
  });

  it("releases a blocked user's sandboxes", async () => {
    const { agent, user } = await newLearner();
    await agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    await UserSandboxService.waitForProvisioning();
    const admin = await adminAgent();

    await admin.post(`/api/admin/users/${user.id}/block`).expect(200);
    expect((await sandboxRow(user.id)).vm_status).toBe("deleted");
  });
});
