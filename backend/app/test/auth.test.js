const db = require("../config/db");
const { app, request, uniqueUser, newLearner, adminAgent } = require("./helpers");

afterAll(() => db.destroy());

describe("registration", () => {
  it("rejects invalid input with field messages", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "a", email: "not-an-email", password: "1" })
      .expect(400);

    expect(Object.keys(res.body.details).sort()).toEqual(["email", "password", "username"]);
    expect(res.body.details.password).toMatch(/en az 6 karakter/);
  });

  it("creates a user, starts an httpOnly session and never returns the hash", async () => {
    const data = uniqueUser();
    const res = await request(app).post("/api/auth/register").send(data).expect(201);

    expect(res.body.user).toMatchObject({ username: data.username, role: "user", status: "active" });
    expect(res.body.user.password).toBeUndefined();

    const cookie = res.headers["set-cookie"].find((c) => c.startsWith("token="));
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
  });

  it("ignores attempts to self-assign the admin role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(uniqueUser({ role: "admin", status: "active" }))
      .expect(201);
    expect(res.body.user.role).toBe("user");
  });

  it("returns 409 for a duplicate e-mail (case-insensitive)", async () => {
    const data = uniqueUser();
    await request(app).post("/api/auth/register").send(data).expect(201);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...uniqueUser(), email: data.email.toUpperCase() })
      .expect(409);
    expect(res.body.details.email).toBeDefined();
  });
});

describe("login and session", () => {
  it("rejects wrong credentials with a generic message", async () => {
    const { credentials } = await newLearner();
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "nope" })
      .expect(401);
    const unknownUser = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "nope" })
      .expect(401);

    expect(wrongPassword.body.error).toBe(unknownUser.body.error);
  });

  it("logs in, reads the profile, and logs out", async () => {
    const { credentials } = await newLearner();
    const agent = request.agent(app);

    const login = await agent
      .post("/api/auth/login")
      .send({ email: credentials.email.toUpperCase(), password: credentials.password })
      .expect(200);
    expect(login.body.user.last_login_at).toBeTruthy();

    const profile = await agent.get("/api/auth/profile").expect(200);
    expect(profile.body.user.email).toBe(credentials.email);

    await agent.post("/api/auth/logout").expect(200);
    await agent.get("/api/auth/profile").expect(401);
  });

  it("accepts a Bearer token for API clients", async () => {
    const { credentials } = await newLearner();
    const { body } = await request(app).post("/api/auth/login").send(credentials).expect(200);

    await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${body.token}`)
      .expect(200);
  });

  it("rejects a tampered token", async () => {
    await request(app)
      .get("/api/auth/profile")
      .set("Cookie", "token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.invalid")
      .expect(401);
  });
});

describe("profile and password", () => {
  it("updates profile fields but not the role", async () => {
    const { agent } = await newLearner();
    const res = await agent
      .patch("/api/auth/profile")
      .send({ full_name: "Ada Lovelace", role: "admin" })
      .expect(200);

    expect(res.body.user).toMatchObject({ full_name: "Ada Lovelace", role: "user" });
  });

  it("changes the password only with the current one, and stores a hash", async () => {
    const { agent, user, credentials } = await newLearner();

    await agent
      .post("/api/auth/change-password")
      .send({ currentPassword: "wrong", newPassword: "another123" })
      .expect(401);
    await agent
      .post("/api/auth/change-password")
      .send({ currentPassword: credentials.password, newPassword: "another123" })
      .expect(200);

    const row = await db("users").where({ id: user.id }).first();
    expect(row.password).toMatch(/^\$2[aby]\$/);

    await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "another123" })
      .expect(200);
  });
});

describe("blocked users", () => {
  it("cannot log in and lose their existing session immediately", async () => {
    const { agent, user, credentials } = await newLearner();
    const admin = await adminAgent();

    await admin.post(`/api/admin/users/${user.id}/block`).expect(200);

    await agent.get("/api/auth/profile").expect(403);
    await request(app).post("/api/auth/login").send(credentials).expect(403);

    await admin.post(`/api/admin/users/${user.id}/unblock`).expect(200);
    await agent.get("/api/auth/profile").expect(200);
  });
});

describe("rate limiting", () => {
  it("throttles repeated login attempts", async () => {
    let limitedApp;
    let limitedDb;
    jest.isolateModules(() => {
      process.env.AUTH_RATE_LIMIT_MAX = "3";
      limitedApp = require("../app");
      limitedDb = require("../config/db");
    });
    process.env.AUTH_RATE_LIMIT_MAX = "1000";

    const attempt = () =>
      request(limitedApp).post("/api/auth/login").send({ email: "x@example.com", password: "y" });

    for (let i = 0; i < 3; i++) expect((await attempt()).status).toBe(401);
    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBeDefined();

    await limitedDb.destroy();
  });
});
