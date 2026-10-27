import { loadEnvConfig } from "@next/env";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { seed } from "./seed";
import { getClient } from "../src/lib/db";

async function availablePort(preferred: number): Promise<number> {
  for (let port = preferred; port < preferred + 20; port++) {
    const available = await new Promise<boolean>((done) => {
      const server = createServer();
      server.once("error", () => done(false));
      server.listen(port, () => server.close(() => done(true)));
    });
    if (available) return port;
  }
  throw new Error("No available development port was found.");
}
async function main() {
  const { loadedEnvFiles } = loadEnvConfig(process.cwd(), true);
  const hasEnvFile = loadedEnvFiles.some(
    (file) => file.path === ".env" || file.path === ".env.local",
  );
  if (
    process.env.MONGODB_URI &&
    !process.env.MONGODB_URI.includes("127.0.0.1:27018")
  ) {
    throw new Error(
      "An external MongoDB is configured. Use npm run seed and npm run dev instead of dev:local.",
    );
  }
  const port = await availablePort(Number(process.env.PORT) || 3000);
  if (!hasEnvFile) {
    await writeFile(
      ".env.local",
      `MONGODB_URI=mongodb://127.0.0.1:27018/?replicaSet=rs0\nMONGODB_DB=almakkah\nSESSION_SECRET=${randomBytes(32).toString("hex")}\nAPP_URL=http://localhost:${port}\nADMIN_EMAIL=admin@almakkah.local\nADMIN_PASSWORD=${randomBytes(18).toString("base64url")}\n`,
      { mode: 0o600, flag: "wx" },
    );
    process.loadEnvFile(".env.local");
  }
  process.env.APP_URL = `http://localhost:${port}`;
  const dbPath = resolve(".data/mongodb");
  await mkdir(dbPath, { recursive: true });
  if ((await availablePort(27018)) !== 27018)
    throw new Error(
      "Local MongoDB port 27018 is already in use. Stop the existing dev:local process before starting another.",
    );
  const mongo = await MongoMemoryReplSet.create({
    instanceOpts: [{ port: 27018, dbPath }],
    replSet: {
      count: 1,
      storageEngine: "wiredTiger",
      name: "rs0",
      spawn: { detached: process.platform !== "win32" },
    },
  });
  try {
    await seed();
  } catch (error) {
    await mongo.stop({ doCleanup: false });
    throw error;
  } finally {
    await (await getClient()).close();
  }
  console.log(
    "Local MongoDB is ready. Data persists in .data/mongodb. Administrator credentials are in .env.local.",
  );
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--port", String(port)],
    { stdio: "inherit", env: process.env },
  );
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    child.kill("SIGTERM");
    await mongo.stop({ doCleanup: false });
  };
  process.on("SIGINT", () => {
    void stop();
  });
  process.on("SIGTERM", () => {
    void stop();
  });
  child.on("exit", () => {
    void stop();
  });
  child.on("error", () => {
    process.exitCode = 1;
    void stop();
  });
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Local development failed.",
  );
  process.exitCode = 1;
});
