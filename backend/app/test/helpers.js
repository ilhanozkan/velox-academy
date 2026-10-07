const request = require("supertest");

const app = require("../app");

let counter = 0;

const ADMIN = {
  email: process.env.ADMIN_EMAIL || "contact.ilhanozkan@gmail.com",
  password: process.env.ADMIN_PASSWORD || "1234",
};

const uniqueUser = (overrides = {}) => {
  counter += 1;
  const id = `${Date.now().toString(36)}${counter}`;
  return {
    username: `learner_${id}`,
    email: `learner_${id}@example.com`,
    password: "secret123",
    ...overrides,
  };
};

/** Registers a new user and returns an agent that carries their session. */
const newLearner = async (overrides) => {
  const agent = request.agent(app);
  const data = uniqueUser(overrides);
  const res = await agent.post("/api/auth/register").send(data).expect(201);
  return { agent, user: res.body.user, credentials: data };
};

const adminAgent = async () => {
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send(ADMIN).expect(200);
  return agent;
};

module.exports = { app, request, uniqueUser, newLearner, adminAgent, ADMIN };
