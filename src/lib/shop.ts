import { randomUUID, timingSafeEqual } from "node:crypto";
import { collections, getClient, isDatabaseConfigured } from "./db";
import { sampleProducts } from "./catalog";
import { ApiError } from "./http";
import { checkoutSchema } from "./validation";
import { shippingFor } from "./utils";
import type { Order, OrderStatus, Product } from "./types";
export async function getProducts(includeInactive = false): Promise<Product[]> {
  if (!isDatabaseConfigured()) return sampleProducts;
  return (await collections()).products
    .find(includeInactive ? {} : { active: true })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();
}
export async function getProduct(slug: string) {
  if (!isDatabaseConfigured())
    return sampleProducts.find((p) => p.slug === slug) || null;
  return (await collections()).products.findOne({ slug, active: true });
}
export function tokenMatches(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export async function placeOrder(
  input: unknown,
  userId: string | null,
): Promise<Order> {
  const data = checkoutSchema.parse(input);
  const { products, orders } = await collections();
  const session = (await getClient()).startSession();
  try {
    return await session.withTransaction(async () => {
      const previous = await orders.findOne(
        { idempotencyKey: data.idempotencyKey },
        { session },
      );
      if (previous) {
        if (
          previous.customer.email !== data.customer.email ||
          previous.userId !== userId
        )
          throw new ApiError(409, "Please start a new checkout.");
        return previous;
      }
      const items = [];
      for (const item of [...data.items].sort((a, b) =>
        a.productId.localeCompare(b.productId),
      )) {
        const product = await products.findOneAndUpdate(
          { _id: item.productId, active: true, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, returnDocument: "before" },
        );
        if (!product)
          throw new ApiError(
            409,
            "An item is no longer available in the requested quantity. Please update your cart.",
          );
        items.push({
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: item.quantity,
        });
      }
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const shipping = shippingFor(subtotal);
      const now = new Date().toISOString();
      const id = randomUUID();
      const order: Order = {
        _id: id,
        number: `AM-${id.replaceAll("-", "").slice(0, 12).toUpperCase()}`,
        userId,
        customer: data.customer,
        items,
        subtotal,
        shipping,
        total: subtotal + shipping,
        paymentMethod: "cod",
        status: "pending",
        createdAt: now,
        updatedAt: now,
        idempotencyKey: data.idempotencyKey,
        trackingToken: randomUUID(),
      };
      await orders.insertOne(order, { session });
      return order;
    });
  } finally {
    await session.endSession();
  }
}
const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { orders, products } = await collections();
  const session = (await getClient()).startSession();
  try {
    return await session.withTransaction(async () => {
      const order = await orders.findOne({ _id: id }, { session });
      if (!order) throw new ApiError(404, "Order not found.");
      if (order.status === status) return order;
      if (!transitions[order.status].includes(status))
        throw new ApiError(
          409,
          `Cannot move a ${order.status} order to ${status}.`,
        );
      if (status === "cancelled")
        for (const item of order.items)
          await products.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } },
            { session },
          );
      const updatedAt = new Date().toISOString();
      await orders.updateOne(
        { _id: id },
        { $set: { status, updatedAt } },
        { session },
      );
      return { ...order, status, updatedAt };
    });
  } finally {
    await session.endSession();
  }
}
