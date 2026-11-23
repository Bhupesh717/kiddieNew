"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import { ProductCard } from "@/components/storefront/product-card";
import { useCart } from "@/components/storefront/cart-provider";
import { type StoreProduct } from "@/src/lib/store/catalog";
import { productApiService } from "@/src/lib/api/services/product-service";

function CollectionCatalog() {
  const searchParams = useSearchParams();
  const { isWishlisted, wishlistCount } = useCart();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categoryList, setCategoryList] = useState<
    Array<{ name: string; slug: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApiService
      .list()
      .then((live) => {
        setProducts(Array.isArray(live) ? live : []);
      })
      .catch((err) => {
        console.error("Failed to load collection products", err);
      })
      .finally(() => {
        setLoading(false);
      });

    fetch("/api/categories")
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.success && Array.isArray(payload.data)) {
          setCategoryList(payload.data);
        }
      })
      .catch(() => {});
  }, []);

  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "all";
  const initialSubCategory = searchParams.get("subcategory") ?? "all";
  const initialWishlist = searchParams.get("wishlist") === "1";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [subCategory, setSubCategory] = useState(initialSubCategory);
  const [onlyWishlist, setOnlyWishlist] = useState(initialWishlist);
  const [minimum, setMinimum] = useState(0);
  const [maximum, setMaximum] = useState(30000);
  const [sort, setSort] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "all");
    setSubCategory(searchParams.get("subcategory") ?? "all");
    setOnlyWishlist(searchParams.get("wishlist") === "1");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matching = products.filter((product) => {
      if (category !== "all" && product.categorySlug !== category) return false;
      if (subCategory !== "all" && product.subCategorySlug !== subCategory) return false;
      if (onlyWishlist && !isWishlisted(product.id)) return false;
      if (product.price < minimum || product.price > maximum) return false;
      if (!normalizedQuery) return true;
      const haystack =
        `${product.name} ${product.category} ${product.subCategory} ${product.fabric} ${product.description} ${product.tag}`.toLowerCase();
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
    subCategory,
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
    setSubCategory("all");
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
          className="inline-flex items-center gap-2 border border-input bg-white px-4 py-2.5 text-xs font-medium"
        >
          <SlidersHorizontal size={14} />
          {mobileFiltersOpen ? "Hide filters" : "Filter & refine"}
        </button>
        <span className="text-xs text-muted-foreground">{filtered.length} pieces</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside
          className={`${mobileFiltersOpen ? "block" : "hidden"} h-fit border border-border bg-white p-5 lg:block`}
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
              className="text-accent transition hover:opacity-75"
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
          <div className="mt-2 flex items-center gap-2 border border-input bg-popover px-3 py-2.5">
            <Search size={14} className="shrink-0 text-muted-foreground" />
            <input
              id="collection-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Shirts, polos, kurtis, dresses..."
              className="w-full bg-transparent text-sm text-foreground outline-none"
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
            className="mt-2 w-full border border-input bg-popover px-3 py-3 text-sm"
          >
            <option value="all">All categories</option>
            {categoryList.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>

          <label className="mt-6 flex cursor-pointer items-center justify-between border border-border bg-background px-3 py-2.5 text-xs">
            <span className="flex items-center gap-2">
              <Heart
                size={14}
                fill={onlyWishlist ? "currentColor" : "none"}
                color="currentColor"
              />
              Saved wishlist ({wishlistCount})
            </span>
            <input
              type="checkbox"
              checked={onlyWishlist}
              onChange={(event) => setOnlyWishlist(event.target.checked)}
              className="accent-accent"
            />
          </label>

          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">
              Price range
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs text-muted-foreground">
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
                  className="mt-1 w-full border border-input bg-popover px-2 py-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs text-muted-foreground">
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
                  className="mt-1 w-full border border-input bg-popover px-2 py-2 text-sm text-foreground"
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
              className="mt-4 w-full accent-accent"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Up to Rs. {maximum.toLocaleString("en-IN")}
            </p>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-primary">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "piece" : "pieces"}
            </p>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Sort
              <select
                className="border-0 bg-transparent py-1 text-xs text-primary"
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
          ) : loading ? (
            <div className="border border-dashed border-input bg-white px-6 py-16 text-center">
              <p className="font-serif text-2xl">
                Loading collection from atelier...
              </p>
            </div>
          ) : (
            <div className="border border-dashed border-input bg-white px-6 py-16 text-center">
              <p className="font-serif text-2xl">
                No pieces match these filters
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try clearing your search query, category, or price range.
              </p>
              <button
                type="button"
                onClick={resetAll}
                className="mt-5 border border-primary px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary"
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
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      {/* <section className="bg-secondary py-14 sm:py-20">
        <div className="container mx-auto px-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
            The complete edit
          </p>
          <h1 className="mt-4 font-serif text-5xl text-primary sm:text-6xl">
            The collection
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Discover occasion dressing shaped by hand, history and the warm spirit of Rajasthan.
          </p>
        </div>
      </section> */}
      <PageIntro
        eyebrow="Curated Catalog"
        title="KiddieQuick Collection"
        copy="Discover our signature range of smart apparel for Kids, Men, and Women, crafted with bio-washed, skin-friendly fabrics."
      />
      <Suspense
        fallback={
          <div className="container mx-auto px-6 py-16 text-center text-sm text-muted-foreground">
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
