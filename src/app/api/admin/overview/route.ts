import { requireAdmin } from "@/lib/auth";
import { collections } from "@/lib/db";
import { handle, json } from "@/lib/http";
export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const { orders, products, users } = await collections();
    const [summary, productCount, customerCount, lowStock, recentOrders] =
      await Promise.all([
        orders
          .aggregate([
            {
              $group: {
                _id: null,
                orders: { $sum: 1 },
                revenue: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "delivered"] }, "$total", 0],
                  },
                },
                pending: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
              },
            },
          ])
          .toArray(),
        products.countDocuments({ active: true }),
        users.countDocuments({ role: "customer" }),
        products
          .find({ active: true, stock: { $lte: 5 } })
          .limit(20)
          .toArray(),
        orders.find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      ]);
    return json({
      orders: summary[0]?.orders || 0,
      revenue: summary[0]?.revenue || 0,
      pending: summary[0]?.pending || 0,
      productCount,
      customerCount,
      lowStock,
      recentOrders,
    });
  });
}
