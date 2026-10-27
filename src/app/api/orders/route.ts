import { currentUser, rateLimit, requireUser } from "@/lib/auth";
import { collections } from "@/lib/db";
import {
  assertOrigin,
  handle,
  json,
  readJson,
  requireDatabase,
} from "@/lib/http";
import { checkoutSchema } from "@/lib/validation";
import { placeOrder } from "@/lib/shop";
export async function POST(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    requireDatabase();
    const input = checkoutSchema.parse(await readJson(request));
    await rateLimit(`checkout:${input.customer.email}`, 10);
    const user = await currentUser();
    const order = await placeOrder(input, user?._id || null);
    return json({ order }, 201);
  });
}
export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const orders = await (
      await collections()
    ).orders
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return json({ orders });
  });
}
