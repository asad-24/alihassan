import { getProducts } from "@/lib/shop";
import { handle, json } from "@/lib/http";
export async function GET(request: Request) {
  return handle(async () => {
    const params = new URL(request.url).searchParams;
    let products = await getProducts();
    const category = params.get("category");
    const search = params.get("q")?.toLowerCase();
    if (category)
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    if (search)
      products = products.filter((p) =>
        `${p.name} ${p.brand}`.toLowerCase().includes(search),
      );
    return json({ products });
  });
}
