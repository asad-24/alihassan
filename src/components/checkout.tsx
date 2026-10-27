"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight, Banknote, LockKeyhole, ShoppingBag } from "lucide-react";
import { api, useStore } from "./store-provider";
import { money, shippingFor } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { orderWhatsAppUrl } from "@/lib/whatsapp";
export function Checkout({ whatsapp }: { whatsapp: string }) {
  const { cart, ready, user, clearCart } = useStore();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const key = useRef("");
  const previousSignature = useRef("");
  const router = useRouter();
  const subtotal = cart.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  const shipping = shippingFor(subtotal);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const whatsappWindow = whatsapp
      ? window.open("about:blank", "_blank")
      : null;
    if (whatsappWindow) whatsappWindow.opener = null;
    const customer = Object.fromEntries(new FormData(event.currentTarget));
    const items = cart.map((i) => ({
      productId: i.product._id,
      quantity: i.quantity,
    }));
    const signature = JSON.stringify({ customer, items });
    if (!key.current || previousSignature.current !== signature)
      key.current = crypto.randomUUID();
    previousSignature.current = signature;
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("almakkah-checkout") || "null",
      );
      if (saved?.signature === signature && typeof saved.key === "string")
        key.current = saved.key;
      sessionStorage.setItem(
        "almakkah-checkout",
        JSON.stringify({ signature, key: key.current }),
      );
    } catch {
      /* Use the in-memory key if storage is unavailable. */
    }
    try {
      const { order } = await api<{ order: Order }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customer,
          items,
          idempotencyKey: key.current,
          paymentMethod: "cod",
        }),
      });
      clearCart();
      if (whatsappWindow && !whatsappWindow.closed) {
        try {
          whatsappWindow.location.href = orderWhatsAppUrl(order, whatsapp);
        } catch {
          /* The saved order page provides a WhatsApp fallback link. */
        }
      }
      try {
        sessionStorage.removeItem("almakkah-checkout");
      } catch {
        /* Optional persistence. */
      }
      router.push(`/order/${order._id}?token=${order.trackingToken}`);
    } catch (error) {
      whatsappWindow?.close();
      setError((error as Error).message);
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <div className="loading-page">
        <span className="spinner" />
      </div>
    );
  if (!cart.length && !busy)
    return (
      <div className="empty-state">
        <ShoppingBag size={42} strokeWidth={1} />
        <h3>Your bag is waiting for a good find.</h3>
        <p>Explore the collection, then meet us back here.</p>
        <Link href="/shop" className="btn btn-dark">
          Start exploring <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <div className="checkout-layout">
      <div className="checkout-form">
        {!user && (
          <div className="checkout-login">
            Already have an account?{" "}
            <Link href="/login?next=/checkout">Sign in</Link> to keep track of
            your order. Guest checkout is welcome too.
          </div>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <form id="checkout-form" onSubmit={submit}>
          <section className="checkout-section">
            <h2>
              <span className="step-number">1</span> A little about you
            </h2>
            <div className="form-grid">
              <label className="form-field">
                <span>Full name</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  defaultValue={user?.name}
                  placeholder="Your full name"
                />
              </label>
              <label className="form-field">
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  defaultValue={user?.email}
                  placeholder="you@example.com"
                />
              </label>
              <label className="form-field full-width">
                <span>Mobile number</span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  pattern="(\+92|0092|0)3[0-9]{9}"
                  title="Pakistani mobile number, e.g. 03001234567"
                  required
                  placeholder="03001234567"
                />
              </label>
            </div>
          </section>
          <section className="checkout-section">
            <h2>
              <span className="step-number">2</span> Where should it go?
            </h2>
            <div className="form-grid">
              <label className="form-field full-width">
                <span>Street address</span>
                <input
                  name="address"
                  autoComplete="street-address"
                  required
                  minLength={10}
                  maxLength={300}
                  placeholder="House, street, and area"
                />
              </label>
              <label className="form-field">
                <span>City</span>
                <input
                  name="city"
                  autoComplete="address-level2"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Your city"
                />
              </label>
              <label className="form-field">
                <span>Postal code</span>
                <input
                  name="postalCode"
                  autoComplete="postal-code"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  title="Five-digit postal code"
                  placeholder="54000"
                />
              </label>
              <label className="form-field full-width">
                <span>Delivery notes (optional)</span>
                <textarea
                  name="notes"
                  maxLength={500}
                  placeholder="Anything that helps us find you?"
                />
              </label>
            </div>
            <p className="form-hint">
              Delivery is available within Pakistan. The shop will confirm
              dispatch details with you.
            </p>
          </section>
          <section className="checkout-section">
            <h2>
              <span className="step-number">3</span> Keep payment simple
            </h2>
            <div className="payment-option">
              <Banknote size={25} />
              <div>
                <strong>Cash on delivery</strong>
                <small>Pay the courier when your order arrives.</small>
              </div>
            </div>
          </section>
        </form>
      </div>
      <aside className="order-summary">
        <span className="eyebrow">A FEW GOOD CHOICES</span>
        <h2>Your order.</h2>
        {cart.map(({ product, quantity }) => (
          <div className="summary-item" key={product._id}>
            <Image
              src={product.image}
              alt={product.name}
              width={53}
              height={65}
              unoptimized
            />
            <div>
              <strong>{product.name}</strong>
              <small>Quantity: {quantity}</small>
            </div>
            <span>{money(product.price * quantity)}</span>
          </div>
        ))}
        <div className="summary-lines">
          <p>
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </p>
          <p>
            <span>Delivery</span>
            <span>{shipping ? money(shipping) : "On us"}</span>
          </p>
          <p className="summary-total">
            <span>Total</span>
            <span>{money(subtotal + shipping)}</span>
          </p>
        </div>
        <button
          type="submit"
          form="checkout-form"
          className="btn btn-dark"
          disabled={busy || !cart.length}
        >
          {busy
            ? "Saving your order…"
            : whatsapp
              ? "Save order & open WhatsApp"
              : "Place order"}
          <ArrowRight size={17} />
        </button>
        <p className="summary-note">
          <LockKeyhole
            size={11}
            style={{ display: "inline", marginRight: 4 }}
          />{" "}
          {whatsapp
            ? "Your order is saved, then a message opens in WhatsApp. Tap Send to share the details with our shop."
            : "Your information stays private."}
          <br />
          By ordering, you agree to our{" "}
          <Link href="/information#terms">terms</Link>.
        </p>
      </aside>
    </div>
  );
}
