"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Archive, Pencil, Plus, RotateCcw, Search } from "lucide-react";
import { ResourceState, useResource } from "@/components/admin/use-resource";
import { api, useStore } from "@/components/store-provider";
import { categories, type Product } from "@/lib/types";
import { money } from "@/lib/utils";
export default function AdminProducts() {
  const { data, error, reload } = useResource<{ products: Product[] }>(
    "/api/admin/products",
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState("");
  const { notify } = useStore();
  async function archive(product: Product) {
    setBusy(product._id);
    try {
      await api(`/api/admin/products/${product._id}`, {
        method: product.active ? "DELETE" : "PATCH",
        ...(product.active
          ? {}
          : {
              body: JSON.stringify({
                ...product,
                expectedStock: product.stock,
                active: true,
              }),
            }),
      });
      notify(
        product.active
          ? "Product hidden from the storefront"
          : "Product restored to the storefront",
      );
      reload();
    } catch (error) {
      notify((error as Error).message);
    } finally {
      setBusy("");
    }
  }
  const products = data?.products.filter(
    (p) =>
      `${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase()) &&
      (!category || p.category === category),
  );
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Your collection.</h1>
          <p>Good products, clear details, and stock that stays in sync.</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-dark">
          <Plus size={16} /> Add product
        </Link>
      </div>
      <div className="admin-search-bar">
        <Search size={17} />
        <input
          placeholder="Find a product…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <select
          aria-label="Filter category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {!data ? (
        <ResourceState error={error} retry={reload} />
      ) : (
        <div className="admin-panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="table-product">
                        <Image
                          src={p.image}
                          alt={p.name}
                          width={41}
                          height={49}
                          unoptimized
                        />
                        <div>
                          <strong>{p.name}</strong>
                          <small>{p.brand}</small>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{money(p.price)}</td>
                    <td>
                      <span className={p.stock <= 5 ? "status" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status ${p.active ? "status-delivered" : "status-cancelled"}`}
                      >
                        {p.active ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          href={`/admin/products/${p._id}`}
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          disabled={busy === p._id}
                          onClick={() => archive(p)}
                          aria-label={`${p.active ? "Archive" : "Restore"} ${p.name}`}
                          className={p.active ? "danger" : ""}
                        >
                          {p.active ? (
                            <Archive size={15} />
                          ) : (
                            <RotateCcw size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!products?.length && (
            <div className="admin-empty">No products match your search.</div>
          )}
        </div>
      )}
    </>
  );
}
