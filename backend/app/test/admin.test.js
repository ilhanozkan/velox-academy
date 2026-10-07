const db = require("../config/db");
const UserSandboxService = require("../services/userSandboxService");
const { newLearner, adminAgent } = require("./helpers");

afterAll(async () => {
  await UserSandboxService.waitForProvisioning();
  await db.destroy();
});

describe("admin", () => {
  it("returns numeric dashboard statistics", async () => {
    const admin = await adminAgent();
    const res = await admin.get("/api/admin/dashboard/stats").expect(200);

    const { stats } = res.body;
    for (const key of ["totalUsers", "activeUsers", "blockedUsers", "totalTrainings", "totalEnrollments"])
      expect(typeof stats[key]).toBe("number");
    expect(stats.totalTrainings).toBeGreaterThanOrEqual(4);
    expect(Array.isArray(stats.popularTrainings)).toBe(true);
  });

  it("lists users with their activity counts", async () => {
    const { agent, user } = await newLearner();
    await agent.post("/api/trainings/web-dev-101/enroll").expect(201);
    const admin = await adminAgent();

    const res = await admin.get("/api/admin/users").expect(200);
    const listed = res.body.users.find((u) => u.id === user.id);
    expect(listed).toMatchObject({ enrollmentCount: 1, achievementCount: 0, role: "user" });
    expect(listed.password).toBeUndefined();
  });

  it("changes roles but never the admin's own role or status", async () => {
    const { user } = await newLearner();
    const admin = await adminAgent();
    const me = (await admin.get("/api/auth/profile")).body.user;

    await admin.put(`/api/admin/users/${user.id}/role`).send({ role: "superuser" }).expect(400);
    const promoted = await admin.put(`/api/admin/users/${user.id}/role`).send({ role: "admin" }).expect(200);
    expect(promoted.body.user.role).toBe("admin");

    await admin.put(`/api/admin/users/${me.id}/role`).send({ role: "user" }).expect(409);
    await admin.post(`/api/admin/users/${me.id}/block`).expect(409);
  });

  it("manages the curriculum and cascades deletes", async () => {
    const admin = await adminAgent();
    const id = `test-training-${Date.now()}`;

    await admin
      .post("/api/admin/trainings")
      .send({ id, name: "Test", slug: id, image_file_path: "images/web-dev-101.jpg", level: "expert" })
      .expect(400);
    await admin
      .post("/api/admin/trainings")
      .send({ id, name: "Test", slug: id, image_file_path: "images/web-dev-101.jpg", estimated_minutes: 30 })
      .expect(201);
    await admin
      .post("/api/admin/trainings")
      .send({ id, name: "Test", slug: `${id}-2`, image_file_path: "x" })
      .expect(409);

    const chapter = await admin
      .post("/api/admin/chapters")
      .send({ id: `${id}-c1`, name: "Bölüm", training_id: id })
      .expect(201);
    expect(chapter.body.chapter.position).toBe(1);

    const instruction = await admin
      .post("/api/admin/instructions")
      .send({ id: `${id}-i1`, name: "Adım", chapter_id: `${id}-c1`, content: "# Merhaba" })
      .expect(201);
    expect(instruction.body.instruction.position).toBe(1);

    // A learner enrolls, then the training is deleted with everything below it.
    const { agent } = await newLearner();
    await agent.post(`/api/trainings/${id}/enroll`).expect(201);
    await UserSandboxService.waitForProvisioning();

    await admin.delete(`/api/admin/trainings/${id}`).expect(200);
    expect(await db("chapters").where("training_id", id)).toHaveLength(0);
    expect(await db("instructions").where("chapter_id", `${id}-c1`)).toHaveLength(0);
    expect(await db("enrollments").where("training_id", id)).toHaveLength(0);
    expect(await db("user_sandboxes").where("training_id", id)).toHaveLength(0);
  });

  it("deletes a user together with their data", async () => {
    const { agent, user } = await newLearner();
    await agent.post("/api/trainings/web-dev-101/enroll").expect(201);
    await UserSandboxService.waitForProvisioning();
    const admin = await adminAgent();

    await admin.delete(`/api/users/${user.id}`).expect(200);
    expect(await db("enrollments").where("user_id", user.id)).toHaveLength(0);
    expect(await db("user_sandboxes").where("user_id", user.id)).toHaveLength(0);
  });
});
