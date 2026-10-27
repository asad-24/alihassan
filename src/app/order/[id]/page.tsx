import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, ArrowUpRight, MessageCircle } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { collections, isDatabaseConfigured } from "@/lib/db";
import { tokenMatches } from "@/lib/shop";
import { money, dateFormat } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { orderWhatsAppUrl } from "@/lib/whatsapp";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  if (!isDatabaseConfigured()) notFound();
  const { id } = await params;
  const { token } = await searchParams;
  const order = await (await collections()).orders.findOne({ _id: id });
  const user = await currentUser();
  if (
    !order ||
    !(
      user?.role === "admin" ||
      (user && order.userId === user._id) ||
      tokenMatches(order.trackingToken, token || "")
    )
  )
    notFound();
  const steps = ["pending", "confirmed", "shipped", "delivered"];
  const settings = await getSettings();
  return (
    <main className="confirmation-wrap">
      <div className="confirmation-header">
        <div className="success-circle">
          <Check size={28} strokeWidth={1.5} />
        </div>
        <span className="eyebrow">
          {order.status === "cancelled"
            ? "ORDER UPDATE"
            : "A GOOD CHOICE, ALL YOURS"}
        </span>
        <h1>
          {order.status === "cancelled"
            ? "Your order was cancelled."
            : "Thank you for shopping with us."}
        </h1>
        <p>
          {order.number} · Placed {dateFormat(order.createdAt)}
          <br />
          {order.status !== "cancelled" &&
            "The shop will contact you to confirm your order."}
        </p>
      </div>
      {order.status === "pending" && settings.whatsapp && (
        <section className="whatsapp-confirmation">
          <MessageCircle size={25} />
          <div>
            <h2>One message to make it yours.</h2>
            <p>
              Your order is saved. Send the prepared WhatsApp message to our
              shop so we can confirm availability and delivery.
            </p>
            <a
              className="btn btn-whatsapp"
              href={orderWhatsAppUrl(order, settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Send order on WhatsApp <ArrowUpRight size={16} />
            </a>
            <small>
              If WhatsApp didn’t open, use this button. You still need to tap
              Send in WhatsApp.
            </small>
          </div>
        </section>
      )}
      {order.status !== "cancelled" && (
        <div className="order-progress">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`progress-step ${steps.indexOf(order.status) >= index ? "complete" : ""}`}
            >
              <span>
                {steps.indexOf(order.status) >= index ? (
                  <Check size={12} />
                ) : (
                  index + 1
                )}
              </span>
              {step === "pending"
                ? "Order placed"
                : step.charAt(0).toUpperCase() + step.slice(1)}
            </div>
          ))}
        </div>
      )}
      <div className="order-info-grid">
        <div>
          <span>DELIVER TO</span>
          <strong>{order.customer.name}</strong>
          <p>
            {order.customer.address}
            <br />
            {order.customer.city}, {order.customer.postalCode}
            <br />
            {order.customer.phone}
          </p>
        </div>
        <div>
          <span>PAYMENT</span>
          <strong>Cash on delivery</strong>
          <p>
            {order.status === "cancelled"
              ? "No payment is due."
              : `Pay ${money(order.total)} when your order arrives.`}
            <br />
            {order.customer.email}
          </p>
        </div>
      </div>
      <div className="order-summary" style={{ position: "static" }}>
        <h2>Your good finds.</h2>
        {order.items.map((item) => (
          <div className="summary-item" key={item.productId}>
            <Image
              src={item.image}
              alt={item.name}
              width={53}
              height={65}
              unoptimized
            />
            <div>
              <strong>{item.name}</strong>
              <small>Quantity: {item.quantity}</small>
            </div>
            <span>{money(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="summary-lines">
          <p>
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </p>
          <p>
            <span>Delivery</span>
            <span>{order.shipping ? money(order.shipping) : "On us"}</span>
          </p>
          <p className="summary-total">
            <span>Total</span>
            <span>{money(order.total)}</span>
          </p>
        </div>
      </div>
      {!user && (
        <p className="summary-note" style={{ margin: "20px 0" }}>
          Save this private order link to check your status later. Anyone with
          the link can view this order.
        </p>
      )}
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <Link href="/shop" className="btn btn-dark">
          Keep exploring <ArrowUpRight size={17} />
        </Link>
      </div>
    </main>
  );
}
