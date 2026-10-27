import { MongoClient } from "mongodb";
import type { Product, UserDocument, Order } from "./types";
const globalMongo = globalThis as unknown as {
  mongoPromise?: Promise<MongoClient>;
};
export function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI);
}
export async function getClient() {
  if (!process.env.MONGODB_URI) throw new Error("Database not configured");
  if (!globalMongo.mongoPromise) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    globalMongo.mongoPromise = client.connect().catch((error) => {
      globalMongo.mongoPromise = undefined;
      throw error;
    });
  }
  return globalMongo.mongoPromise;
}
export async function getDb() {
  return (await getClient()).db(process.env.MONGODB_DB || "almakkah");
}
export async function collections() {
  const db = await getDb();
  return {
    products: db.collection<Product>("products"),
    users: db.collection<UserDocument>("users"),
    orders: db.collection<Order>("orders"),
  };
}
export async function ensureIndexes() {
  const { products, users, orders } = await collections();
  const db = await getDb();
  await Promise.all([
    products.createIndex({ slug: 1 }, { unique: true }),
    products.createIndex({ active: 1, category: 1, createdAt: -1 }),
    users.createIndex({ email: 1 }, { unique: true }),
    users.createIndex({ username: 1 }, { unique: true, sparse: true }),
    orders.createIndex({ idempotencyKey: 1 }, { unique: true }),
    orders.createIndex({ userId: 1, createdAt: -1 }),
    orders.createIndex({ createdAt: -1 }),
    db
      .collection("rateLimits")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db
      .collection("sessions")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}
