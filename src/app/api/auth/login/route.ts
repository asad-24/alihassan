import { compare } from "bcryptjs";
import { collections } from "@/lib/db";
import { createSession, rateLimit } from "@/lib/auth";
import {
  ApiError,
  assertOrigin,
  handle,
  json,
  readJson,
  requireDatabase,
} from "@/lib/http";
import { loginSchema } from "@/lib/validation";
const dummyHash =
  "$2b$12$/Uh0ekLXik99ZC29HlSAVeyKHebsOwfPbjp6aVWR6w462FPh7MvKO";
export async function POST(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    requireDatabase();
    const data = loginSchema.parse(await readJson(request));
    await rateLimit(`login:${data.identifier}`);
    const user = await (
      await collections()
    ).users.findOne(
      data.identifier.includes("@")
        ? { email: data.identifier }
        : { username: data.identifier, role: "admin" },
    );
    const valid = await compare(data.password, user?.passwordHash || dummyHash);
    if (!user || !valid)
      throw new ApiError(401, "Email, username, or password is incorrect.");
    await createSession(user);
    const { passwordHash: _, ...safeUser } = user;
    void _;
    return json({ user: safeUser });
  });
}
