"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { api, useStore } from "../store-provider";
import { ResourceState, useResource } from "./use-resource";
import { money, dateFormat } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";
const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};
export function OrderManager({ id }: { id: string }) {
  const { data, error, reload } = useResource<{ order: Order }>(
    `/api/orders/${id}`,
  );
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { notify } = useStore();
  const order = data?.order;
  async function save() {
    if (!status) return;
    setBusy(true);
    setSaveError("");
    try {
      await api(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      notify("Order status updated");
      setStatus("");
      reload();
    } catch (error) {
      setSaveError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!order) return <ResourceState error={error} retry={reload} />;
  return (
    <>
      <Link
        href="/admin/orders"
        className="text-link"
        style={{ marginBottom: 23 }}
      >
        <ArrowLeft size={14} /> Back to orders
      </Link>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">ORDER DETAILS</span>
          <h1>{order.number}</h1>
          <p>Placed {dateFormat(order.createdAt)} · Cash on delivery</p>
        </div>
        <span className={`status status-${order.status}`}>{order.status}</span>
      </div>
      <div className="admin-order-layout">
        <div>
          <div className="admin-panel">
            <div className="panel-header">
              <h2>The good finds</h2>
            </div>
            <div style={{ padding: 24 }}>
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
                    <small>
                      {money(item.price)} × {item.quantity}
                    </small>
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
                  <span>{money(order.shipping)}</span>
                </p>
                <p className="summary-total">
                  <span>
                    Total{" "}
                    {order.status === "delivered"
                      ? "collected"
                      : "due on delivery"}
                  </span>
                  <span>{money(order.total)}</span>
                </p>
              </div>
            </div>
          </div>
          {order.customer.notes && (
            <div className="admin-notice">
              <strong>Delivery note:</strong> {order.customer.notes}
            </div>
          )}
        </div>
        <div>
          <div className="admin-panel admin-order-info">
            <h3>Customer & delivery</h3>
            <p>
              <strong>{order.customer.name}</strong>
              <br />
              {order.customer.email}
              <br />
              <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a>
            </p>
            <p>
              {order.customer.address}
              <br />
              {order.customer.city}, {order.customer.postalCode}
              <br />
              Pakistan
            </p>
          </div>
          <div className="admin-panel admin-order-info">
            <h3>Keep things moving</h3>
            {saveError && (
              <div className="form-error" role="alert">
                {saveError}
              </div>
            )}
            {transitions[order.status].length ? (
              <>
                <label htmlFor="order-status">Next order status</label>
                <select
                  id="order-status"
                  value={status || order.status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value={order.status}>{order.status} (current)</option>
                  {transitions[order.status].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <p>
                  Cancelling an order returns its items to stock. Delivered and
                  cancelled orders are final.
                </p>
                <button
                  className="btn btn-dark"
                  disabled={busy || !status || status === order.status}
                  onClick={save}
                >
                  <Save size={15} />
                  {busy ? "Updating…" : "Update order"}
                </button>
              </>
            ) : (
              <p>
                This order is {order.status}. No further status changes are
                available.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
