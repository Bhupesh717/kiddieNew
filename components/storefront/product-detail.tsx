"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import {
  formatPrice,
  getRelatedProducts,
  type StoreProduct,
} from "@/src/lib/store/catalog";
import { normalizeRichContentInput } from "@/src/lib/store/blog";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { BlogRichContent } from "@/components/storefront/blog-rich-content";
import { useCart } from "@/components/storefront/cart-provider";
import { ProductCard } from "@/components/storefront/product-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

const ADMIN_PRODUCTS_STORAGE_KEY = "majisavesh_admin_products_v1";

export function ProductDetail({
  product: initialProduct,
}: {
  product: StoreProduct;
}) {
  const router = useRouter();
  const [product, setProduct] = useState<StoreProduct>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>(() =>
    getRelatedProducts(initialProduct, 4),
  );
  const [quantity, setQuantity] = useState(1);
  const gallery = Array.from(
    new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
  );
  const [activeImage, setActiveImage] = useState(gallery[0] ?? product.image);
  const { addItem, openCart, isWishlisted, toggleWishlist } = useCart();

  useEffect(() => {
    setProduct(initialProduct);
    setActiveImage(initialProduct.image);
    setRelatedProducts(getRelatedProducts(initialProduct, 4));
    try {
      const saved = window.localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StoreProduct[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const matched = parsed.find(
            (item) =>
              item.id === initialProduct.id ||
              item.slug === initialProduct.slug,
          );
          if (matched) {
            setProduct(matched);
            setActiveImage(matched.image);
          }
          const sourceProduct = matched ?? initialProduct;
          const sameCategory = parsed.filter(
            (item) =>
              item.id !== sourceProduct.id &&
              item.categorySlug === sourceProduct.categorySlug,
          );
          const others = parsed.filter(
            (item) =>
              item.id !== sourceProduct.id &&
              item.categorySlug !== sourceProduct.categorySlug,
          );
          setRelatedProducts([...sameCategory, ...others].slice(0, 4));
        }
      }
    } catch {
      // Ignore malformed cache
    }
  }, [initialProduct]);

  const liked = isWishlisted(product.id);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : null;

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <SiteHeader />
      <div className="container mx-auto px-4 py-6 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-[#8b796b]"
        >
          <Link href="/" className="hover:text-[#39231e]">
            Home
          </Link>
          <span>/</span>
          <Link href="/collection" className="hover:text-[#39231e]">
            Collection
          </Link>
          <span>/</span>
          <Link
            href={`/categories/${product.categorySlug}`}
            className="hover:text-[#39231e]"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#39231e]">{product.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-[#eee4d8]">
              <BlogCoverImage
                src={activeImage}
                alt={product.name}
                preload
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <span className="absolute left-4 top-4 bg-[#fffdf9] px-3 py-1.5 text-[9px] uppercase tracking-wider">
                {product.tag}
              </span>
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2.5">
                {gallery.map((imgUrl, idx) => {
                  const selected = activeImage === imgUrl;
                  return (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      aria-label={`View image ${idx + 1} of ${product.name}`}
                      className={`relative aspect-[3/4] overflow-hidden border bg-[#eee4d8] transition ${
                        selected
                          ? "border-[#8d3428] ring-1 ring-[#8d3428]"
                          : "border-[#e8ded2] opacity-80 hover:opacity-100"
                      }`}
                    >
                      <BlogCoverImage
                        src={imgUrl}
                        alt={`${product.name} view ${idx + 1}`}
                        sizes="120px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="py-2 md:py-6">
            <Link
              href={`/categories/${product.categorySlug}`}
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a44436]"
            >
              {product.category}
            </Link>
            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#77675d]">
              {product.description}
            </p>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="font-sans text-2xl font-medium">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <>
                    <span className="text-sm text-[#9b8d80] line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    {discountPercent && (
                      <span className="bg-[#f3ece2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#a44436]">
                        {discountPercent}% off
                      </span>
                    )}
                  </>
                )}
            </div>
            <p className="mt-1 text-[10px] text-[#8b796b]">
              Inclusive of all taxes
            </p>

            <div className="my-6 border-t border-[#e8ded2]" />

            <div className="space-y-3 text-xs">
              <p className="flex gap-3">
                <span className="w-24 text-[#8b796b]">Fabric</span>
                <span>{product.fabric}</span>
              </p>
              <p className="flex gap-3">
                <span className="w-24 text-[#8b796b]">Availability</span>
                <span
                  className={`font-medium ${
                    product.stock > 0 ? "text-[#168252]" : "text-[#a44436]"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
                </span>
              </p>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                Quantity
              </p>
              <div className="inline-flex items-center border border-[#d8cabc] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-3 disabled:opacity-40"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-10 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.min(product.stock, value + 1))
                  }
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                  className="p-3 disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!product.stock}
                onClick={() => {
                  addItem(product.id, quantity);
                  openCart();
                }}
                className="flex flex-1 items-center justify-center gap-3 bg-[#39231e] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#52342c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={16} /> Add to bag
              </button>
              <button
                type="button"
                disabled={!product.stock}
                onClick={() => {
                  addItem(product.id, quantity);
                  router.push("/checkout");
                }}
                className="border border-[#39231e] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39231e] transition hover:bg-[#f3ece2] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy now
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
                aria-pressed={liked}
                className="inline-flex items-center justify-center border border-[#d8cabc] bg-white px-4 py-4 transition hover:border-[#8d3428]"
              >
                <Heart
                  size={17}
                  fill={liked ? "#a44436" : "none"}
                  color={liked ? "#a44436" : "currentColor"}
                />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-y border-[#e8ded2] py-4 text-[10px] text-[#77675d]">
              <p className="flex items-start gap-2">
                <Truck size={15} className="shrink-0 text-[#8d3428]" /> Free
                shipping on domestic orders above Rs 2,000
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck size={15} className="shrink-0 text-[#8d3428]" />{" "}
                Carefully packed by our atelier
              </p>
            </div>

            <details className="border-b border-[#e8ded2] py-4" open>
              <summary className="cursor-pointer text-xs font-semibold">
                Product details
              </summary>
              <div className="mt-3">
                {product.longDescription ? (
                  <BlogRichContent
                    html={normalizeRichContentInput(product.longDescription)}
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm leading-7 text-[#77675d]">
                    {product.description} Designed with care in Jaipur. Due to
                    the handcrafted nature of our pieces, small variations make
                    every item unique.
                  </p>
                )}
              </div>
            </details>
            <details className="border-b border-[#e8ded2] py-4">
              <summary className="cursor-pointer text-xs font-semibold">
                Shipping & care
              </summary>
              <p className="mt-3 text-sm leading-7 text-[#77675d]">
                Orders are carefully packed and dispatched within 2–4 working
                days. Keep your handcrafted piece in a cool, dry place and
                follow the garment care label.
              </p>
            </details>

            <Link
              href="/collection"
              className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#8d3428] hover:underline"
            >
              <ArrowLeft size={14} /> Continue exploring
            </Link>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-[#e8ded2] pt-12">
            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#a44436]">
                  Pairs beautifully with
                </p>
                <h2 className="mt-2 font-serif text-3xl">You may also love</h2>
              </div>
              <Link
                href="/collection"
                className="text-[10px] font-semibold uppercase tracking-[0.16em] underline underline-offset-4"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
