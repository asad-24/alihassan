import type { Order } from "./types";
import { money } from "./utils";

export function orderWhatsAppUrl(order: Order, number: string) {
  const text = [
    "Assalam o Alaikum, Al Makkah Mobile Shop!",
    `I would like to confirm my order ${order.number}.`,
    "",
    ...order.items.map(
      (item, index) =>
        `${index + 1}. ${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`,
    ),
    "",
    `Subtotal: ${money(order.subtotal)}`,
    `Delivery: ${order.shipping ? money(order.shipping) : "Free"}`,
    `Total: ${money(order.total)}`,
    "Payment: Cash on delivery (PKR)",
    "",
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Email: ${order.customer.email}`,
    `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.postalCode}, Pakistan`,
    ...(order.customer.notes
      ? [`Delivery notes: ${order.customer.notes}`]
      : []),
    "",
    "Please confirm availability and delivery. Thank you!",
  ].join("\n");
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
