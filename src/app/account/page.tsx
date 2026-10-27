import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Package } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { collections } from "@/lib/db";
import { dateFormat, money } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your account", robots: { index: false } };
export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account");
  const orders = await (
    await collections()
  ).orders
    .find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  return (
    <main className="container account-section">
      <div className="account-welcome">
        <div>
          <span className="eyebrow">YOUR LITTLE CORNER OF AL MAKKAH</span>
          <h1>Hello, {user.name.split(" ")[0]}.</h1>
          <p>{user.email} · Good to have you here.</p>
        </div>
        <div>
          {user.role === "admin" && (
            <Link href="/admin" className="btn btn-outline">
              Open administration
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
      <h2>Your orders.</h2>
      {orders.length ? (
        orders.map((order) => (
          <Link
            className="order-card"
            key={order._id}
            href={`/order/${order._id}`}
          >
            <div>
              <strong>{order.number}</strong>
              <small>
                {dateFormat(order.createdAt)} ·{" "}
                {order.items.reduce((n, i) => n + i.quantity, 0)} items
              </small>
            </div>
            <div className="order-card-right">
              <span className={`status status-${order.status}`}>
                {order.status}
              </span>
              <strong>{money(order.total)}</strong>
              <ArrowUpRight size={18} />
            </div>
          </Link>
        ))
      ) : (
        <div className="empty-state">
          <Package size={40} strokeWidth={1} />
          <h3>Your first good find is waiting.</h3>
          <p>Orders placed while you’re signed in will appear here.</p>
          <Link href="/shop" className="btn btn-dark">
            Explore the collection <ArrowUpRight size={17} />
          </Link>
        </div>
      )}
      <p className="muted" style={{ marginTop: 25 }}>
        Placed an order as a guest? Use the private order link saved after
        checkout.
      </p>
    </main>
  );
}
