"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  UsersRound,
  X,
} from "lucide-react";
import type { User } from "@/lib/types";
import { Brand } from "../brand";
import { LogoutButton } from "../logout-button";
export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const links = [
    ["Overview", "/admin", LayoutDashboard],
    ["Products", "/admin/products", Package],
    ["Orders", "/admin/orders", ShoppingBag],
    ["Customers", "/admin/customers", UsersRound],
    ["Shop details", "/admin/settings", Settings],
  ] as const;
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menu ? "admin-sidebar-open" : ""}`}>
        <Brand light />
        <button
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
          className="admin-menu-button"
          style={{ position: "absolute", right: 12, top: 85 }}
        >
          <X size={17} />
        </button>
        <small>YOUR SHOP, AT A GLANCE</small>
        <nav aria-label="Administration navigation">
          {links.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenu(false)}
              className={
                (
                  href === "/admin"
                    ? pathname === href
                    : pathname.startsWith(href)
                )
                  ? "active"
                  : ""
              }
            >
              <Icon size={17} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/">
            Visit your storefront <ArrowUpRight size={15} />
          </Link>
          <LogoutButton />
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-button"
            aria-label="Open navigation"
            onClick={() => setMenu(!menu)}
          >
            <Menu size={20} />
          </button>
          <span>Al Makkah / Shop administration</span>
          <div className="admin-user">
            <span className="admin-avatar">AM</span>
            <div>
              <strong>{user.name}</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
