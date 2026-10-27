"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { categories, type Product } from "@/lib/types";
import { ProductCard } from "./product-card";
export function FeaturedProducts({ products }: { products: Product[] }) {
  const [tab, setTab] = useState("All picks");
  const picks =
    tab === "All picks"
      ? products.filter((p) => p.featured).slice(0, 4)
      : products.filter((p) => p.category === tab).slice(0, 4);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE GOOD STUFF, HANDPICKED</span>
          <h2>Meet your next favorites.</h2>
        </div>
        <Link href="/shop" className="text-link">
          Shop the full collection <ArrowUpRight size={17} />
        </Link>
      </div>
      <div
        className="collection-tabs"
        role="group"
        aria-label="Featured categories"
      >
        {["All picks", ...categories].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={tab === item ? "selected" : ""}
            aria-pressed={tab === item}
          >
            {item}
          </button>
        ))}
        <span>A few things we think you’ll love.</span>
      </div>
      <div className="product-grid">
        {picks.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      {!picks.length && (
        <p className="muted">
          New favorites are on their way. Browse the full collection in the
          meantime.
        </p>
      )}
    </>
  );
}
