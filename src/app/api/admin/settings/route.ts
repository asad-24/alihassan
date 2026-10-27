import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assertOrigin, handle, json, readJson } from "@/lib/http";
import { getSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/validation";
import type { StoreSettings } from "@/lib/types";
export async function GET() {
  return handle(async () => {
    await requireAdmin();
    return json({ settings: await getSettings() });
  });
}
export async function PATCH(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    await requireAdmin();
    const settings = settingsSchema.parse(await readJson(request));
    await (
      await getDb()
    )
      .collection<StoreSettings & { _id: string }>("settings")
      .updateOne({ _id: "store" }, { $set: settings }, { upsert: true });
    return json({ settings });
  });
}
