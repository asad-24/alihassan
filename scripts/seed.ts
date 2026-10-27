import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { collections, ensureIndexes, getClient, getDb } from "../src/lib/db";
import { sampleProducts } from "../src/lib/catalog";
import {
  emailSchema,
  passwordSchema,
  productSchema,
  usernameSchema,
} from "../src/lib/validation";
import { loadEnvConfig } from "@next/env";
import { defaultSettings } from "../src/lib/settings";
import type { StoreSettings } from "../src/lib/types";

export async function seed(options: { resetAdminPassword?: boolean } = {}) {
  for (const product of sampleProducts) productSchema.parse(product);
  await ensureIndexes();
  const { products, users } = await collections();
  await (
    await getDb()
  )
    .collection<StoreSettings & { _id: string }>("settings")
    .updateOne(
      { _id: "store" },
      { $setOnInsert: defaultSettings },
      { upsert: true },
    );
  for (const product of sampleProducts)
    await products.updateOne(
      { _id: product._id },
      { $setOnInsert: product },
      { upsert: true },
    );
  if (process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
    const email = emailSchema.parse(process.env.ADMIN_EMAIL);
    const password = passwordSchema.parse(process.env.ADMIN_PASSWORD);
    const username = process.env.ADMIN_USERNAME
      ? usernameSchema.parse(process.env.ADMIN_USERNAME)
      : undefined;
    const existing = await users.findOne({ email });
    if (existing && existing.role !== "admin")
      throw new Error(
        "That email already belongs to a customer. Use a separate administrator email.",
      );
    await users.updateOne(
      { email },
      {
        $setOnInsert: {
          _id: randomUUID(),
          email,
          name: "Shop Administrator",
          ...(!options.resetAdminPassword
            ? { passwordHash: await hash(password, 12) }
            : {}),
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        ...(username || options.resetAdminPassword
          ? {
              $set: {
                ...(username ? { username } : {}),
                ...(options.resetAdminPassword
                  ? { passwordHash: await hash(password, 12) }
                  : {}),
              },
            }
          : {}),
      },
      { upsert: true },
    );
    if (options.resetAdminPassword && existing) {
      await (
        await getDb()
      )
        .collection("sessions")
        .deleteMany({ userId: existing._id });
    }
  }
}
if (process.argv[1]?.endsWith("seed.ts")) {
  loadEnvConfig(process.cwd(), true);
  seed({ resetAdminPassword: process.argv.includes("--reset-admin-password") })
    .then(() =>
      console.log(
        `Catalog and indexes ready (${sampleProducts.length} sample products). Existing stock was preserved.${process.argv.includes("--reset-admin-password") ? " Administrator password updated." : " Existing passwords were preserved."}`,
      ),
    )
    .finally(async () => {
      await (await getClient()).close();
    })
    .catch((error) => {
      console.error(
        `Seeding failed (${error instanceof Error ? error.name : "unknown error"}). Check MongoDB and administrator configuration.`,
      );
      process.exitCode = 1;
    });
}
