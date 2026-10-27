"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { money, dateFormat } from "@/lib/utils";
import type { Order } from "@/lib/types";
export function OrdersTable({ orders }: { orders: Order[] }) {
  return orders.length ? (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>
                <Link href={`/admin/orders/${order._id}`}>
                  <strong>{order.number}</strong>
                </Link>
                <small>Cash on delivery</small>
              </td>
              <td>
                <strong>{order.customer.name}</strong>
                <small>{order.customer.city}</small>
              </td>
              <td>{dateFormat(order.createdAt)}</td>
              <td>
                <span className={`status status-${order.status}`}>
                  {order.status}
                </span>
              </td>
              <td>{money(order.total)}</td>
              <td>
                <Link
                  href={`/admin/orders/${order._id}`}
                  aria-label={`View ${order.number}`}
                >
                  <ArrowUpRight size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="admin-empty">
      No orders here yet. Your next sale starts with a good find.
    </div>
  );
}
