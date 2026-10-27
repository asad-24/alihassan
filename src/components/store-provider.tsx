"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CartItem, Product, User } from "@/lib/types";
import { z } from "zod";
import { productSchema } from "@/lib/validation";
import { Check, X } from "lucide-react";

type Store = {
  cart: CartItem[];
  ready: boolean;
  user: User | null;
  cartOpen: boolean;
  wishlist: string[];
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  refreshUser: () => Promise<void>;
  notify: (message: string) => void;
};
const Context = createContext<Store | null>(null);
const storedCart = z
  .array(
    z.object({
      product: productSchema.and(
        z.object({ _id: z.string(), createdAt: z.string() }),
      ),
      quantity: z.number().int().min(1).max(10),
    }),
  )
  .max(30);
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const refreshUser = useCallback(async () => {
    try {
      const data = await api<{ user: User | null }>("/api/auth/session");
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);
  useEffect(() => {
    try {
      const parsed = storedCart.safeParse(
        JSON.parse(localStorage.getItem("almakkah-cart") || "[]"),
      );
      // Hydrate browser persistence after the server-rendered shell mounts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (parsed.success) setCart(parsed.data);
      const favorites = z
        .array(z.string())
        .max(500)
        .safeParse(
          JSON.parse(localStorage.getItem("almakkah-wishlist") || "[]"),
        );
      if (favorites.success) setWishlist(favorites.data);
    } catch {
      /* Ignore invalid or unavailable local storage. */
    }
    setReady(true);
    void refreshUser();
  }, [refreshUser]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("almakkah-cart", JSON.stringify(cart));
        localStorage.setItem("almakkah-wishlist", JSON.stringify(wishlist));
      } catch {
        /* Cart still works without persistence. */
      }
  }, [cart, wishlist, ready]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);
  function addToCart(product: Product, quantity = 1) {
    if (product.stock < 1) {
      setToast("This item is currently out of stock.");
      return;
    }
    setCart((current) => {
      const existing = current.find((i) => i.product._id === product._id);
      if (existing)
        return current.map((i) =>
          i.product._id === product._id
            ? {
                product,
                quantity: Math.min(i.quantity + quantity, product.stock, 10),
              }
            : i,
        );
      return [
        ...current,
        { product, quantity: Math.min(quantity, product.stock, 10) },
      ];
    });
    setToast(`${product.name} added to your bag`);
  }
  const value: Store = {
    cart,
    ready,
    user,
    cartOpen,
    wishlist,
    setCartOpen,
    addToCart,
    refreshUser,
    updateQuantity: (id, quantity) =>
      setCart((current) =>
        current
          .map((i) =>
            i.product._id === id
              ? { ...i, quantity: Math.min(quantity, i.product.stock, 10) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      ),
    clearCart: () => setCart([]),
    toggleWishlist: (id) =>
      setWishlist((current) =>
        current.includes(id)
          ? current.filter((v) => v !== id)
          : [...current, id],
      ),
    notify: setToast,
  };
  return (
    <Context.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error("Missing StoreProvider");
  return context;
}
