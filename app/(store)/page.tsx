import Link from "next/link";
import { ArrowRight, Gem, ShieldCheck, Truck } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { CategorySlider } from "@/components/storefront/category-slider";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { ShowcaseVideo } from "@/components/storefront/showcase-video";
import { SyncedProductGrid } from "@/components/storefront/synced-product-grid";
import { getActiveBanners } from "@/src/lib/server/banner-store";
import { categories, products } from "@/src/lib/store/catalog";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const activeBanners = getActiveBanners();

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <div className="bg-[#39231e] px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#f5e5c9]">
        FREE SHIPPING ON DOMESTIC ORDERS ABOVE RS 2,000.
      </div>
      <SiteHeader />

      <HeroBanner banners={activeBanners} />

      <CategorySlider categories={categories} />

      <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#a44436]">
              Curated for you
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              The new season
            </h2>
          </div>
          <Link
            href="/collection"
            className="text-[10px] font-semibold uppercase tracking-[0.16em] underline underline-offset-4"
          >
            Shop all
          </Link>
        </div>
        <SyncedProductGrid fallbackProducts={products.slice(0, 4)} limit={4} />
      </section>
      {/* <ShowcaseVideo src="/majisa.mp4" /> */}
      <section className="border-t border-[#e8ded2] bg-[#fffdf9] py-10">
        <div className="container mx-auto grid gap-6 px-4 sm:grid-cols-3 sm:px-6">
          <div className="flex items-start gap-3">
            <Gem size={18} className="mt-0.5 shrink-0 text-[#a44436]" />
            <div>
              <h3 className="font-serif text-lg text-[#39231e]">
                Artisanal heritage
              </h3>
              <p className="mt-1 text-xs leading-6 text-[#77675d]">
                Crafted in collaboration with Jaipur karigars preserving
                traditional zari & gota techniques.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck size={18} className="mt-0.5 shrink-0 text-[#a44436]" />
            <div>
              <h3 className="font-serif text-lg text-[#39231e]">
                Thoughtful dispatch
              </h3>
              <p className="mt-1 text-xs leading-6 text-[#77675d]">
                Free shipping on domestic orders above Rs 2,000 within 2–4
                working days.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#a44436]" />
            <div>
              <h3 className="font-serif text-lg text-[#39231e]">
                Atelier care
              </h3>
              <p className="mt-1 text-xs leading-6 text-[#77675d]">
                Need sizing help or custom styling? Our Jaipur studio team is
                ready to assist.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#39231e] px-4 py-12 text-[#f8ede0] sm:px-6 sm:py-16">
        <div className="container mx-auto grid gap-7 md:grid-cols-[1fr_1.2fr] md:items-center">
          <p className="font-serif text-3xl leading-tight sm:text-4xl">
            “Clothing is not just what we wear. It is the story we choose to
            carry forward.”
          </p>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#d6af7a]">
              Our atelier
            </p>
            <p className="mt-3 max-w-lg text-sm leading-7 text-[#d9c7b5]">
              From a family workshop in Jaipur to wardrobes across the world,
              Majisavesh celebrates the patience of handwork and the poetry of
              Indian occasion dressing.
            </p>
            <Link
              href="/about"
              className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] underline underline-offset-4"
            >
              Discover our story <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
