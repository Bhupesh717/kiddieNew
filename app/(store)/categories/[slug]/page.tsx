import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteFooter, SiteHeader } from "@/components/site-shell"
import { SyncedProductGrid } from "@/components/storefront/synced-product-grid"
import { categories, getCategoryBySlug, products } from "@/src/lib/store/catalog"

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return { title: "Category not found" }
  return {
    title: category.name,
    description: `Explore Majisavesh ${category.name} — handcrafted Indian occasion dressing rooted in Jaipur.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()
  const categoryProducts = products.filter((item) => item.categorySlug === slug)

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <SiteHeader />
      <section className="relative isolate overflow-hidden bg-[#39231e] text-[#fff9f0]">
        <Image
          src={category.image}
          alt=""
          fill
          preload
          sizes="100vw"
          className="-z-10 object-cover opacity-30"
        />
        <div className="container mx-auto px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dfbd91]">
            Shop by category
          </p>
          <h1 className="mt-3 font-serif text-5xl sm:text-7xl">{category.name}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#e3d4c5]">
            Explore occasion pieces, selected for their intricate craft, considered fabrics and
            timeless Indian silhouettes.
          </p>
          <nav aria-label="Breadcrumb" className="mt-6 flex gap-2 text-xs text-[#e3d4c5]">
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
        <div className="mb-6 flex items-end justify-between border-b border-[#e8ded2] pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#a44436]">
              The {category.name} edit
            </p>
            <h2 className="mt-1 font-serif text-3xl">Made to be remembered</h2>
          </div>
          <span className="text-xs text-[#77675d]">
            {categoryProducts.length} {categoryProducts.length === 1 ? "piece" : "pieces"}
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
            <p className="mt-2 text-sm text-[#77675d]">
              Explore the complete collection while we prepare this category.
            </p>
            <Link
              href="/collection"
              className="mt-5 inline-block border border-[#bca999] px-5 py-3 text-[10px] uppercase tracking-wider"
            >
              Shop all pieces
            </Link>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}
