import { randomUUID } from "node:crypto";
import { Binary } from "mongodb";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ApiError, assertOrigin, handle, json } from "@/lib/http";
export async function POST(request: Request) {
  return handle(async () => {
    assertOrigin(request);
    await requireAdmin();
    if (Number(request.headers.get("content-length")) > 3.1 * 1024 * 1024)
      throw new ApiError(413, "Images must be smaller than 3 MB.");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > 3 * 1024 * 1024)
      throw new ApiError(
        400,
        "Choose a JPEG, PNG, or WebP image smaller than 3 MB.",
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime =
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
        ? "image/jpeg"
        : bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          ? "image/png"
          : bytes.toString("ascii", 0, 4) === "RIFF" &&
              bytes.toString("ascii", 8, 12) === "WEBP"
            ? "image/webp"
            : null;
    if (!mime || mime !== file.type)
      throw new ApiError(
        400,
        "Only valid JPEG, PNG, and WebP images are supported.",
      );
    const id = randomUUID();
    await (
      await getDb()
    )
      .collection<{ _id: string; data: Binary; mime: string; createdAt: Date }>(
        "media",
      )
      .insertOne({
        _id: id,
        data: new Binary(bytes),
        mime,
        createdAt: new Date(),
      });
    return json({ url: `/api/media/${id}` }, 201);
  });
}
