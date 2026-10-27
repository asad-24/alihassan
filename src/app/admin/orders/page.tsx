"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { ResourceState, useResource } from "@/components/admin/use-resource";
import { OrdersTable } from "@/components/admin/orders-table";
import { orderStatuses, type Order } from "@/lib/types";
export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const { data, error, reload } = useResource<{
    orders: Order[];
    total: number;
    pages: number;
  }>(`/api/admin/orders?page=${page}`);
  const orders = data?.orders.filter(
    (o) =>
      `${o.number} ${o.customer.name} ${o.customer.email}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!status || o.status === status),
  );
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Every order, in order.</h1>
          <p>
            Confirm the details, arrange delivery, and keep customers in the
            loop.
          </p>
        </div>
      </div>
      <div className="admin-search-bar">
        <Search size={17} />
        <input
          placeholder="Search this page by order or customer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search orders on current page"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter order status"
        >
          <option value="">All statuses</option>
          {orderStatuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {!data ? (
        <ResourceState error={error} retry={reload} />
      ) : (
        <>
          <div className="admin-panel">
            <OrdersTable orders={orders || []} />
          </div>
          <div className="pagination">
            <span>
              {data.total} orders · Page {page} of {Math.max(1, data.pages)}
            </span>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <button
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}
