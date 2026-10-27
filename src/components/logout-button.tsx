"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { api, useStore } from "./store-provider";
export function LogoutButton() {
  const router = useRouter();
  const { refreshUser, notify } = useStore();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="text-link"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api("/api/auth/logout", { method: "POST" });
          await refreshUser();
          router.push("/login");
          router.refresh();
        } catch (error) {
          notify((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <LogOut size={14} />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
