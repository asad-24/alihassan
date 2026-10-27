"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/utils";
import { useStore } from "./store-provider";
export function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, wishlist, toggleWishlist, setCartOpen } = useStore();
  const saved = wishlist.includes(product._id);
  return (
    <div className="product-detail">
      <div className="detail-image">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority
          unoptimized
          sizes="(max-width: 800px) 100vw, 50vw"
        />
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
      </div>
      <div className="detail-copy">
        <span className="eyebrow">
          {product.brand} / {product.category}
        </span>
        <h1>{product.name}</h1>
        <div className="detail-price">
          <strong>{money(product.price)}</strong>
          {product.compareAtPrice > product.price && (
            <>
              <del>{money(product.compareAtPrice)}</del>
              <span>
                Save{" "}
                {Math.round((1 - product.price / product.compareAtPrice) * 100)}
                %
              </span>
            </>
          )}
        </div>
        <p className="detail-description">{product.description}</p>
        <ul className="feature-list">
          {product.features.map((f) => (
            <li key={f}>
              <Check size={15} />
              {f}
            </li>
          ))}
        </ul>
        <p className={`stock-line ${!product.stock ? "stock-empty" : ""}`}>
          <span />
          {product.stock
            ? `${product.stock} available · Ready for your everyday`
            : "Currently out of stock"}
        </p>
        <div className="detail-actions">
          <div className="quantity quantity-large">
            <button
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity(quantity - 1)}
            >
              <Minus size={16} />
            </button>
            <span>{quantity}</span>
            <button
              aria-label="Increase quantity"
              disabled={quantity >= Math.min(product.stock, 10)}
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            className="btn btn-dark"
            disabled={!product.stock}
            onClick={() => {
              addToCart(product, quantity);
              setCartOpen(true);
            }}
          >
            <ShoppingBag size={18} /> Add to bag
          </button>
          <button
            className={`detail-favorite icon-button ${saved ? "is-saved" : ""}`}
            onClick={() => toggleWishlist(product._id)}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={saved}
          >
            <Heart size={21} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="detail-delivery">
          <p>
            <Truck size={19} />
            <span>
              <strong>Delivered across Pakistan</strong>
              <small>
                Rs. 250 delivery. Free on orders of Rs. 10,000 or more.
              </small>
            </span>
          </p>
          <p>
            <ShieldCheck size={19} />
            <span>
              <strong>Pay when it arrives</strong>
              <small>Cash on delivery. No advance payment needed.</small>
            </span>
          </p>
        </div>
        <small className="detail-note">
          Product photographs are illustrative. Please confirm color,
          specifications, and availability with the shop.
        </small>
      </div>
    </div>
  );
}
