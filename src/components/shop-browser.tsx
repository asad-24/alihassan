"use client";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { categories, type Product } from "@/lib/types";
import { useStore } from "./store-provider";
import { ProductCard } from "./product-card";
import { money } from "@/lib/utils";
export function ShopBrowser({
  products,
  initialCategory,
  initialQuery,
  initialSort,
  favorites,
}: {
  products: Product[];
  initialCategory: string;
  initialQuery: string;
  initialSort: string;
  favorites: boolean;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort || "featured");
  const [maxPrice, setMaxPrice] = useState(500000);
  const [inStock, setInStock] = useState(false);
  const [filters, setFilters] = useState(false);
  const { wishlist } = useStore();
  const filtered = useMemo(() => {
    const items = products.filter(
      (p) =>
        (!category || p.category === category) &&
        (!favorites || wishlist.includes(p._id)) &&
        `${p.name} ${p.brand} ${p.category}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        p.price <= maxPrice &&
        (!inStock || p.stock > 0),
    );
    return items.sort((a, b) =>
      sort === "price-low"
        ? a.price - b.price
        : sort === "price-high"
          ? b.price - a.price
          : sort === "newest"
            ? b.createdAt.localeCompare(a.createdAt)
            : sort === "sale"
              ? (b.compareAtPrice - b.price) / b.price -
                (a.compareAtPrice - a.price) / a.price
              : Number(b.featured) - Number(a.featured),
    );
  }, [products, category, favorites, wishlist, query, maxPrice, inStock, sort]);
  function reset() {
    setCategory("");
    setQuery("");
    setMaxPrice(500000);
    setInStock(false);
  }
  return (
    <div className="shop-layout">
      <aside className={`shop-filters ${filters ? "filters-open" : ""}`}>
        <div className="filter-title">
          <h3>Make it yours</h3>
          <button
            className="mobile-menu icon-button"
            onClick={() => setFilters(false)}
            aria-label="Close filters"
          >
            <X size={17} />
          </button>
        </div>
        <h4>Categories</h4>
        <div className="filter-categories">
          {["", ...categories].map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              <span>{c || "All products"}</span>
              <small>
                {products.filter((p) => !c || p.category === c).length}
              </small>
            </button>
          ))}
        </div>
        <h4>Your budget</h4>
        <input
          aria-label="Maximum price"
          type="range"
          min="1000"
          max="500000"
          step="500"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
        <div className="price-range">
          <span>Rs. 0</span>
          <span>{money(maxPrice)}</span>
        </div>
        <h4>Availability</h4>
        <label className="check-label">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />{" "}
          In stock only
        </label>
        <button className="reset-filters" onClick={reset}>
          Reset filters <X size={13} />
        </button>
        <div className="filter-note">
          <span>
            GOOD FINDS.
            <br />
            FAIR PRICES.
          </span>
          <p>Your next favorite is closer than you think.</p>
        </div>
      </aside>
      <div className="shop-results">
        <div className="shop-toolbar">
          <form className="shop-search" onSubmit={(e) => e.preventDefault()}>
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection"
              aria-label="Search the collection"
            />
          </form>
          <button
            className="filter-toggle"
            onClick={() => setFilters(!filters)}
          >
            <SlidersHorizontal size={17} /> Filters
          </button>
          <label className="sort-label">
            Sort by{" "}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">Our favorites</option>
              <option value="newest">Newest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="sale">Best savings</option>
            </select>
          </label>
        </div>
        <div className="results-caption">
          <span>
            {filtered.length}{" "}
            {filtered.length === 1 ? "good find" : "good finds"}
            {category && ` in ${category}`}
          </span>
          {(category || query || maxPrice < 500000 || inStock) && (
            <button onClick={reset}>
              Clear filters <X size={12} />
            </button>
          )}
        </div>
        <div className="product-grid shop-product-grid">
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
        {!filtered.length && (
          <div className="empty-state">
            <Search size={36} strokeWidth={1} />
            <h3>
              {favorites
                ? "Save a little inspiration."
                : "Nothing here just yet."}
            </h3>
            <p>
              {favorites
                ? "Tap the heart on any product to keep it here."
                : "Try a different search or give your filters a little room."}
            </p>
            <button className="btn btn-dark" onClick={reset}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
