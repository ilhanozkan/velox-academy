const db = require("../config/db");
const UserSandboxService = require("../services/userSandboxService");
const { newLearner } = require("./helpers");

afterAll(async () => {
  await UserSandboxService.waitForProvisioning();
  await db.destroy();
});

const TRAINING = "database-management-101";
const FIRST_CHAPTER = "database-management-101-chapter-1";

const chapterInstructions = async (chapterId) =>
  (await db("instructions").where("chapter_id", chapterId).orderBy("position")).map((i) => i.id);

describe("catalog", () => {
  it("lists trainings with enrollment and progress", async () => {
    const { agent } = await newLearner();
    const res = await agent.get("/api/trainings").expect(200);

    const training = res.body.trainings.find((t) => t.id === TRAINING);
    expect(training).toMatchObject({
      isEnrolled: false,
      chapterCount: 3,
      instructionCount: 12,
      category: { name: "Database Management" },
      progress: { completedInstructions: 0, totalInstructions: 12, percent: 0 },
    });
  });

  it("serves the ordered curriculum with markdown content", async () => {
    const { agent } = await newLearner();
    const res = await agent.get(`/api/trainings/${TRAINING}`).expect(200);

    const { chapters } = res.body.training;
    expect(chapters.map((c) => c.position)).toEqual([1, 2, 3]);
    expect(chapters[0].instructions.map((i) => i.position)).toEqual([1, 2, 3, 4]);
    expect(chapters[0].instructions[0].content).toMatch(/^# SQL nedir\?/);
    expect(chapters[0].instructions[1].achievements[0].id).toBe("db101-first-query");
  });

  it("serves /trainings/enrollments instead of treating it as a training id", async () => {
    const { agent } = await newLearner();
    const res = await agent.get("/api/trainings/enrollments").expect(200);
    expect(res.body.enrollments).toEqual([]);
  });
});

describe("enrollment and sandbox", () => {
  it("enrolls immediately and provisions the sandbox in the background", async () => {
    const { agent } = await newLearner();

    const res = await agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    expect(res.body.enrollment.sandbox).toMatchObject({ vmStatus: "creating", accessUrl: null });

    await UserSandboxService.waitForProvisioning();

    const sandbox = await agent.get(`/api/trainings/${TRAINING}/sandbox`).expect(200);
    expect(sandbox.body.sandbox).toMatchObject({
      vmStatus: "running",
      provider: "local",
      accessUrl: "http://sandbox.test:9000",
      accessToken: "test-sandbox-token",
    });

    await agent.post(`/api/trainings/${TRAINING}/enroll`).expect(409);
  });

  it("keeps sandboxes private to their owner", async () => {
    const owner = await newLearner();
    const other = await newLearner();
    await owner.agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    await UserSandboxService.waitForProvisioning();

    const { body } = await owner.agent.get(`/api/trainings/${TRAINING}/sandbox`);
    await other.agent.post(`/api/user-sandboxes/${body.sandbox.id}/recreate`).expect(404);
    await other.agent.post(`/api/user-sandboxes/${body.sandbox.id}/refresh-ip`).expect(404);
    await other.agent.get(`/api/trainings/${TRAINING}/sandbox`).expect(404);
  });

  it("deletes and recreates a sandbox", async () => {
    const { agent } = await newLearner();
    await agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    await UserSandboxService.waitForProvisioning();

    await agent.delete(`/api/trainings/${TRAINING}/sandbox`).expect(200);
    const deleted = await agent.get(`/api/trainings/${TRAINING}/sandbox`).expect(200);
    expect(deleted.body.sandbox).toMatchObject({ vmStatus: "deleted", accessUrl: null, accessToken: null });

    const retry = await agent.post(`/api/trainings/${TRAINING}/sandbox`).expect(202);
    expect(retry.body.sandbox.vmStatus).toBe("creating");
    await UserSandboxService.waitForProvisioning();
    const running = await agent.get(`/api/trainings/${TRAINING}/sandbox`).expect(200);
    expect(running.body.sandbox.vmStatus).toBe("running");
  });

  it("refuses sandboxes for trainings the user is not enrolled in", async () => {
    const { agent } = await newLearner();
    await agent.post(`/api/trainings/${TRAINING}/sandbox`).expect(404);
  });
});

describe("progress", () => {
  it("requires enrollment to complete instructions", async () => {
    const { agent } = await newLearner();
    const [first] = await chapterInstructions(FIRST_CHAPTER);
    await agent.post(`/api/instructions/${first}/complete`).expect(403);
  });

  it("records completions, awards achievements once and completes chapters", async () => {
    const { agent, user } = await newLearner();
    await agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    const ids = await chapterInstructions(FIRST_CHAPTER);

    // The second instruction awards "İlk Sorgu".
    const first = await agent.post(`/api/instructions/${ids[1]}/complete`).expect(200);
    expect(first.body.completion.newAchievements.map((a) => a.id)).toEqual(["db101-first-query"]);
    expect(first.body.completion.progress).toMatchObject({ completedInstructions: 1, totalInstructions: 12 });

    const again = await agent.post(`/api/instructions/${ids[1]}/complete`).expect(200);
    expect(again.body.completion.newAchievements).toEqual([]);
    expect(again.body.completion.progress.completedInstructions).toBe(1);

    // Chapter cannot be completed while instructions remain.
    const early = await agent.post(`/api/chapters/${FIRST_CHAPTER}/complete`).expect(409);
    expect(early.body.details.remaining).toBe(3);

    let last;
    for (const id of ids) last = await agent.post(`/api/instructions/${id}/complete`).expect(200);
    expect(last.body.completion.chapterCompleted).toBe(true);

    const achievements = await agent.get(`/api/users/${user.id}/achievements`).expect(200);
    expect(achievements.body.achievements.map((a) => a.id)).toEqual(["db101-first-query"]);

    const detail = await agent.get(`/api/trainings/${TRAINING}`).expect(200);
    expect(detail.body.training.chapters[0]).toMatchObject({ completed: true });
    expect(detail.body.training.progress).toMatchObject({ completedInstructions: 4, percent: 33 });
  });

  it("completes the training when every instruction is done, and can be undone", async () => {
    const { agent, user } = await newLearner();
    const training = "web-dev-101";
    await agent.post(`/api/trainings/${training}/enroll`).expect(201);

    await agent.post(`/api/trainings/${training}/complete`).expect(409);

    const detail = await agent.get(`/api/trainings/${training}`).expect(200);
    const ids = detail.body.training.chapters.flatMap((c) => c.instructions.map((i) => i.id));

    let last;
    for (const id of ids) last = await agent.post(`/api/instructions/${id}/complete`).expect(200);
    expect(last.body.completion.trainingCompleted).toBe(true);

    const stats = await agent.get(`/api/users/${user.id}/stats`).expect(200);
    expect(stats.body.stats.totals).toMatchObject({
      enrolledTrainings: 1,
      completedTrainings: 1,
      completedInstructions: ids.length,
      achievements: 2,
      points: 30,
    });
    expect(stats.body.stats.activity).toHaveLength(14);
    expect(stats.body.stats.activity.at(-1).count).toBe(ids.length);
    expect(stats.body.stats.recentActivity[0].trainingId).toBe(training);

    const undone = await agent.delete(`/api/instructions/${ids[0]}/complete`).expect(200);
    expect(undone.body.completion.progress.completedInstructions).toBe(ids.length - 1);
    const enrollments = await agent.get("/api/trainings/enrollments").expect(200);
    expect(enrollments.body.enrollments[0]).toMatchObject({ completed: false, completed_at: null });
  });

  it("ignores a userId sent in the body", async () => {
    const victim = await newLearner();
    const attacker = await newLearner();
    await victim.agent.post(`/api/trainings/${TRAINING}/enroll`).expect(201);
    const [first] = await chapterInstructions(FIRST_CHAPTER);

    // The attacker is not enrolled, so completing on their own behalf fails;
    // the victim's id in the body is ignored.
    await attacker.agent
      .post(`/api/instructions/${first}/complete`)
      .send({ userId: victim.user.id })
      .expect(403);
  });
});
