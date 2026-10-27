export const categories = [
  "Mobiles",
  "Watches",
  "Eyewear",
  "Accessories",
] as const;
export type Category = (typeof categories)[number];
export type Product = {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  compareAtPrice: number;
  stock: number;
  description: string;
  features: string[];
  image: string;
  featured: boolean;
  active: boolean;
  badge: string;
  createdAt: string;
};
export type User = {
  _id: string;
  name: string;
  email: string;
  username?: string;
  role: "admin" | "customer";
  createdAt: string;
};
export type UserDocument = User & { passwordHash: string };
export const orderStatuses = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export type Address = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
};
export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};
export type Order = {
  _id: string;
  number: string;
  userId: string | null;
  customer: Address;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: "cod";
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  idempotencyKey: string;
  trackingToken: string;
};
export type CartItem = { product: Product; quantity: number };
export type StoreSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  openingHours: string;
  returnPolicy: string;
};
