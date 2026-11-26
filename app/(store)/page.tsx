import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Gem,
  RotateCcw,
  ShieldCheck,
  Smile,
  Sparkles,
  Truck,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { CategorySlider } from "@/components/storefront/category-slider";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { SyncedProductGrid } from "@/components/storefront/synced-product-grid";
import spotlightKidsImg from "@/public/home/spotlight-kids.jpg";
import spotlightFamilyImg from "@/public/home/spotlight-family.jpg";
import homeIntroImg from "@/public/home/home-intro.png";
import fashionCtaImg from "@/public/sub-header.png";
import { ShoppableShowcase } from "@/components/storefront/shoppable-showcase";
import { CustomerReviews } from "@/components/storefront/customer-reviews";
import { getServerApiUrl } from "@/src/lib/api/config";

export const dynamic = "force-dynamic";

async function getLiveBanners() {
  try {
    const res = await fetch(getServerApiUrl("/api/banners"), {
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data;
    }
  } catch { }
  return [];
}

async function getLiveCategories() {
  try {
    const res = await fetch(getServerApiUrl("/api/categories"), {
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data;
    }
  } catch { }
  return [];
}

async function getLiveFeaturedProducts() {
  try {
    const res = await fetch(
      getServerApiUrl("/api/products?featured=1&limit=8"),
      {
        cache: "no-store",
      },
    );
    const payload = await res.json().catch(() => null);
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data.filter(
        (p: { isFeatured?: boolean; is_featured?: boolean }) =>
          Boolean(p.isFeatured ?? p.is_featured),
      );
    }
  } catch { }
  return [];
}

const WHY_CHOOSE_US = [
  {
    icon: Smile,
    title: "Skin-Friendly & Baby-Safe",
    description:
      "100% combed cottons, pure breathable linens, and certified non-toxic dyes gentle on sensitive skin.",
  },
  {
    icon: Sparkles,
    title: "All-Day Active Comfort",
    description:
      "Tagless neck labels, soft itch-free seams, and flexible stretch cuts designed for happy movement.",
  },
  {
    icon: Gem,
    title: "Curated Family Wardrobe",
    description:
      "One destination for smart kids wear, festive Indian kurtas & suits, and elevated western styles.",
  },
  {
    icon: ShieldCheck,
    title: "Tested Durability",
    description:
      "Double-needle reinforced seams and colorfast fabrics crafted to withstand active days and repeated washes.",
  },
  {
    icon: Truck,
    title: "Pan-India Express Dispatch",
    description:
      "Prompt delivery across 20,000+ pin codes in India with real-time tracking straight to your doorstep.",
  },
  {
    icon: RotateCcw,
    title: "Easy 7-Day Returns & Exchanges",
    description:
      "Hassle-free size exchanges and smooth returns backed by friendly customer support via WhatsApp & phone.",
  },
] as const;

export default async function HomePage() {
  const activeBanners = await getLiveBanners();
  const categoryList = await getLiveCategories();
  const featuredProducts = await getLiveFeaturedProducts();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <HeroBanner banners={activeBanners} />

      <CategorySlider categories={categoryList} />

      {/* Brand Intro Showcase Section (Left Content, Right Image) */}
      <section className="border-y border-border bg-popover/60 py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
                <Sparkles size={12} />
                Welcome to KiddieQuick
              </span>

              <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] text-primary">
                Everyday comfort. Festive grace.{" "}
                <span className="italic font-normal text-accent">
                  Made for the whole family.
                </span>
              </h2>

              <p className="mt-5 text-sm sm:text-base leading-relaxed text-muted-foreground">
                At KiddieQuick, we believe family dressing should feel joyful,
                effortless, and skin-friendly. From ultra-soft baba suits and
                playful twirl frocks for energetic little ones to crisp
                breathable linen shirts, polos, and elegant celebratory Indian
                kurtas &amp; suits — every piece is thoughtfully crafted to
                live, play, and celebrate in.
              </p>

              {/* 3 Value Badges */}
              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-border/80 pt-6 sm:grid-cols-3">
                <div className="flex items-start gap-2.5">
                  <Smile size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                      100% Skin-Safe
                    </h4>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      Combed organic cottons &amp; gentle non-toxic dyes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Gem size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Curated Fits
                    </h4>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      Kid-friendly stretch cuts &amp; flattering adult styles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Truck size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Pan-India Dispatch
                    </h4>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      20,000+ pin codes with easy 7-day exchanges.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-primary px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
                >
                  <span>Our Story</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/collection"
                  className="inline-flex items-center gap-2 border border-input bg-white px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition hover:border-accent hover:text-accent"
                >
                  <span>Explore Collection</span>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative border box behind */}
                <div
                  aria-hidden="true"
                  className="absolute -bottom-3 -right-3 size-full border-2 border-accent/30 bg-secondary/40 sm:-bottom-4 sm:-right-4"
                />

                <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-secondary shadow-md">
                  <Image
                    src={homeIntroImg}
                    alt="KiddieQuick modern family fashion collection"
                    fill
                    placeholder="blur"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center transition duration-700 hover:scale-105"
                  />
                </div>

                {/* Corner floating badge */}
                <div className="absolute -bottom-3 -left-3 rounded-lg border border-border bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm sm:-bottom-4 sm:-left-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-accent">
                    KiddieQuick Atelier
                  </p>
                  <p className="font-serif text-sm font-semibold text-primary">
                    Smart Living &amp; Dressing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
              Curated for you
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-primary">
              Featured Collections
            </h2>
          </div>
          <Link
            href="/collection"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent underline underline-offset-4"
          >
            Shop all
          </Link>
        </div>
        <SyncedProductGrid
          fallbackProducts={featuredProducts}
          limit={8}
          featured={true}
        />
      </section>
      {/* Shoppable Showcase Section */}
      <ShoppableShowcase />
      {/* Why Choose Us Section */}
      <section className="border-t border-border bg-stone-50/70 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
              The KiddieQuick Difference
            </p>
            <h2 className="mt-3 font-serif text-3xl text-primary sm:text-5xl">
              Why Choose KiddieQuick
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Thoughtfully crafted everyday &amp; festive wear for kids, men
              &amp; women — combining comfort, safety, and modern elegance.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE_US.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative flex flex-col justify-between border border-border bg-white p-7 transition duration-300 hover:border-accent hover:shadow-sm"
                >
                  <div>
                    <div className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent transition duration-300 group-hover:bg-accent group-hover:text-white">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-5 font-serif text-xl font-medium text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-xs leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent opacity-0 transition group-hover:opacity-100">
                    <span>Quality assured</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Side-by-Side Dual Spotlight Section */}
      <section className="container mx-auto px-4 py-8 sm:px-6 sm:py-14">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
            Curated Spotlights
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-primary">
            Made for Moments That Matter
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Spotlight 1: Smart Kids Collection */}
          <div className="group relative overflow-hidden border border-border bg-secondary shadow-sm">
            <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/11] md:aspect-[4/5]">
              <Image
                src={spotlightKidsImg}
                alt="KiddieQuick Smart Kids Collection"
                fill
                placeholder="blur"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                <span className="inline-block rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                  Playful &amp; Gentle
                </span>
                <h3 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl leading-tight text-white">
                  Smart Kids Collection
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-md">
                  Vibrant baba suits, playful party frocks, newborn organic
                  rompers, and everyday tees made with 100% kid-safe combed
                  cottons.
                </p>
                <div className="mt-5">
                  <Link
                    href="/collection"
                    className="inline-flex items-center gap-2 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition duration-300 hover:bg-accent hover:text-white"
                  >
                    <span>Shop Kids Wear</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Spotlight 2: Men & Women Festive & Casual */}
          <div className="group relative overflow-hidden border border-border bg-secondary shadow-sm">
            <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/11] md:aspect-[4/5]">
              <Image
                src={spotlightFamilyImg}
                alt="KiddieQuick Contemporary Men & Women Collection"
                fill
                placeholder="blur"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                <span className="inline-block rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                  Modern &amp; Festive
                </span>
                <h3 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl leading-tight text-white">
                  Men &amp; Women Essentials
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-md">
                  Breathable linen shirts, premium pique polos, flowing dresses,
                  and handcrafted festive Indian kurtas &amp; suit sets.
                </p>
                <div className="mt-5">
                  <Link
                    href="/collection"
                    className="inline-flex items-center gap-2 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition duration-300 hover:bg-accent hover:text-white"
                  >
                    <span>Shop Men &amp; Women</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Testimonials Slider */}
      <CustomerReviews />

      {/* Brand Story Callout with Fashion CTA Background */}
      <section className="relative overflow-hidden border-t border-border py-10 text-white">
        <Image
          src={fashionCtaImg}
          alt="KiddieQuick Fashion Lifestyle"
          fill
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60 sm:bg-black/55 backdrop-blur-[1px]" />

        <div className="relative container mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-semibold">
            Founded in 2025 · KiddieQuick
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            Smart, Vibrant Fashion for Little Ones &amp; Families
          </h2>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-stone-200">
            From softest newborn rompers to festive frocks, casual tees, and
            stylish men &amp; women apparel, KiddieQuick brings you joyful,
            skin-safe clothing everyday.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/collection"
              className="bg-amber-300 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-900 transition hover:bg-amber-200 shadow-md"
            >
              Explore All Collections
            </Link>
            <Link
              href="/about"
              className="border border-white/60 bg-white/10 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition hover:bg-white hover:text-stone-900"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
