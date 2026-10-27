# Al Makkah Mobile & Lifestyle

A complete Next.js App Router storefront and administration app, built with TypeScript, Tailwind CSS, and MongoDB. All server endpoints live in `src/app/api`; there is no separate backend service.

## Run locally

Requires Node.js 22.20+ and npm. Dependencies are already installed in this workspace.

```bash
npm install
npm run dev:local
```

Open the local URL printed in the terminal (normally <http://localhost:3000>). Administration is at `/admin`. If port 3000 is occupied, the launcher picks the next available port.

`dev:local` downloads and starts a real MongoDB replica set on port 27018, creates the catalog and indexes, and starts Next.js. Data persists in `.data/mongodb` between runs. On first use it generates an ignored `.env.local` with a random session secret and administrator password. Find the administrator email and password in that file; no shared default password is used. Do not commit or share it. Stop both services with Ctrl+C.

If `.env.local` already points to Atlas or another MongoDB instance, use the external database setup below instead. Development database files and credentials are excluded from Git.

## Use MongoDB Atlas or an existing replica set

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI` to your Atlas connection string or replica-set connection string and set `MONGODB_DB`.
3. Generate `SESSION_SECRET` with `openssl rand -hex 32` and set `APP_URL` to your exact site origin.
4. Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 10 characters (at most 72 UTF-8 bytes).
5. Run `npm run seed`, then `npm run dev`.

The seed command creates unique indexes, inserts 24 illustrative catalog products, and creates the initial administrator. Running it again preserves existing prices, stock, products, and passwords. It refuses to promote an existing customer account. Choose a separate administrator email. Seeding does not reset an existing administrator password.

MongoDB transactions are required for checkout and order cancellation. Use Atlas or a replica set; a standalone `mongod` is insufficient. `dev:local` handles the replica set automatically.

## Included

- Responsive storefront with mobile phones, watches, eyewear, and accessories.
- Category, name, price, availability, and sorting filters; persisted browser wishlist.
- Product detail pages and a persisted cart with quantity controls.
- Guest and signed-in checkout with server-calculated prices and shipping.
- WhatsApp checkout to +92 301 6922212: saves the order in MongoDB, opens a prepared message, and provides a fallback confirmation button. The customer taps Send in WhatsApp.
- Cash on delivery in PKR: Rs. 250 shipping, free from Rs. 10,000.
- Atomic inventory reservation, rollback on failure, and retry-safe checkout.
- Customer registration, sign-in, account page, and order history.
- Private guest order links and order progress.
- Administrator overview with delivered revenue, order counts, customer counts, and low-stock notices.
- Product creation/editing, pricing, stock, featured picks, archive/restore, and image uploads.
- Order confirmation, dispatch, delivery, and cancellation, with automatic restocking on cancellation.
- Customer directory, editable shop contact/return details, input validation, database-backed authentication rate limits, revocable signed sessions, HTTP-only cookies, same-origin mutation checks, and authorization on every administration endpoint.
- Durable image storage in MongoDB with JPEG/PNG/WebP signature checks and a 3 MB limit.

## Routes

| Storefront                                    | Purpose                                                |
| --------------------------------------------- | ------------------------------------------------------ |
| `/`                                           | Home and curated collections                           |
| `/shop`                                       | Catalog, filters, search, wishlist                     |
| `/product/[slug]`                             | Product details                                        |
| `/checkout`                                   | Delivery details and cash-on-delivery checkout         |
| `/login`, `/register`                         | Customer and administrator sign-in                     |
| `/account`                                    | Signed-in customer order history                       |
| `/order/[id]`                                 | Order details; guest access requires the private token |
| `/information`                                | Delivery, returns, privacy, and shop information       |
| `/admin`                                      | Administrator overview                                 |
| `/admin/products`                             | Inventory and product management                       |
| `/admin/products/new`, `/admin/products/[id]` | Product editor                                         |
| `/admin/orders`, `/admin/orders/[id]`         | Order management                                       |
| `/admin/customers`                            | Customer directory                                     |
| `/admin/settings`                             | Shop contact details and return policy                 |

## Source structure

```text
src/
  app/
    api/
      admin/          # Protected product, order, upload, customer, dashboard APIs
      auth/           # Login, registration, session, logout
      media/          # Uploaded product images
      orders/         # Checkout and authorized order access
      products/       # Public product catalog
    admin/            # Protected administration routes
    account/          # Customer order history
    checkout/
    product/[slug]/
    order/[id]/
    shop/
  components/
    admin/            # Administration shell, forms, tables
    store-provider.tsx
    product-card.tsx
    checkout.tsx
  lib/
    auth.ts           # Sessions and authentication rate limits
    db.ts             # Shared MongoDB connection and indexes
    shop.ts           # Transactional inventory and order operations
    validation.ts     # Server-side Zod schemas
    catalog.ts        # Illustrative starter catalog
    types.ts
scripts/
  dev-local.ts        # Persistent local MongoDB + Next.js
  seed.ts
  test-server.ts      # Isolated MongoDB and production server for browser tests
tests/
  shop.test.ts        # MongoDB transaction/concurrency integration tests
  browser/            # Storefront, checkout, accounts, admin, permission tests
```

## Verification

```bash
npm run lint
npm run typecheck
npm run build
npm run test:integration
npm test
```

Integration tests start an isolated MongoDB replica set and verify totals, rollback, overselling, checkout retries, cancellation, and valid state transitions. Browser tests use an isolated database and a production build on port 3100. They require installed Google Chrome; change `channel` in `playwright.config.ts` if using another installed Playwright browser. Test databases are separate from the local shop database.

## Production

Use a Node.js host and MongoDB Atlas or a managed replica set. Configure environment variables on the host, run `npm run seed` once, then `npm run build` and `npm start`. Use HTTPS so production session cookies can be sent. Set `APP_URL` to the deployed origin. Back up MongoDB, including the `media` collection. Do not deploy the development MongoDB launcher.

Before accepting real orders, replace the illustrative catalog, verify prices, stock, PTA status and product specifications, and supply the shop's real contact and return details in `/admin/settings`. Product imagery uses illustrative Unsplash photos; upload actual stock photos in the admin panel.

Cash on delivery is implemented. Online card payments, courier booking, and email/SMS notifications are not connected to external providers. Guest customers must save their private confirmation link; no confirmation email is sent. WhatsApp messages are prepared for the customer to send; the site does not use the WhatsApp Business API or send messages silently. The shop follows up using the phone number supplied at checkout.

Administrator sign-in accepts the `ADMIN_USERNAME` configured in your ignored `.env`, or the account email. Customer registration still uses email. Set `ADMIN_USERNAME=admin` and run `npm run seed -- --reset-admin-password` to explicitly apply a new administrator password from the environment. Ordinary seeding preserves existing passwords.
