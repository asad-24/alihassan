import { Binary } from "mongodb";
import { getDb } from "@/lib/db";
import { ApiError, handle } from "@/lib/http";
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { id } = await context.params;
    if (!/^[a-f0-9-]{36}$/.test(id))
      throw new ApiError(404, "Image not found.");
    const media = await (
      await getDb()
    )
      .collection<{ _id: string; data: Binary; mime: string }>("media")
      .findOne({ _id: id });
    if (!media) throw new ApiError(404, "Image not found.");
    return new Response(new Uint8Array(media.data.buffer), {
      headers: {
        "Content-Type": media.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  });
}
