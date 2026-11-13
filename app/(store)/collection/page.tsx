"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import { ProductCard } from "@/components/storefront/product-card";
import { useCart } from "@/components/storefront/cart-provider";
import {
  categories,
  products as catalogProducts,
  type StoreProduct,
} from "@/src/lib/store/catalog";

const ADMIN_PRODUCTS_STORAGE_KEY = "majisavesh_admin_products_v1";

function CollectionCatalog() {
  const searchParams = useSearchParams();
  const { isWishlisted, wishlistCount } = useCart();
  const [products, setProducts] = useState<StoreProduct[]>(catalogProducts);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed as StoreProduct[]);
        }
      }
    } catch {
      // Ignore malformed storage
    }
  }, []);

  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "all";
  const initialWishlist = searchParams.get("wishlist") === "1";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [onlyWishlist, setOnlyWishlist] = useState(initialWishlist);
  const [minimum, setMinimum] = useState(0);
  const [maximum, setMaximum] = useState(30000);
  const [sort, setSort] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "all");
    setOnlyWishlist(searchParams.get("wishlist") === "1");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matching = products.filter((product) => {
      if (category !== "all" && product.categorySlug !== category) return false;
      if (onlyWishlist && !isWishlisted(product.id)) return false;
      if (product.price < minimum || product.price > maximum) return false;
      if (!normalizedQuery) return true;
      const haystack =
        `${product.name} ${product.category} ${product.fabric} ${product.description} ${product.tag}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
    if (sort === "price-low")
      return [...matching].sort((a, b) => a.price - b.price);
    if (sort === "price-high")
      return [...matching].sort((a, b) => b.price - a.price);
    if (sort === "name-asc")
      return [...matching].sort((a, b) => a.name.localeCompare(b.name));
    return matching;
  }, [
    products,
    category,
    onlyWishlist,
    isWishlisted,
    minimum,
    maximum,
    query,
    sort,
  ]);

  function resetAll() {
    setQuery("");
    setCategory("all");
    setOnlyWishlist(false);
    setMinimum(0);
    setMaximum(30000);
    setSort("featured");
  }

  return (
    <section className="container mx-auto px-4 py-9 sm:px-6 lg:py-14">
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((open) => !open)}
          className="inline-flex items-center gap-2 border border-[#ded3c7] bg-white px-4 py-2.5 text-xs font-medium"
        >
          <SlidersHorizontal size={14} />
          {mobileFiltersOpen ? "Hide filters" : "Filter & refine"}
        </button>
        <span className="text-xs text-[#77675d]">{filtered.length} pieces</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside
          className={`${mobileFiltersOpen ? "block" : "hidden"} h-fit border border-[#e8ded2] bg-white p-5 lg:block`}
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl">
              <SlidersHorizontal size={17} /> Refine your edit
            </h2>
            <button
              type="button"
              onClick={resetAll}
              aria-label="Clear all filters"
              title="Reset filters"
              className="text-[#8d3428] transition hover:opacity-75"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          <label
            className="mt-6 block text-[10px] font-semibold uppercase tracking-[0.16em]"
            htmlFor="collection-search"
          >
            Search
          </label>
          <div className="mt-2 flex items-center gap-2 border border-[#ded3c7] bg-[#fffdf9] px-3 py-2.5">
            <Search size={14} className="shrink-0 text-[#8b796b]" />
            <input
              id="collection-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Silk, poshak, kundan..."
              className="w-full bg-transparent text-sm text-[#33251f] outline-none"
            />
          </div>

          <label
            className="mt-6 block text-[10px] font-semibold uppercase tracking-[0.16em]"
            htmlFor="category-filter"
          >
            Category
          </label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 w-full border border-[#ded3c7] bg-[#fffdf9] px-3 py-3 text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>

          <label className="mt-6 flex cursor-pointer items-center justify-between border border-[#e8ded2] bg-[#fbf8f3] px-3 py-2.5 text-xs">
            <span className="flex items-center gap-2">
              <Heart
                size={14}
                fill={onlyWishlist ? "#a44436" : "none"}
                color={onlyWishlist ? "#a44436" : "currentColor"}
              />
              Saved wishlist ({wishlistCount})
            </span>
            <input
              type="checkbox"
              checked={onlyWishlist}
              onChange={(event) => setOnlyWishlist(event.target.checked)}
              className="accent-[#8d3428]"
            />
          </label>

          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">
              Price range
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs text-[#77675d]">
                From
                <input
                  type="number"
                  min={0}
                  max={maximum}
                  value={minimum}
                  onChange={(event) => {
                    const next = Math.max(0, Number(event.target.value) || 0);
                    setMinimum(Math.min(next, maximum));
                  }}
                  className="mt-1 w-full border border-[#ded3c7] bg-[#fffdf9] px-2 py-2 text-sm text-[#33251f]"
                />
              </label>
              <label className="text-xs text-[#77675d]">
                To
                <input
                  type="number"
                  min={minimum}
                  max={50000}
                  value={maximum}
                  onChange={(event) => {
                    const next = Math.max(
                      minimum,
                      Number(event.target.value) || minimum,
                    );
                    setMaximum(Math.min(50000, next));
                  }}
                  className="mt-1 w-full border border-[#ded3c7] bg-[#fffdf9] px-2 py-2 text-sm text-[#33251f]"
                />
              </label>
            </div>
            <input
              aria-label="Maximum price"
              type="range"
              min={Math.max(minimum, 1000)}
              max={30000}
              step={500}
              value={Math.min(
                30000,
                Math.max(maximum, Math.max(minimum, 1000)),
              )}
              onChange={(event) => setMaximum(Number(event.target.value))}
              className="mt-4 w-full accent-[#8d3428]"
            />
            <p className="mt-1 text-xs text-[#77675d]">
              Up to Rs. {maximum.toLocaleString("en-IN")}
            </p>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between border-b border-[#e8ded2] pb-4">
            <p className="text-xs text-[#77675d]">
              Showing{" "}
              <span className="font-semibold text-[#39231e]">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "piece" : "pieces"}
            </p>
            <label className="flex items-center gap-2 text-xs text-[#77675d]">
              Sort
              <select
                className="border-0 bg-transparent py-1 text-xs text-[#39231e]"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </label>
          </div>

          {filtered.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 sm:gap-x-5 md:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#d8cabc] bg-white px-6 py-16 text-center">
              <p className="font-serif text-2xl">
                No pieces match these filters
              </p>
              <p className="mt-2 text-sm text-[#77675d]">
                Try clearing your search query, category, or price range.
              </p>
              <button
                type="button"
                onClick={resetAll}
                className="mt-5 border border-[#39231e] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#39231e]"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function CollectionPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <SiteHeader />
      {/* <section className="bg-[#f3ece2] py-14 sm:py-20">
        <div className="container mx-auto px-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a44436]">
            The complete edit
          </p>
          <h1 className="mt-4 font-serif text-5xl text-[#39231e] sm:text-6xl">
            The collection
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#77675d]">
            Discover occasion dressing shaped by hand, history and the warm spirit of Rajasthan.
          </p>
        </div>
      </section> */}
      <PageIntro
        eyebrow="The complete edit"
        title=" The collection"
        copy=" Discover occasion dressing shaped by hand, history and the warm spirit of Rajasthan."
      />
      <Suspense
        fallback={
          <div className="container mx-auto px-6 py-16 text-center text-sm text-[#77675d]">
            Loading collection...
          </div>
        }
      >
        <CollectionCatalog />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
