import Link from "next/link";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = { title: "Here to help" };
export default async function InformationPage() {
  const settings = await getSettings();
  return (
    <main>
      <div className="page-intro">
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Here to help</span>
          </div>
          <span className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</span>
          <h1>Here to help.</h1>
          <p>Everything to know about shopping with Al Makkah.</p>
        </div>
      </div>
      <div className="container information-wrap">
        <nav className="information-nav" aria-label="Information sections">
          {[
            ["about", "About Al Makkah"],
            ["delivery", "Delivery & payment"],
            ["returns", "Returns & exchanges"],
            ["contact", "Contact the shop"],
            ["privacy", "Your privacy"],
            ["terms", "Shopping terms"],
          ].map(([id, name]) => (
            <a href={`#${id}`} key={id}>
              {name}
            </a>
          ))}
        </nav>
        <div className="information-copy">
          <section id="about">
            <span className="eyebrow">YOUR EVERYDAY, ELEVATED</span>
            <h2>Hello, we’re Al Makkah.</h2>
            <p>
              Al Makkah Mobile & Lifestyle brings mobile phones, watches,
              eyewear, and everyday accessories together in one thoughtfully
              selected collection. We keep things simple: clear prices in
              Pakistani rupees, personal order confirmation, and payment on
              arrival. Checkout prepares a WhatsApp message with your order
              details; tap Send in WhatsApp to share it with the shop.
            </p>
          </section>
          <section id="delivery">
            <h2>Delivered with care.</h2>
            <p>
              We accept delivery addresses within Pakistan. Delivery costs Rs.
              250, with free delivery on orders of Rs. 10,000 or more. Your
              exact total appears before you place an order.
            </p>
            <p>
              Payment is cash on delivery. Placing an order creates a request;
              the shop will contact you on the number provided to confirm
              product details, stock, and dispatch timing. Delivery dates depend
              on your location and the courier. We do not currently accept
              online card payments.
            </p>
          </section>
          <section id="returns">
            <h2>Let’s get it sorted.</h2>
            {settings.returnPolicy && (
              <p style={{ whiteSpace: "pre-line" }}>{settings.returnPolicy}</p>
            )}
            <p>
              If an item arrives damaged, incorrect, or with a problem, keep its
              packaging, take clear photos, and contact the shop using the
              contact details provided during order confirmation. Include your
              order number and a description of the issue.
            </p>
            {!settings.returnPolicy && (
              <p>
                Return eligibility, time limits, warranty coverage, and any
                delivery charges must be confirmed with the shop for the
                specific product before purchase. Please confirm a return
                arrangement before sending an item back.
              </p>
            )}
          </section>
          <section id="contact">
            <h2>A real person, ready to help.</h2>
            {settings.phone && (
              <p>
                Call us: <a href={`tel:${settings.phone}`}>{settings.phone}</a>
              </p>
            )}
            {settings.whatsapp && (
              <p>
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat with the shop on WhatsApp ↗
                </a>
              </p>
            )}
            {settings.email && (
              <p>
                Email: <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </p>
            )}
            {settings.address && (
              <p style={{ whiteSpace: "pre-line" }}>{settings.address}</p>
            )}
            {settings.openingHours && (
              <p>Opening hours: {settings.openingHours}</p>
            )}
            <p>
              For an existing order, use your order number and the shop contact
              details supplied when the team confirms your order. Keep the
              private order link shown after checkout to view its progress.
            </p>
            <p>
              Questions about a phone? Confirm storage, color, condition, PTA
              approval, and warranty with the team during confirmation before
              agreeing to dispatch.
            </p>
          </section>
          <section id="privacy">
            <h2>Your information, treated with care.</h2>
            <p>
              When you choose WhatsApp checkout, your prepared message includes
              your contact details, delivery address, items, and total. It is
              shared with the shop through WhatsApp only when you tap Send. We
              also collect the name, email address, phone number, delivery
              address, and order details needed to process your purchase.
              Account passwords are stored as hashes. Sign-in uses a secure,
              HTTP-only cookie; your shopping bag and wishlist are stored in
              your browser.
            </p>
            <p>
              Delivery details may be shared with the courier to fulfill your
              order. Your order confirmation link provides access to order
              details, so keep it private. Contact the shop through the details
              provided during confirmation to ask about your information.
            </p>
          </section>
          <section id="terms">
            <h2>A few straightforward terms.</h2>
            <p>
              Prices are displayed in PKR. Product photos are illustrative, and
              actual colors or packaging may vary. Product descriptions and
              stock are subject to shop confirmation. Sample catalog listings
              must be verified by the shop before accepting real orders.
            </p>
            <p>
              Orders are cash on delivery and subject to confirmation and
              availability. Please provide accurate contact and address details.
              For a cancellation request, contact the shop promptly; orders
              already dispatched may need to follow the shop’s return process.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
