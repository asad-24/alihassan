import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-box">
      <span className="eyebrow">404 / A LITTLE OFF TRACK</span>
      <h1>This one got away.</h1>
      <p>
        The page or product you’re looking for isn’t available. There’s plenty
        more to discover.
      </p>
      <Link href="/shop" className="btn btn-dark">
        Explore the collection
      </Link>
    </main>
  );
}
