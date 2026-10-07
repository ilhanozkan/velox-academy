// Environment for every test file (runs before the app is required).
process.env.NODE_ENV = "test";
process.env.SANDBOX_PROVIDER = process.env.SANDBOX_PROVIDER || "local";
process.env.LOCAL_SANDBOX_URL = "http://sandbox.test:9000";
process.env.LOCAL_SANDBOX_TOKEN = "test-sandbox-token";
process.env.AUTH_RATE_LIMIT_MAX = process.env.AUTH_RATE_LIMIT_MAX || "1000";
