"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/utils";
import { useStore } from "./store-provider";
export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const saved = wishlist.includes(product._id);
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
            unoptimized
          />
        </Link>
        {product.badge && (
          <span
            className={`product-badge ${product.badge === "New arrival" ? "badge-green" : ""}`}
          >
            {product.badge}
          </span>
        )}
        <button
          className={`favorite-button ${saved ? "is-saved" : ""}`}
          onClick={() => toggleWishlist(product._id)}
          aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`}
          aria-pressed={saved}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <Link className="quick-view" href={`/product/${product.slug}`}>
          A closer look <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="product-info">
        <span className="product-category">
          {product.brand} <span>· {product.category}</span>
        </span>
        <Link href={`/product/${product.slug}`} className="product-name">
          {product.name}
        </Link>
        <div className="product-bottom">
          <div>
            <strong>{money(product.price)}</strong>
            {product.compareAtPrice > product.price && (
              <del>{money(product.compareAtPrice)}</del>
            )}
          </div>
          <button
            disabled={!product.stock}
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to bag`}
            className="add-button"
          >
            <Plus size={18} />
          </button>
        </div>
        {!product.stock && <span className="out-of-stock">Out of stock</span>}
      </div>
    </article>
  );
}
