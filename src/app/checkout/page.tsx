import Link from "next/link";
import { Checkout } from "@/components/checkout";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout", robots: { index: false } };
export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <main>
      <div className="page-intro">
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/shop">Collection</Link>
            <span>/</span>
            <span>Checkout</span>
          </div>
          <span className="eyebrow">ALMOST YOURS</span>
          <h1>A few details. One friendly message.</h1>
          <p>Order in PKR. Confirm on WhatsApp. Pay cash when it arrives.</p>
        </div>
      </div>
      <div className="container">
        <Checkout whatsapp={settings.whatsapp} />
      </div>
    </main>
  );
}
