import { Gem } from "lucide-react";
import Link from "next/link";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Al Makkah home"
    >
      <span className="brand-mark">
        <Gem size={27} strokeWidth={1.5} />
      </span>
      <span>
        <strong>
          AL MAKKAH<span className="brand-dot">.</span>
        </strong>
        <small>MOBILE & LIFESTYLE</small>
      </span>
    </Link>
  );
}
