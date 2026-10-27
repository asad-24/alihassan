import { requireAdmin } from "@/lib/auth";
import { collections } from "@/lib/db";
import { handle, json } from "@/lib/http";
export async function GET() {
  return handle(async () => {
    await requireAdmin();
    return json({
      customers: await (
        await collections()
      ).users
        .find({ role: "customer" }, { projection: { passwordHash: 0 } })
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray(),
    });
  });
}
