import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { SyncedProductGrid } from "@/components/storefront/synced-product-grid";
import type { StoreCategory, StoreProduct } from "@/src/lib/store/catalog";

export const dynamic = "force-dynamic";

async function getLiveCategory(slug: string): Promise<StoreCategory | null> {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/categories/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      },
    );
    const payload = await res.json().catch(() => null);
    if (payload?.success && payload.data) {
      return payload.data;
    }
  } catch (e) {
    console.error("Failed to fetch category", e);
  }
  return null;
}

async function getCategoryProducts(slug: string): Promise<StoreProduct[]> {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/products?category=${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      },
    );
    const payload = await res.json().catch(() => null);
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data;
    }
  } catch (e) {
    console.error("Failed to fetch category products", e);
  }
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getLiveCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} · KiddieQuick`,
    description: `Explore KiddieQuick ${category.name} — smart kids wear, Indian ethnic suits, and modern western apparel.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getLiveCategory(slug);
  if (!category) notFound();
  const categoryProducts = await getCategoryProducts(slug);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        {category.image && (
          <BlogCoverImage
            src="/sub-header.png"
            alt={category.name}
            preload
            sizes="100vw"
            className="-z-10 object-cover opacity-30"
          />
        )}
        <div className="container mx-auto px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/90">
            Shop by category
          </p>
          <h1 className="mt-3 font-serif text-5xl sm:text-7xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-amber-200/90">
            Explore occasion pieces, selected for their intricate craft,
            considered fabrics and timeless Indian silhouettes.
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-6 flex gap-2 text-xs text-amber-200/90"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/collection" className="hover:text-white">
              Collection
            </Link>
            <span>/</span>
            <span>{category.name}</span>
          </nav>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
              The {category.name} edit
            </p>
            <h2 className="mt-1 font-serif text-3xl">Made to be remembered</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {categoryProducts.length}{" "}
            {categoryProducts.length === 1 ? "piece" : "pieces"}
          </span>
        </div>

        {categoryProducts.length ? (
          <SyncedProductGrid
            fallbackProducts={categoryProducts}
            categorySlug={slug}
          />
        ) : (
          <div className="py-16 text-center">
            <p className="font-serif text-2xl">This edit is being curated</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore the complete collection while we prepare this category.
            </p>
            <Link
              href="/collection"
              className="mt-5 inline-block border border-input px-5 py-3 text-[10px] uppercase tracking-wider"
            >
              Shop all pieces
            </Link>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
