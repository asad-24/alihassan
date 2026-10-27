import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
const origin = "http://localhost:3100";
async function login(request: APIRequestContext) {
  const response = await request.post("/api/auth/login", {
    headers: { Origin: origin },
    data: {
      email: "admin@example.test",
      password: "Test-Administrator-Password!",
    },
  });
  expect(response.status()).toBe(200);
}
test("storefront renders, category filters work, and mobile layout fits", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Good taste. Great choices." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Browse everything" }).click();
  await page.getByRole("button", { name: "Watches" }).click();
  const catalog = await (await request.get("/api/products")).json();
  const watchCount = catalog.products.filter(
    (product: { category: string }) => product.category === "Watches",
  ).length;
  await expect(page.locator(".results-caption")).toContainText(
    `${watchCount} good finds in Watches`,
  );
  await page
    .getByRole("textbox", { name: "Search the collection" })
    .fill("Minimal");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/storefront-mobile.png",
    fullPage: false,
  });
  await page.locator("#collections").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("heading", { name: "Find your everyday." }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/collections-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/storefront-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("guest can add a product, checkout, and revisit a private order", async ({
  page,
}) => {
  await page.goto("/product/everyday-aviator");
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Shopping bag" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await page.getByLabel("Full name").fill("Browser Customer");
  await page.getByLabel("Email address").fill("browser@example.test");
  await page.getByLabel("Mobile number").fill("03001234567");
  await page.getByLabel("Street address").fill("House 20, Browser Test Street");
  await page.getByLabel("City", { exact: true }).fill("Lahore");
  await page.getByLabel("Postal code").fill("54000");
  await page
    .context()
    .route("https://wa.me/**", (route) =>
      route.fulfill({ body: "WhatsApp checkout handoff verified" }),
    );
  const [whatsapp] = await Promise.all([
    page.waitForEvent("popup"),
    page
      .getByRole("button", { name: "Save order & open WhatsApp", exact: true })
      .click(),
  ]);
  await whatsapp.waitForURL(/wa\.me\/923016922212/);
  const message = new URL(whatsapp.url()).searchParams.get("text") || "";
  expect(message).toContain("Everyday Aviator × 1");
  expect(message).toContain("Rs. 3,750");
  expect(message).toContain("House 20, Browser Test Street");
  await whatsapp.close();
  await expect(
    page.getByRole("heading", { name: "Thank you for shopping with us." }),
  ).toBeVisible();
  expect(page.url()).toContain("token=");
  await expect(page.locator(".summary-total")).toContainText("3,750");
  const url = page.url();
  await page.reload();
  await expect(
    page.getByRole("main").getByText("Browser Customer", { exact: true }),
  ).toBeVisible();
  await page.goto(url.split("?")[0]);
  await expect(
    page.getByRole("heading", { name: "This one got away." }),
  ).toBeVisible();
});
test("customer sign-up cannot escalate roles or read administration", async ({
  page,
  request,
}) => {
  const email = `customer-${randomUUID()}@example.test`;
  const registered = await request.post("/api/auth/register", {
    headers: { Origin: origin },
    data: {
      name: "Test Customer",
      email,
      password: "Customer-Password-Only!",
      role: "admin",
    },
  });
  expect(registered.status()).toBe(201);
  expect((await registered.json()).user.role).toBe("customer");
  const denied = await request.get("/api/admin/orders");
  expect(denied.status()).toBe(403);
  const order = await request.post("/api/orders", {
    headers: { Origin: origin },
    data: {
      customer: {
        name: "Test Customer",
        email,
        phone: "03001234567",
        address: "House 30, Customer Test Street",
        city: "Lahore",
        postalCode: "54000",
        notes: "",
      },
      items: [{ productId: "weekend-shades", quantity: 1 }],
      paymentMethod: "cod",
      idempotencyKey: randomUUID(),
    },
  });
  expect(order.status()).toBe(201);
  const ownOrders = await (await request.get("/api/orders")).json();
  expect(ownOrders.orders).toHaveLength(1);
  await page.goto("/login");
  await page.getByLabel("Email or username").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Customer-Password-Only!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, Test." }),
  ).toBeVisible();
  await expect(page.locator(".order-card")).toHaveCount(1);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/account$/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
test("admin can create, edit, archive, restore, and upload a product photo", async ({
  request,
}) => {
  await login(request);
  const image = await request.post("/api/admin/uploads", {
    headers: { Origin: origin },
    multipart: {
      file: {
        name: "product.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aNioAAAAASUVORK5CYII=",
          "base64",
        ),
      },
    },
  });
  expect(image.status()).toBe(201);
  const { url } = await image.json();
  expect((await request.get(url)).status()).toBe(200);
  const product = {
    name: "Test Shop Watch",
    slug: `test-watch-${randomUUID()}`,
    brand: "Test Collection",
    category: "Watches",
    price: 5000,
    compareAtPrice: 6500,
    stock: 3,
    description: "A product created by the integration suite.",
    features: ["Test feature"],
    image: url,
    active: true,
    featured: false,
    badge: "New",
  };
  const created = await request.post("/api/admin/products", {
    headers: { Origin: origin },
    data: product,
  });
  expect(created.status()).toBe(201);
  const id = (await created.json()).product._id;
  expect(
    (
      await request.patch(`/api/admin/products/${id}`, {
        headers: { Origin: origin },
        data: { ...product, expectedStock: 3, price: 5500 },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.patch(`/api/admin/products/${id}`, {
        headers: { Origin: origin },
        data: { ...product, expectedStock: 999, stock: 100 },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.delete(`/api/admin/products/${id}`, {
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(200);
  const catalog = await (await request.get("/api/products")).json();
  expect(catalog.products.some((p: { _id: string }) => p._id === id)).toBe(
    false,
  );
  expect(
    (
      await request.patch(`/api/admin/products/${id}`, {
        headers: { Origin: origin },
        data: { ...product, expectedStock: 3, active: true },
      })
    ).status(),
  ).toBe(200);
  const malicious = await request.post("/api/admin/uploads", {
    headers: { Origin: origin },
    multipart: {
      file: {
        name: "image.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from("<svg></svg>"),
      },
    },
  });
  expect(malicious.status()).toBe(400);
});
test("admin dashboard and order state changes work; foreign origins are rejected", async ({
  page,
  request,
}) => {
  await login(request);
  const rejected = await request.post("/api/admin/products", {
    headers: { Origin: "https://untrusted.example" },
    data: {},
  });
  expect(rejected.status()).toBe(403);
  const createdOrder = await request.post("/api/orders", {
    headers: { Origin: origin },
    data: {
      customer: {
        name: "Admin Test Buyer",
        email: "buyer@example.test",
        phone: "03001234567",
        address: "House 40, Admin Test Street",
        city: "Lahore",
        postalCode: "54000",
        notes: "",
      },
      items: [{ productId: "minimal-watch", quantity: 1 }],
      paymentMethod: "cod",
      idempotencyKey: randomUUID(),
    },
  });
  expect(createdOrder.status()).toBe(201);
  const id = (await createdOrder.json()).order._id;
  expect(
    (
      await request.patch(`/api/admin/orders/${id}`, {
        headers: { Origin: origin },
        data: { status: "confirmed" },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.patch(`/api/admin/orders/${id}`, {
        headers: { Origin: origin },
        data: { status: "cancelled" },
      })
    ).status(),
  ).toBe(200);
  await page.goto("/login?next=/admin");
  await page.getByLabel("Email or username").fill("admin");
  await page
    .getByLabel("Password", { exact: true })
    .fill("Test-Administrator-Password!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your shop, at a glance." }),
  ).toBeVisible();
  await expect(
    page.getByText("Delivered revenue", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/admin-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Products", exact: true }).click();
  await page
    .getByRole("link", { name: "Edit Minimal Mesh Watch", exact: true })
    .click();
  await page.getByLabel("Badge (optional)").fill("Everyday favorite");
  await page.getByRole("button", { name: "Save product", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await page.getByRole("link", { name: "Shop details", exact: true }).click();
  await page.getByLabel("Phone number", { exact: true }).fill("03001234567");
  await page
    .getByLabel("Shop address", { exact: true })
    .fill("Test Shop Address, Lahore");
  await page.getByRole("button", { name: "Save shop details" }).click();
  await expect(page.getByRole("status")).toContainText("Shop details updated");
  await page.goto("/information#contact");
  await expect(
    page.getByRole("link", { name: "03001234567", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Test Shop Address, Lahore", { exact: true }),
  ).toBeVisible();
});
test("signing out revokes copied session cookies", async ({
  request,
  playwright,
}) => {
  await login(request);
  const copied = await playwright.request.newContext({
    baseURL: origin,
    storageState: await request.storageState(),
  });
  expect((await copied.get("/api/admin/overview")).status()).toBe(200);
  expect(
    (
      await request.post("/api/auth/logout", { headers: { Origin: origin } })
    ).status(),
  ).toBe(200);
  expect((await copied.get("/api/admin/overview")).status()).toBe(401);
  await copied.dispose();
});
test("anonymous callers cannot access admin data or another customer's order", async ({
  request,
}) => {
  expect((await request.get("/api/admin/products")).status()).toBe(401);
  expect((await request.get(`/api/orders/${randomUUID()}`)).status()).toBe(404);
});
