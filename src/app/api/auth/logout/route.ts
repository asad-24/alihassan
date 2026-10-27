import { endSession } from "@/lib/auth";
import { assertOrigin, handle, json } from "@/lib/http";
export async function POST(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    await endSession();
    return json({ ok: true });
  });
}
