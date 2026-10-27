import { currentUser } from "@/lib/auth";
import { collections } from "@/lib/db";
import { ApiError, handle, json, requireDatabase } from "@/lib/http";
import { tokenMatches } from "@/lib/shop";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    requireDatabase();
    const { id } = await context.params;
    const order = await (await collections()).orders.findOne({ _id: id });
    const user = await currentUser();
    const token = request.headers.get("x-order-token") || "";
    if (
      !order ||
      !(
        user?.role === "admin" ||
        (user && order.userId === user._id) ||
        tokenMatches(order.trackingToken, token)
      )
    )
      throw new ApiError(404, "Order not found.");
    return json({ order });
  });
}
