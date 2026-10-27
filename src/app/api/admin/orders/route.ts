import { requireAdmin } from "@/lib/auth";
import { collections } from "@/lib/db";
import { handle, json } from "@/lib/http";
export async function GET(request: Request) {
  return handle(async () => {
    await requireAdmin();
    const url = new URL(request.url);
    const page = Math.max(
      1,
      Math.min(10000, Number(url.searchParams.get("page")) || 1),
    );
    const { orders } = await collections();
    const [items, total] = await Promise.all([
      orders
        .find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * 30)
        .limit(30)
        .toArray(),
      orders.countDocuments(),
    ]);
    return json({ orders: items, total, page, pages: Math.ceil(total / 30) });
  });
}
