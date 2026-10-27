"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Upload } from "lucide-react";
import { categories, type Product } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { api, useStore } from "../store-provider";
export function ProductForm({ product }: { product?: Product }) {
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [image, setImage] = useState(product?.image || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { notify } = useStore();
  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setImage(data.url);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const values = {
      ...(product ? { expectedStock: product.stock } : {}),
      name,
      slug,
      image,
      brand: form.get("brand"),
      category: form.get("category"),
      price: Number(form.get("price")),
      compareAtPrice: Number(form.get("compareAtPrice")),
      stock: Number(form.get("stock")),
      badge: form.get("badge"),
      description: form.get("description"),
      features: String(form.get("features"))
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      featured: form.get("featured") === "on",
      active: form.get("active") === "on",
    };
    try {
      await api(
        product ? `/api/admin/products/${product._id}` : "/api/admin/products",
        { method: product ? "PATCH" : "POST", body: JSON.stringify(values) },
      );
      notify(
        product ? "Product updated" : "A new good find, added to your shop",
      );
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">
            YOUR COLLECTION / {product ? "EDIT PRODUCT" : "SOMETHING NEW"}
          </span>
          <h1>{product ? "Refine the details." : "Add a good find."}</h1>
          <p>Make it easy for customers to find their next favorite.</p>
        </div>
      </div>
      <form className="admin-form" onSubmit={submit}>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="admin-panel">
          <h2>The essentials</h2>
          <div className="form-grid">
            <label className="form-field full-width">
              <span>Product name</span>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!product) setSlug(slugify(e.target.value));
                }}
                required
                minLength={2}
                maxLength={150}
                placeholder="e.g. Classic Chronograph"
              />
            </label>
            <label className="form-field full-width">
              <span>URL slug</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={180}
              />
            </label>
            <label className="form-field">
              <span>Brand</span>
              <input
                name="brand"
                defaultValue={product?.brand}
                required
                maxLength={100}
                placeholder="Brand or collection"
              />
            </label>
            <label className="form-field">
              <span>Category</span>
              <select
                name="category"
                defaultValue={product?.category || "Mobiles"}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="form-field full-width">
              <span>Description</span>
              <textarea
                name="description"
                defaultValue={product?.description}
                required
                minLength={20}
                maxLength={5000}
                placeholder="Tell customers what makes this a good find."
              />
            </label>
            <label className="form-field full-width">
              <span>Key features (one per line, up to 12)</span>
              <textarea
                name="features"
                defaultValue={product?.features.join("\n")}
                placeholder={"Stainless-steel case\nQuartz movement"}
              />
            </label>
          </div>
        </div>
        <div className="admin-panel">
          <h2>Price & inventory</h2>
          <div className="form-grid">
            <label className="form-field">
              <span>Selling price (PKR)</span>
              <input
                name="price"
                type="number"
                min={1}
                max={10000000}
                step={1}
                defaultValue={product?.price}
                required
              />
            </label>
            <label className="form-field">
              <span>Original price (PKR, 0 to hide)</span>
              <input
                name="compareAtPrice"
                type="number"
                min={0}
                max={10000000}
                step={1}
                defaultValue={product?.compareAtPrice || 0}
                required
              />
            </label>
            <label className="form-field">
              <span>Units in stock</span>
              <input
                name="stock"
                type="number"
                min={0}
                max={100000}
                step={1}
                defaultValue={product?.stock || 0}
                required
              />
            </label>
            <label className="form-field">
              <span>Badge (optional)</span>
              <input
                name="badge"
                maxLength={30}
                defaultValue={product?.badge}
                placeholder="e.g. New arrival"
              />
            </label>
          </div>
          <div className="admin-checkboxes">
            <label className="check-label">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product?.active ?? true}
              />
              Visible in storefront
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured}
              />
              Featured on homepage
            </label>
          </div>
        </div>
        <div className="admin-panel">
          <h2>A picture makes a difference</h2>
          {image && (
            <div className="product-image-preview">
              <Image
                src={image}
                alt="Product preview"
                fill
                unoptimized
                sizes="160px"
              />
            </div>
          )}
          <label className="form-field">
            <span>Image URL</span>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
              placeholder="https://… or upload an image below"
              maxLength={2000}
            />
          </label>
          <label
            className="btn btn-outline"
            style={{ cursor: uploading ? "wait" : "pointer" }}
          >
            <Upload size={15} />
            {uploading ? "Uploading…" : "Upload product photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              disabled={uploading}
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <p className="form-hint">
            JPEG, PNG, or WebP, up to 3 MB. Uploaded photos are stored in
            MongoDB.
          </p>
        </div>
        <div className="admin-form-actions">
          <Link href="/admin/products" className="btn btn-outline">
            Cancel
          </Link>
          <button className="btn btn-dark" disabled={busy || uploading}>
            <Save size={16} />
            {busy ? "Saving…" : "Save product"}
          </button>
        </div>
      </form>
    </>
  );
}
