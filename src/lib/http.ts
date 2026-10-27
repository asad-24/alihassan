import { ZodError } from "zod";
import { MongoServerError } from "mongodb";
import { isDatabaseConfigured } from "./db";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function requireDatabase() {
  if (!isDatabaseConfigured())
    throw new ApiError(
      503,
      "The shop is being set up. Please try again later.",
    );
}
export function assertOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_URL
    ? new URL(process.env.APP_URL).origin
    : new URL(request.url).origin;
  if (!origin || origin !== expected)
    throw new ApiError(403, "Request origin is not allowed.");
}
export async function readJson(request: Request) {
  if (Number(request.headers.get("content-length")) > 32000)
    throw new ApiError(413, "Request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "A JSON body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 32000) {
        await reader.cancel();
        throw new ApiError(413, "Request is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, "Invalid JSON request.");
  }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export function errorResponse(error: unknown) {
  if (error instanceof ApiError)
    return json({ error: error.message }, error.status);
  if (error instanceof ZodError)
    return json(
      { error: error.issues[0]?.message || "Please check your information." },
      400,
    );
  if (error instanceof MongoServerError && error.code === 11000)
    return json(
      { error: "This email or product identifier already exists." },
      409,
    );
  console.error(
    "Request failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  return json({ error: "Something went wrong. Please try again." }, 500);
}
export async function handle(action: () => Promise<Response>) {
  try {
    return await action();
  } catch (error) {
    return errorResponse(error);
  }
}
