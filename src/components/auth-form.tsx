"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { api, useStore } from "./store-provider";
import { Brand } from "./brand";
import type { User } from "@/lib/types";
export function AuthForm({
  register = false,
  next = "/account",
}: {
  register?: boolean;
  next?: string;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { refreshUser } = useStore();
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const { user } = await api<{ user: User }>(
        `/api/auth/${register ? "register" : "login"}`,
        { method: "POST", body: JSON.stringify(values) },
      );
      await refreshUser();
      const destination = ["/admin", "/checkout", "/account"].includes(next)
        ? next
        : "/account";
      router.push(
        user.role === "admin" && destination === "/account"
          ? "/admin"
          : destination,
      );
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-card">
        <Brand />
        <span className="eyebrow">
          {register
            ? "MAKE YOURSELF AT HOME"
            : next === "/admin"
              ? "SHOP ADMINISTRATION"
              : "GOOD TO SEE YOU AGAIN"}
        </span>
        <h1>{register ? "A little more connected." : "Welcome back."}</h1>
        <p>
          {register
            ? "Create an account to keep your orders in one place."
            : "Sign in to pick up where you left off."}
        </p>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={submit}>
          {register && (
            <label className="form-field">
              <span>Your name</span>
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                placeholder="Your full name"
              />
            </label>
          )}
          <label className="form-field">
            <span>{register ? "Email address" : "Email or username"}</span>
            <input
              type={register ? "email" : "text"}
              name={register ? "email" : "identifier"}
              autoComplete={register ? "email" : "username"}
              required
              maxLength={254}
              placeholder={
                register ? "you@example.com" : "Your email or admin username"
              }
            />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete={register ? "new-password" : "current-password"}
              required
              minLength={register ? 10 : 1}
              maxLength={72}
              placeholder={
                register ? "At least 10 characters" : "Your password"
              }
            />
          </label>
          {register && (
            <p className="form-hint" style={{ marginBottom: 20 }}>
              By creating an account, you agree to our{" "}
              <Link href="/information#terms">terms and privacy policy</Link>.
            </p>
          )}
          <button className="btn btn-dark" disabled={busy}>
            {busy
              ? "One moment…"
              : register
                ? "Create your account"
                : "Sign in"}
            <ArrowRight size={17} />
          </button>
        </form>
        <div className="auth-switch">
          {register ? "Already part of the family?" : "New around here?"}{" "}
          <Link
            href={`${register ? "/login" : "/register"}?next=${encodeURIComponent(next)}`}
          >
            {register ? "Sign in" : "Create an account"}
          </Link>
        </div>
        <div className="auth-footer">
          <LockKeyhole size={12} /> Your account, securely connected.
        </div>
      </div>
    </main>
  );
}
