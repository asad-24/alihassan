"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { ResourceState, useResource } from "@/components/admin/use-resource";
import { dateFormat } from "@/lib/utils";
import type { User } from "@/lib/types";
export default function CustomersPage() {
  const { data, error, reload } = useResource<{ customers: User[] }>(
    "/api/admin/customers",
  );
  const [query, setQuery] = useState("");
  const customers = data?.customers.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>The people behind the orders.</h1>
          <p>
            Your latest 500 registered customers. Guest details stay with their
            orders.
          </p>
        </div>
      </div>
      <div className="admin-search-bar">
        <Search size={17} />
        <input
          placeholder="Find a customer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search customers"
        />
      </div>
      {!data ? (
        <ResourceState error={error} retry={reload} />
      ) : (
        <div className="admin-panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers?.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>{dateFormat(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!customers?.length && (
            <div className="admin-empty">No customers found.</div>
          )}
        </div>
      )}
    </>
  );
}
