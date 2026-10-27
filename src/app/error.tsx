"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-box">
      <span className="eyebrow">A SMALL HICCUP</span>
      <h1>Let’s try that again.</h1>
      <p>We couldn’t load this page. Please try again in a moment.</p>
      <div className="error-actions">
        <button className="btn btn-dark" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Back home
        </Link>
      </div>
    </main>
  );
}
