import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { collections } from "@/lib/db";
import { createSession, rateLimit } from "@/lib/auth";
import {
  assertOrigin,
  handle,
  json,
  readJson,
  requireDatabase,
} from "@/lib/http";
import { registerSchema } from "@/lib/validation";
import type { UserDocument } from "@/lib/types";
export async function POST(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    requireDatabase();
    const data = registerSchema.parse(await readJson(request));
    await rateLimit("registration", 50);
    await rateLimit(`register:${data.email}`, 3);
    const user: UserDocument = {
      _id: randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: await hash(data.password, 12),
      role: "customer",
      createdAt: new Date().toISOString(),
    };
    await (await collections()).users.insertOne(user);
    await createSession(user);
    const { passwordHash: _, ...safeUser } = user;
    void _;
    return json({ user: safeUser }, 201);
  });
}
