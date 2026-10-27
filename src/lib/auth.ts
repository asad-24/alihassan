import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID, createHash } from "node:crypto";
import { collections, getDb, isDatabaseConfigured } from "./db";
import { ApiError } from "./http";
import type { User } from "./types";
const cookieName = "almakkah_session";
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32)
    throw new ApiError(503, "Account services are not configured yet.");
  return new TextEncoder().encode(value);
}
export async function createSession(user: User) {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({ sid: id })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user._id)
    .setIssuer("almakkah")
    .setAudience("almakkah-shop")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  await (
    await getDb()
  )
    .collection("sessions")
    .insertOne({ sid: id, userId: user._id, expiresAt });
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !isDatabaseConfigured()) return null;
  let payload;
  try {
    payload = (
      await jwtVerify(token, secret(), {
        algorithms: ["HS256"],
        issuer: "almakkah",
        audience: "almakkah-shop",
      })
    ).payload;
  } catch {
    return null;
  }
  if (typeof payload.sub !== "string" || typeof payload.sid !== "string")
    return null;
  const session = await (
    await getDb()
  )
    .collection("sessions")
    .findOne({
      sid: payload.sid,
      userId: payload.sub,
      expiresAt: { $gt: new Date() },
    });
  if (!session) return null;
  const user = await (
    await collections()
  ).users.findOne({ _id: payload.sub }, { projection: { passwordHash: 0 } });
  return user as User | null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "Please sign in to continue.");
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin")
    throw new ApiError(403, "Administrator access is required.");
  return user;
}
export async function endSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (token && isDatabaseConfigured()) {
    let sid: unknown;
    try {
      const { payload } = await jwtVerify(token, secret(), {
        algorithms: ["HS256"],
        issuer: "almakkah",
        audience: "almakkah-shop",
      });
      sid = payload.sid;
    } catch {
      /* Invalid tokens are also cleared. */
    }
    if (typeof sid === "string")
      await (await getDb()).collection("sessions").deleteOne({ sid });
  }
  store.delete(cookieName);
}
export async function rateLimit(key: string, limit = 10, minutes = 15) {
  const bucket = Math.floor(Date.now() / (minutes * 60000));
  const id = createHash("sha256").update(`${key}:${bucket}`).digest("hex");
  const collection = (await getDb()).collection<{
    _id: string;
    count: number;
    expiresAt: Date;
  }>("rateLimits");
  const result = await collection.findOneAndUpdate(
    { _id: id },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((bucket + 1) * minutes * 60000) },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (result && result.count > limit)
    throw new ApiError(
      429,
      "Too many attempts. Please try again in a few minutes.",
    );
}
