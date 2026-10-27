import { requireAdmin } from "@/lib/auth";
import { collections } from "@/lib/db";
import { ApiError, assertOrigin, handle, json, readJson } from "@/lib/http";
import { productSchema } from "@/lib/validation";
import { z } from "zod";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    assertOrigin(request);
    await requireAdmin();
    const input = await readJson(request);
    const data = productSchema.parse(input);
    const { expectedStock } = z
      .object({ expectedStock: z.number().int().min(0) })
      .parse(input);
    const { id } = await context.params;
    const { products } = await collections();
    const product = await products.findOneAndUpdate(
      { _id: id, stock: expectedStock },
      { $set: data },
      { returnDocument: "after" },
    );
    if (!product) {
      if (!(await products.findOne({ _id: id })))
        throw new ApiError(404, "Product not found.");
      throw new ApiError(
        409,
        "Stock changed while you were editing. Reload the product before saving.",
      );
    }
    return json({ product });
  });
}
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    assertOrigin(request);
    await requireAdmin();
    const { id } = await context.params;
    const result = await (
      await collections()
    ).products.updateOne({ _id: id }, { $set: { active: false } });
    if (!result.matchedCount) throw new ApiError(404, "Product not found.");
    return json({ ok: true });
  });
}
