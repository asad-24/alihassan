import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Sparkles,
  Smartphone,
  Watch,
  Glasses,
  Headphones,
} from "lucide-react";
import { getProducts } from "@/lib/shop";
import { FeaturedProducts } from "@/components/featured-products";
export const dynamic = "force-dynamic";
const collectionCards = [
  {
    name: "Mobiles",
    sub: "Your world. Upgraded.",
    icon: Smartphone,
    image: "photo-1592750475338-74b7b21085ab",
    className: "cat-mobile",
  },
  {
    name: "Watches",
    sub: "Make every moment count.",
    icon: Watch,
    image: "photo-1524805444758-089113d48a6d",
    className: "cat-watch",
  },
  {
    name: "Eyewear",
    sub: "See things differently.",
    icon: Glasses,
    image: "photo-1572635196237-14b3f281503f",
    className: "cat-eyewear",
  },
  {
    name: "Accessories",
    sub: "The little things, sorted.",
    icon: Headphones,
    image: "photo-1606220945770-b5b6c2c55bf1",
    className: "cat-accessories",
  },
];
export default async function Home() {
  const products = await getProducts();
  return (
    <main>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span /> THE EVERYDAY, ELEVATED
            </div>
            <h1>
              Good taste.
              <br />
              Great <em>choices.</em>
            </h1>
            <p>
              From the phone in your pocket to the watch on your wrist. Discover
              little upgrades that make your everyday feel extraordinary.
            </p>
            <div className="hero-buttons">
              <Link href="/shop" className="btn btn-dark">
                Explore the collection <ArrowUpRight size={18} />
              </Link>
              <Link href="/shop?sort=newest" className="text-link">
                What’s new <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-assurance">
              <span>
                <Check size={14} /> Carefully selected
              </span>
              <span>
                <Check size={14} /> Fairly priced
              </span>
              <span>
                <Check size={14} /> Delivered with care
              </span>
            </div>
            <div className="hero-index">
              <span>01 / THE NEW EVERYDAY</span>
              <a href="#collections" aria-label="Explore categories">
                <ArrowDown size={17} />
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1400&q=90"
              alt="Titanium iPhone Pro, part of the Al Makkah mobile collection"
              fill
              priority
              unoptimized
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <div className="hero-photo-shade" />
            <span className="hero-image-label">
              <Sparkles size={13} /> THE POCKET-SIZED UPGRADE
            </span>
            <div className="hero-product-note">
              <div>
                <small>MEET YOUR NEXT FAVORITE</small>
                <strong>The mobile collection</strong>
                <span>Built for everything you do.</span>
              </div>
              <Link href="/shop?category=Mobiles" aria-label="Shop mobiles">
                <ArrowUpRight size={24} />
              </Link>
            </div>
            <span className="hero-side-text">AL MAKKAH / CURATED FOR YOU</span>
          </div>
        </div>
      </section>
      <div className="brand-ticker">
        <div className="container">
          <span>THE BRANDS YOU KNOW. THE CHOICES YOU’LL LOVE.</span>
          <b>Apple</b>
          <b>SAMSUNG</b>
          <b className="ticker-serif">Everyday classics</b>
          <b>Sound & style</b>
          <Sparkles size={18} />
          <b className="ticker-serif">Your next favorite</b>
        </div>
      </div>
      <section className="section container" id="collections">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A LITTLE SOMETHING FOR EVERY YOU</span>
            <h2>Find your everyday.</h2>
          </div>
          <Link href="/shop" className="text-link">
            Browse everything <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="category-grid">
          {collectionCards.map(
            ({ name, sub, icon: Icon, image, className }) => (
              <Link
                className={`category-card ${className}`}
                href={`/shop?category=${name}`}
                key={name}
              >
                <div className="category-card-top">
                  <Icon size={19} strokeWidth={1.5} />
                  <span>
                    {String(
                      products.filter((p) => p.category === name).length,
                    ).padStart(2, "0")}{" "}
                    PICKS
                  </span>
                </div>
                <div className="category-image">
                  <Image
                    src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=650&q=80`}
                    alt={`${name} collection`}
                    fill
                    unoptimized
                    sizes="(max-width: 600px) 50vw, 25vw"
                  />
                </div>
                <div className="category-card-bottom">
                  <div>
                    <h3>{name}</h3>
                    <p>{sub}</p>
                  </div>
                  <span>
                    <ArrowUpRight size={19} />
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </section>
      <section className="featured-section">
        <div className="container section">
          <FeaturedProducts products={products} />
        </div>
      </section>
      <section className="container lifestyle-section">
        <div className="lifestyle-image">
          <Image
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85"
            alt="A minimal everyday watch"
            fill
            unoptimized
            sizes="(max-width: 800px) 100vw, 50vw"
          />
          <span className="image-caption">THE ART OF KEEPING IT SIMPLE.</span>
        </div>
        <div className="lifestyle-copy">
          <span className="eyebrow">MORE THAN THE TIME</span>
          <h2>
            A good watch.
            <br />A great <em>impression.</em>
          </h2>
          <p>
            Some things never go out of style. Find a watch that feels like you,
            from clean everyday classics to something a little more bold.
          </p>
          <Link href="/shop?category=Watches" className="btn btn-dark">
            Find your perfect watch <ArrowUpRight size={18} />
          </Link>
          <span className="lifestyle-footnote">
            THOUGHTFULLY PICKED. EASY TO LOVE.
          </span>
        </div>
      </section>
      <section className="about-banner container">
        <div>
          <span className="eyebrow">HELLO, WE’RE AL MAKKAH.</span>
          <h2>
            Your neighborhood shop.
            <br />
            <em>Now, wherever you are.</em>
          </h2>
        </div>
        <div>
          <p>
            We believe the things you use every day should bring you a little
            joy. That’s why we bring mobiles, watches, eyewear and accessories
            together in one place, with straightforward prices and personal
            service.
          </p>
          <Link href="/information" className="text-link">
            A little more about us <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
