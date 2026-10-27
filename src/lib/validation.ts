import { z } from "zod";
import { categories, orderStatuses } from "./types";
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(72, "Use at most 72 characters")
  .refine(
    (v) => new TextEncoder().encode(v).length <= 72,
    "Password must be at most 72 bytes",
  );
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(40)
  .regex(
    /^[a-z0-9][a-z0-9_-]*$/,
    "Use letters, numbers, underscores, or hyphens for the username",
  );
export const loginSchema = z
  .object({
    identifier: z.union([emailSchema, usernameSchema]).optional(),
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: z.string().min(1).max(72),
  })
  .refine(
    (v) => Boolean(v.identifier || v.username || v.email),
    "Enter your email or username",
  )
  .transform((v) => ({
    identifier: (v.identifier || v.username || v.email)!,
    password: v.password,
  }));
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
});
export const productSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(180),
    brand: z.string().trim().min(1).max(100),
    category: z.enum(categories),
    price: z.number().int().min(1).max(10000000),
    compareAtPrice: z.number().int().min(0).max(10000000),
    stock: z.number().int().min(0).max(100000),
    description: z.string().trim().min(20).max(5000),
    features: z.array(z.string().trim().min(1).max(200)).max(12),
    image: z
      .string()
      .max(2000)
      .refine(
        (v) =>
          /^\/api\/media\/[a-f0-9-]{36}$/.test(v) ||
          (URL.canParse(v) && new URL(v).protocol === "https:"),
        "Upload a photo or use an HTTPS image URL",
      ),
    featured: z.boolean(),
    active: z.boolean(),
    badge: z.string().trim().max(30),
  })
  .refine((v) => v.compareAtPrice === 0 || v.compareAtPrice >= v.price, {
    message: "Original price must be at least the selling price",
    path: ["compareAtPrice"],
  });
export const addressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+92|0092|0)3\d{9}$/,
      "Enter a Pakistani mobile number, e.g. 03001234567",
    ),
  address: z.string().trim().min(10).max(300),
  city: z.string().trim().min(2).max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Enter a 5-digit postal code"),
  notes: z.string().trim().max(500).default(""),
});
export const checkoutSchema = z
  .object({
    customer: addressSchema,
    items: z
      .array(
        z.object({
          productId: z.string().min(1).max(100),
          quantity: z.number().int().min(1).max(10),
        }),
      )
      .min(1)
      .max(30),
    idempotencyKey: z.string().uuid(),
    paymentMethod: z.literal("cod"),
  })
  .refine(
    (v) => new Set(v.items.map((i) => i.productId)).size === v.items.length,
    "Cart contains duplicate products",
  );
export const statusSchema = z.object({ status: z.enum(orderStatuses) });
export const settingsSchema = z.object({
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (v) => !v || /^\+?[\d ()-]{7,30}$/.test(v),
      "Enter a valid shop phone number",
    ),
  whatsapp: z
    .string()
    .trim()
    .max(15)
    .refine(
      (v) => !v || /^92\d{10}$/.test(v),
      "Use WhatsApp format 923001234567",
    ),
  email: z.union([emailSchema, z.literal("")]),
  address: z.string().trim().max(500),
  openingHours: z.string().trim().max(200),
  returnPolicy: z.string().trim().max(5000),
});
