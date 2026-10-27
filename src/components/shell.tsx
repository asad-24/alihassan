"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  X,
  ArrowUpRight,
  Sparkles,
  Package,
} from "lucide-react";
import { Brand } from "./brand";
import { useStore } from "./store-provider";
import { money, shippingFor } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const { cart, setCartOpen, wishlist, user } = useStore();
  if (pathname.startsWith("/admin")) return null;
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <>
      <div className="announcement">
        <span>Good things. Great prices. Every day.</span>
        <span className="announcement-delivery">
          <Truck size={14} /> Free delivery on orders over Rs. 10,000{" "}
          <ArrowRight size={13} />
        </span>
        <span>Made for your everyday.</span>
      </div>
      <header className="site-header">
        <div className="container header-main">
          <Brand />
          <form action="/shop" className="header-search">
            <Search size={19} />
            <input
              type="search"
              name="q"
              placeholder="Find your next favorite…"
              aria-label="Search products"
            />
            <kbd>Search</kbd>
          </form>
          <div className="header-actions">
            <Link
              href="/shop?wishlist=1"
              aria-label={`Wishlist, ${wishlist.length} items`}
              className="icon-button"
            >
              <Heart size={21} />
              {wishlist.length > 0 && (
                <span className="count">{wishlist.length}</span>
              )}
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              aria-label="My account"
              className="icon-button"
            >
              <UserRound size={21} />
            </Link>
            <span className="action-divider" />
            <button
              onClick={() => setCartOpen(true)}
              className="bag-button"
              aria-label={`Open shopping bag, ${count} items`}
            >
              <ShoppingBag size={21} />
              <span>My bag</span>
              <b>{count}</b>
            </button>
            <button
              className="mobile-menu icon-button"
              aria-label="Toggle navigation"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <div className={`nav-wrap ${menu ? "nav-open" : ""}`}>
          <nav className="container nav-inner" aria-label="Main navigation">
            <div className="nav-links">
              {[
                ["Home", "/"],
                ["Shop all", "/shop"],
                ["Mobiles", "/shop?category=Mobiles"],
                ["Watches", "/shop?category=Watches"],
                ["Eyewear", "/shop?category=Eyewear"],
                ["Accessories", "/shop?category=Accessories"],
              ].map(([label, href]) => (
                <Link
                  onClick={() => setMenu(false)}
                  key={label}
                  href={href}
                  className={pathname === href ? "active" : ""}
                >
                  {label}
                </Link>
              ))}
            </div>
            <Link href="/shop?sort=sale" className="nav-offer">
              A little upgrade, a better price <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQuantity } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const subtotal = cart.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
      if (event.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], input",
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [cartOpen, setCartOpen]);
  if (!cartOpen) return null;
  return (
    <div className="drawer-overlay" onClick={() => setCartOpen(false)}>
      <aside
        ref={dialogRef}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-title">
          <h2>
            Your bag <span>({cart.length})</span>
          </h2>
          <button
            ref={closeRef}
            onClick={() => setCartOpen(false)}
            className="icon-button"
            aria-label="Close bag"
          >
            <X />
          </button>
        </div>
        {cart.length ? (
          <>
            <div className="drawer-items">
              {cart.map(({ product, quantity }) => (
                <div className="cart-item" key={product._id}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={90}
                    height={110}
                    unoptimized
                  />
                  <div>
                    <small>{product.brand}</small>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={() => setCartOpen(false)}
                    >
                      {product.name}
                    </Link>
                    <strong>{money(product.price)}</strong>
                    <div className="quantity">
                      <button
                        onClick={() =>
                          updateQuantity(product._id, quantity - 1)
                        }
                        aria-label={`Decrease ${product.name} quantity`}
                      >
                        <Minus size={13} />
                      </button>
                      <span>{quantity}</span>
                      <button
                        disabled={quantity >= Math.min(product.stock, 10)}
                        onClick={() =>
                          updateQuantity(product._id, quantity + 1)
                        }
                        aria-label={`Increase ${product.name} quantity`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-item"
                    onClick={() => updateQuantity(product._id, 0)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="drawer-bottom">
              <p>
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </p>
              <p>
                <span>Delivery</span>
                <span>
                  {shippingFor(subtotal)
                    ? money(shippingFor(subtotal))
                    : "On us"}
                </span>
              </p>
              <Link
                href="/checkout"
                className="btn btn-dark"
                onClick={() => setCartOpen(false)}
              >
                Continue to checkout <ArrowRight size={17} />
              </Link>
              <small>Cash on delivery · Pay when it arrives</small>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <ShoppingBag size={45} strokeWidth={1} />
            <h3>A little empty, for now.</h3>
            <p>Your next favorite is waiting.</p>
            <Link
              href="/shop"
              className="btn btn-dark"
              onClick={() => setCartOpen(false)}
            >
              Explore the collection <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <section className="service-strip">
        <div className="container service-grid">
          <div>
            <Truck />
            <span>
              <strong>Delivered to your door</strong>
              <small>Free shipping over Rs. 10,000</small>
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              <strong>Shop with confidence</strong>
              <small>Clear prices. Thoughtful service.</small>
            </span>
          </div>
          <div>
            <Package />
            <span>
              <strong>Pay on arrival</strong>
              <small>Cash on delivery across Pakistan</small>
            </span>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-about">
            <Brand light />
            <p>
              Your everyday essentials, thoughtfully picked.
              <br />A little tech. A little style. All Al Makkah.
            </p>
            <span className="footer-location">
              Serving customers across Pakistan.
            </span>
          </div>
          <div>
            <h3>Discover</h3>
            <Link href="/shop?category=Mobiles">Mobile phones</Link>
            <Link href="/shop?category=Watches">Watches</Link>
            <Link href="/shop?category=Eyewear">Eyewear</Link>
            <Link href="/shop?category=Accessories">Accessories</Link>
          </div>
          <div>
            <h3>Here to help</h3>
            <Link href="/account">My account & orders</Link>
            <Link href="/information#delivery">Delivery information</Link>
            <Link href="/information#returns">Returns & exchanges</Link>
            <Link href="/information#contact">Contact the shop</Link>
          </div>
          <div className="footer-note">
            <span className="eyebrow">A BETTER EVERYDAY</span>
            <h3>
              Small upgrades.
              <br />
              Big difference.
            </h3>
            <Link href="/shop">
              Find something you love <ArrowUpRight size={16} />
            </Link>
            <span className="footer-social">
              <Sparkles size={16} /> Style meets your everyday
            </span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Al Makkah Mobile & Lifestyle.
          </span>
          <div>
            <Link href="/information#privacy">Privacy</Link>
            <Link href="/information#terms">Terms</Link>
            <Link href="/admin">Shop administration</Link>
          </div>
          <span>PKR · Pakistan</span>
        </div>
      </footer>
    </>
  );
}
