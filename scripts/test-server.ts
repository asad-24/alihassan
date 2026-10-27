import { MongoMemoryReplSet } from "mongodb-memory-server";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { seed } from "./seed";
import { getClient } from "../src/lib/db";

async function main() {
  const mongo = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DB = "almakkah_e2e";
  process.env.SESSION_SECRET = randomBytes(32).toString("hex");
  process.env.APP_URL = "http://localhost:3100";
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_EMAIL = "admin@example.test";
  process.env.ADMIN_PASSWORD = "Test-Administrator-Password!";
  await seed();
  await (await getClient()).close();
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--port", "3100"],
    { stdio: "inherit", env: process.env },
  );
  let stopping = false;
  async function stop() {
    if (stopping) return;
    stopping = true;
    child.kill("SIGTERM");
    await mongo.stop();
  }
  process.on("SIGINT", () => {
    void stop();
  });
  process.on("SIGTERM", () => {
    void stop();
  });
  child.on("exit", () => {
    void stop();
  });
}
main().catch(() => {
  console.error("Test server could not start.");
  process.exitCode = 1;
});
