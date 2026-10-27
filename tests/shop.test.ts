import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { collections, ensureIndexes, getClient } from "../src/lib/db";
import { sampleProducts } from "../src/lib/catalog";
import { placeOrder, updateOrderStatus, tokenMatches } from "../src/lib/shop";

let mongo: MongoMemoryReplSet;
before(async () => {
  mongo = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  process.env.MONGODB_URI = mongo.getUri();
  process.env.MONGODB_DB = "almakkah_test";
  await ensureIndexes();
});
beforeEach(async () => {
  const { products, orders } = await collections();
  await products.deleteMany({});
  await orders.deleteMany({});
  await products.insertMany(structuredClone(sampleProducts));
});
after(async () => {
  if (mongo) {
    await (await getClient()).close();
    await mongo.stop();
  }
});
const customer = {
  name: "Test Customer",
  email: "customer@example.test",
  phone: "03001234567",
  address: "House 25, Test Street",
  city: "Lahore",
  postalCode: "54000",
  notes: "",
};
const input = (items = [{ productId: "everyday-aviator", quantity: 1 }]) => ({
  customer,
  items,
  paymentMethod: "cod",
  idempotencyKey: randomUUID(),
});
test("checkout uses database prices and calculates shipping on the server", async () => {
  const data = input();
  const order = await placeOrder(
    { ...data, total: 1, shipping: 0, items: [{ ...data.items[0], price: 1 }] },
    null,
  );
  assert.equal(order.subtotal, 3500);
  assert.equal(order.shipping, 250);
  assert.equal(order.total, 3750);
  assert.equal(
    (await (await collections()).products.findOne({ _id: "everyday-aviator" }))
      ?.stock,
    29,
  );
});
test("failure rolls back all stock changes and does not create an order", async () => {
  await assert.rejects(
    placeOrder(
      input([
        { productId: "everyday-aviator", quantity: 1 },
        { productId: "missing-product", quantity: 1 },
      ]),
      null,
    ),
  );
  const { products, orders } = await collections();
  assert.equal(
    (await products.findOne({ _id: "everyday-aviator" }))?.stock,
    30,
  );
  assert.equal(await orders.countDocuments(), 0);
});
test("concurrent buyers cannot oversell the last unit", async () => {
  const { products, orders } = await collections();
  await products.updateOne({ _id: "everyday-aviator" }, { $set: { stock: 1 } });
  const results = await Promise.allSettled(
    Array.from({ length: 8 }, () => placeOrder(input(), null)),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await products.findOne({ _id: "everyday-aviator" }))?.stock, 0);
  assert.equal(await orders.countDocuments(), 1);
});
test("retrying a checkout returns the same order without deducting stock twice", async () => {
  const data = input();
  const first = await placeOrder(data, null);
  const second = await placeOrder(data, null);
  assert.equal(first._id, second._id);
  assert.equal(await (await collections()).orders.countDocuments(), 1);
  assert.equal(
    (await (await collections()).products.findOne({ _id: "everyday-aviator" }))
      ?.stock,
    29,
  );
});
test("cancellation restocks exactly once and cannot reopen an order", async () => {
  const order = await placeOrder(input(), null);
  await updateOrderStatus(order._id, "cancelled");
  await updateOrderStatus(order._id, "cancelled");
  assert.equal(
    (await (await collections()).products.findOne({ _id: "everyday-aviator" }))
      ?.stock,
    30,
  );
  await assert.rejects(updateOrderStatus(order._id, "confirmed"));
});
test("shipped orders cannot be cancelled, and only delivered orders complete the flow", async () => {
  const order = await placeOrder(input(), null);
  await assert.rejects(updateOrderStatus(order._id, "delivered"));
  await updateOrderStatus(order._id, "confirmed");
  await updateOrderStatus(order._id, "shipped");
  await assert.rejects(updateOrderStatus(order._id, "cancelled"));
  assert.equal(
    (await updateOrderStatus(order._id, "delivered")).status,
    "delivered",
  );
});
test("inactive products, negative quantities, and duplicate lines cannot be ordered", async () => {
  await (
    await collections()
  ).products.updateOne(
    { _id: "everyday-aviator" },
    { $set: { active: false } },
  );
  await assert.rejects(placeOrder(input(), null));
  await assert.rejects(
    placeOrder(input([{ productId: "iphone-15-pro", quantity: -1 }]), null),
  );
  await assert.rejects(
    placeOrder(
      input([
        { productId: "iphone-15-pro", quantity: 1 },
        { productId: "iphone-15-pro", quantity: 1 },
      ]),
      null,
    ),
  );
});
test("private tokens reject unequal bytes safely", () => {
  assert.equal(tokenMatches("abc", "abc"), true);
  assert.equal(tokenMatches("abc", "def"), false);
  assert.equal(tokenMatches("abc", "💚ab"), false);
});
