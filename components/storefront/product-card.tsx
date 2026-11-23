"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice, type StoreProduct } from "@/src/lib/store/catalog";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { useCart } from "@/components/storefront/cart-provider";

export function ProductCard({ product }: { product: StoreProduct }) {
  const { addItem, openCart, isWishlisted, toggleWishlist } = useCart();
  const liked = isWishlisted(product.id);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : null;
  const outOfStock = product.stock <= 0;

  const gallery = Array.from(
    new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
  );
  const primaryImage = gallery[0] ?? product.image;
  const hoverImage = gallery[1] ?? null;

  const firstVariant = product.variants?.[0];
  const variantPrices =
    product.variants?.map((v) => v.price).filter(Boolean) ?? [];
  const minPrice =
    variantPrices.length > 0 ? Math.min(...variantPrices) : product.price;
  const maxPrice =
    variantPrices.length > 0 ? Math.max(...variantPrices) : product.price;
  const hasPriceRange = minPrice !== maxPrice;

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className={`relative block size-full ${
            hoverImage ? "[perspective:1200px]" : ""
          }`}
        >
          {hoverImage ? (
            <div className="relative size-full will-change-transform [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:rotateY(180deg)] motion-reduce:transition-none">
              <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]">
                <BlogCoverImage
                  src={primaryImage}
                  alt={product.name}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <BlogCoverImage
                  src={hoverImage}
                  alt={`${product.name} alternate view`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <BlogCoverImage
              src={primaryImage}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
          <span className="bg-popover/95 px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-foreground">
            {product.tag}
          </span>
          {discountPercent ? (
            <span className="bg-accent px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
              Save {discountPercent}%
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={`${liked ? "Remove" : "Add"} ${product.name} ${liked ? "from" : "to"} wishlist`}
          aria-pressed={liked}
          className="absolute right-3 top-3 z-10 rounded-full bg-popover/90 p-2 text-foreground transition hover:bg-white"
        >
          <Heart
            size={15}
            fill={liked ? "currentColor" : "none"}
            color="currentColor"
          />
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            if (firstVariant) {
              addItem(product.id, 1, {
                size: firstVariant.size,
                color: firstVariant.color,
                sku: firstVariant.sku,
                variantId: firstVariant.id,
                price: firstVariant.price,
                stock: firstVariant.stock,
              });
            } else {
              addItem(product.id, 1);
            }
            openCart();
          }}
          className="absolute inset-x-0 bottom-0 z-10 flex translate-y-0 items-center justify-center gap-2 bg-accent/95 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:bg-muted-foreground md:translate-y-full md:group-hover:translate-y-0 md:focus-visible:translate-y-0"
        >
          <ShoppingBag size={14} />
          {outOfStock ? "Sold out" : "Add to bag"}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          {product.category}
        </p>
        {product.stock > 0 && product.stock <= 4 && (
          <p className="text-[9px] font-medium text-accent">
            Only {product.stock} left
          </p>
        )}
      </div>
      <Link
        href={`/products/${product.slug}`}
        className="mt-1 block font-serif text-lg leading-tight transition hover:text-accent"
      >
        {product.name}
      </Link>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-sm font-semibold text-accent">
          {hasPriceRange
            ? `From ${formatPrice(minPrice)}`
            : formatPrice(minPrice)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > minPrice && (
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </div>
    </article>
  );
}
