import Link from "next/link";
import { getProducts } from "@/lib/shop";
import { ShopBrowser } from "@/components/shop-browser";
export const dynamic = "force-dynamic";
export const metadata = { title: "Shop the collection" };
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const products = await getProducts();
  const value = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const favorites = value("wishlist") === "1";
  return (
    <main>
      <div className="page-intro">
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>{favorites ? "Your wishlist" : "The collection"}</span>
          </div>
          <span className="eyebrow">
            {favorites ? "A FEW THINGS YOU LOVE" : "SOMETHING GOOD IS WAITING"}
          </span>
          <h1>
            {favorites
              ? "Your favorites, all together."
              : "The everyday collection."}
          </h1>
          <p>
            {favorites
              ? "Keep a little inspiration for your next visit."
              : "Mobiles, watches, eyewear, and all the little things that make a difference."}
          </p>
        </div>
      </div>
      <div className="container shop-container">
        <ShopBrowser
          key={JSON.stringify(params)}
          products={products}
          initialCategory={value("category")}
          initialQuery={value("q")}
          initialSort={value("sort")}
          favorites={favorites}
        />
      </div>
    </main>
  );
}
