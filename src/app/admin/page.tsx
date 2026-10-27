"use client";
import Link from "next/link";
import { Banknote, Package, Plus, ShoppingBag, UsersRound } from "lucide-react";
import { ResourceState, useResource } from "@/components/admin/use-resource";
import { OrdersTable } from "@/components/admin/orders-table";
import { money } from "@/lib/utils";
import type { Order, Product } from "@/lib/types";
type Overview = {
  orders: number;
  revenue: number;
  pending: number;
  productCount: number;
  customerCount: number;
  lowStock: Product[];
  recentOrders: Order[];
};
export default function AdminOverview() {
  const { data, error, reload } = useResource<Overview>("/api/admin/overview");
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">LET’S MAKE IT A GOOD DAY</span>
          <h1>Your shop, at a glance.</h1>
          <p>A little clarity for everything happening at Al Makkah.</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-dark">
          <Plus size={16} /> Add product
        </Link>
      </div>
      {!data ? (
        <ResourceState error={error} retry={reload} />
      ) : (
        <>
          <div className="stats-grid">
            {[
              [
                "Delivered revenue",
                money(data.revenue),
                Banknote,
                "Collected on delivered orders",
              ],
              [
                "Total orders",
                String(data.orders),
                ShoppingBag,
                `${data.pending} waiting for confirmation`,
              ],
              [
                "Active products",
                String(data.productCount),
                Package,
                "Available in your storefront",
              ],
              [
                "Registered customers",
                String(data.customerCount),
                UsersRound,
                "Growing your shop community",
              ],
            ].map(([label, value, Icon, note]) => {
              const StatIcon = Icon as typeof Package;
              return (
                <div className="stat-card" key={String(label)}>
                  <div className="stat-card-top">
                    <span>{String(label)}</span>
                    <StatIcon size={19} strokeWidth={1.5} />
                  </div>
                  <strong>{String(value)}</strong>
                  <small>{String(note)}</small>
                </div>
              );
            })}
          </div>
          <div className="admin-panel">
            <div className="panel-header">
              <h2>The latest orders</h2>
              <Link href="/admin/orders">View all orders ↗</Link>
            </div>
            <OrdersTable orders={data.recentOrders} />
          </div>
          <div className="admin-panel">
            <div className="panel-header">
              <h2>A little stock check</h2>
              <Link href="/admin/products">Manage inventory ↗</Link>
            </div>
            {data.lowStock.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Remaining</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStock.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>{p.category}</td>
                        <td>
                          <span className="status">{p.stock} left</span>
                        </td>
                        <td>
                          <Link
                            href={`/admin/products/${p._id}`}
                            className="text-link"
                          >
                            Update stock ↗
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty">
                All active products have more than 5 units in stock.
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
