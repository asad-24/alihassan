import { requireAdmin } from "@/lib/auth";
import { ApiError, assertOrigin, handle, json, readJson } from "@/lib/http";
import { statusSchema } from "@/lib/validation";
import { updateOrderStatus } from "@/lib/shop";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    assertOrigin(request);
    await requireAdmin();
    const { status } = statusSchema.parse(await readJson(request));
    const { id } = await context.params;
    if (id.length > 100) throw new ApiError(400, "Invalid order.");
    return json({ order: await updateOrderStatus(id, status) });
  });
}
