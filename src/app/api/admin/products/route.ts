import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { collections } from "@/lib/db";
import { assertOrigin, handle, json, readJson } from "@/lib/http";
import { getProducts } from "@/lib/shop";
import { productSchema } from "@/lib/validation";
export async function GET() {
  return handle(async () => {
    await requireAdmin();
    return json({ products: await getProducts(true) });
  });
}
export async function POST(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    await requireAdmin();
    const data = productSchema.parse(await readJson(request));
    const product = {
      ...data,
      _id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await (await collections()).products.insertOne(product);
    return json({ product }, 201);
  });
}
