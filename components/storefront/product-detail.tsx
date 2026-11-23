"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
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
import { productApiService } from "@/src/lib/api/services/product-service";

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

  // Variant selector state
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    if (initialProduct.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants[0].color;
    }
    return initialProduct.colors?.[0] ?? "Standard";
  });

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    if (initialProduct.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants[0].size;
    }
    return initialProduct.sizes?.[0] ?? "Standard";
  });

  const gallery = Array.from(
    new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
  );
  const [activeImage, setActiveImage] = useState(gallery[0] ?? product.image);
  const { addItem, openCart, isWishlisted, toggleWishlist } = useCart();

  useEffect(() => {
    setProduct(initialProduct);
    setActiveImage(initialProduct.image);
    setRelatedProducts(getRelatedProducts(initialProduct, 4));

    if (initialProduct.variants && initialProduct.variants.length > 0) {
      setSelectedColor(initialProduct.variants[0].color);
      setSelectedSize(initialProduct.variants[0].size);
    }

    productApiService
      .bySlug(initialProduct.slug)
      .then((live) => {
        if (live) {
          setProduct(live);
          if (live.image) setActiveImage(live.image);
          if (live.variants && live.variants.length > 0) {
            setSelectedColor(live.variants[0].color);
            setSelectedSize(live.variants[0].size);
          }
        }
      })
      .catch(() => {});

    productApiService
      .list(initialProduct.categorySlug, 4)
      .then((rel) => {
        if (Array.isArray(rel) && rel.length > 0) {
          setRelatedProducts(
            rel.filter((item) => item.id !== initialProduct.id),
          );
        }
      })
      .catch(() => {});
  }, [initialProduct]);

  // Extract distinct colors and sizes
  const availableColors = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      const set = new Set<string>();
      product.variants.forEach((v) => {
        if (v.color) set.add(v.color);
      });
      return Array.from(set);
    }
    return product.colors && product.colors.length > 0
      ? product.colors
      : ["Standard"];
  }, [product.variants, product.colors]);

  const availableSizes = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      const set = new Set<string>();
      product.variants.forEach((v) => {
        if (v.size) set.add(v.size);
      });
      return Array.from(set);
    }
    return product.sizes && product.sizes.length > 0
      ? product.sizes
      : ["Standard"];
  }, [product.variants, product.sizes]);

  // Match the active variant
  const activeVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    const exact = product.variants.find(
      (v) =>
        v.color.toLowerCase() === selectedColor.toLowerCase() &&
        v.size.toLowerCase() === selectedSize.toLowerCase(),
    );
    if (exact) return exact;
    const sameColor = product.variants.find(
      (v) => v.color.toLowerCase() === selectedColor.toLowerCase(),
    );
    if (sameColor) return sameColor;
    return product.variants[0];
  }, [product.variants, selectedColor, selectedSize]);

  // Real-time dynamic price, compare price, and stock
  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentCompareAt =
    activeVariant?.compareAtPrice ?? product.compareAtPrice;
  const currentStock = activeVariant ? activeVariant.stock : product.stock;
  const currentSku = activeVariant?.sku;
  const isOutOfStock = currentStock <= 0;

  // Clamped quantity
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    }
  }, [currentStock, quantity]);

  const liked = isWishlisted(product.id);
  const discountPercent =
    currentCompareAt && currentCompareAt > currentPrice
      ? Math.round(((currentCompareAt - currentPrice) / currentCompareAt) * 100)
      : null;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // If the currently selected size is not available for this color, switch to the first size available
    if (product.variants && product.variants.length > 0) {
      const variantWithSameSize = product.variants.find(
        (v) =>
          v.color.toLowerCase() === color.toLowerCase() &&
          v.size.toLowerCase() === selectedSize.toLowerCase(),
      );
      if (!variantWithSameSize) {
        const firstInColor = product.variants.find(
          (v) => v.color.toLowerCase() === color.toLowerCase(),
        );
        if (firstInColor) setSelectedSize(firstInColor.size);
      }
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product.id, quantity, {
      size: selectedSize,
      color: selectedColor,
      sku: currentSku,
      variantId: activeVariant?.id,
      price: currentPrice,
      stock: currentStock,
    });
    openCart();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const directBuyItem = {
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      sku: currentSku,
      variantId: activeVariant?.id,
      price: currentPrice,
      quantity,
      selected: true,
      lineKey: `${product.id}::${selectedColor || "standard"}::${selectedSize || "standard"}`,
      product,
      unitPrice: currentPrice,
    };
    try {
      window.sessionStorage.setItem(
        "kiddiequick_buynow_item",
        JSON.stringify(directBuyItem),
      );
    } catch {
      // ignore
    }
    router.push("/checkout?buyNow=1");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="container mx-auto px-4 py-6 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/collection" className="hover:text-primary">
            Collection
          </Link>
          <span>/</span>
          <Link
            href={`/categories/${product.categorySlug}`}
            className="hover:text-primary"
          >
            {product.category}
          </Link>
          {product.subCategory && (
            <>
              <span>/</span>
              <Link
                href={`/collection?subcategory=${product.subCategorySlug}`}
                className="hover:text-primary"
              >
                {product.subCategory}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="font-medium text-primary">{product.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* Product Media Gallery */}
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-secondary shadow-sm">
              <BlogCoverImage
                src={activeImage}
                alt={product.name}
                preload
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {product.tag && (
                <span className="absolute left-4 top-4 rounded bg-popover/95 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-accent shadow-sm backdrop-blur-sm">
                  {product.tag}
                </span>
              )}
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
                      className={`relative aspect-[3/4] overflow-hidden rounded border bg-secondary transition ${
                        selected
                          ? "border-accent ring-2 ring-accent"
                          : "border-border opacity-80 hover:opacity-100"
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

          {/* Product Details & Variant Purchasing Box */}
          <div className="py-2 md:py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/categories/${product.categorySlug}`}
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent"
              >
                {product.category}
              </Link>
              {product.subCategory && (
                <>
                  <span className="text-muted-foreground/60">·</span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                    {product.subCategory}
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-2.5 font-serif text-3xl font-medium leading-tight sm:text-4xl text-primary">
              {product.name}
            </h1>

            {/* Dynamic Price Display */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="font-sans text-3xl font-semibold text-accent">
                {formatPrice(currentPrice)}
              </span>
              {currentCompareAt && currentCompareAt > currentPrice && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(currentCompareAt)}
                  </span>
                  {discountPercent && (
                    <span className="rounded bg-accent/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent">
                      {discountPercent}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Inclusive of all taxes · Free delivery on orders over Rs. 2,000
            </p>

            <div className="my-5 border-t border-border" />

            {/* Dynamic Variant Selector: Color */}
            {availableColors.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1.5">
                    Color:{" "}
                    {activeVariant?.colorCode && (
                      <span
                        className="inline-block size-3 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: activeVariant.colorCode }}
                      />
                    )}
                    <span className="font-normal text-accent">
                      {selectedColor}
                    </span>
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {availableColors.map((color) => {
                    const isSelected =
                      selectedColor.toLowerCase() === color.toLowerCase();
                    const colorVariant = product.variants?.find(
                      (v) =>
                        v.color.toLowerCase() === color.toLowerCase() &&
                        v.colorCode,
                    );
                    const colorCode = colorVariant?.colorCode;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorSelect(color)}
                        className={`group relative flex items-center gap-2 rounded-md border px-3.5 py-2 text-xs font-medium transition ${
                          isSelected
                            ? "border-accent bg-accent/10 text-accent shadow-sm"
                            : "border-input bg-white text-muted-foreground hover:border-accent"
                        }`}
                      >
                        {colorCode && (
                          <span
                            className="inline-block size-3.5 rounded-full border border-black/20 shrink-0 shadow-xs"
                            style={{ backgroundColor: colorCode }}
                          />
                        )}
                        <span>{color}</span>
                        {isSelected && <Check size={13} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Variant Selector: Size */}
            {availableSizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">
                    Size:{" "}
                    <span className="font-normal text-accent">
                      {selectedSize}
                    </span>
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const isSelected =
                      selectedSize.toLowerCase() === size.toLowerCase();
                    // Check stock for this specific size in current color
                    const sizeVariant = product.variants?.find(
                      (v) =>
                        v.color.toLowerCase() === selectedColor.toLowerCase() &&
                        v.size.toLowerCase() === size.toLowerCase(),
                    );
                    const sizeOutOfStock =
                      sizeVariant && sizeVariant.stock <= 0;

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={sizeOutOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-12 rounded-md border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                          isSelected
                            ? "border-accent bg-accent text-white shadow-sm"
                            : sizeOutOfStock
                              ? "cursor-not-allowed border-border bg-secondary text-muted-foreground/60 line-through"
                              : "border-input bg-white text-primary hover:border-accent"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Real-time Inventory Status */}
            <div className="mb-6 flex items-center gap-2 rounded-md border border-border bg-background p-3 text-xs">
              <span
                className={`size-2.5 rounded-full ${
                  isOutOfStock
                    ? "bg-accent"
                    : currentStock <= 5
                      ? "bg-amber-500"
                      : "bg-success"
                }`}
              />
              <span className="font-medium text-primary">
                {isOutOfStock
                  ? "Currently Out of Stock"
                  : currentStock <= 5
                    ? `Hurry, only ${currentStock} left in stock!`
                    : `In Stock (${currentStock} available)`}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Quantity
              </p>
              <div className="inline-flex items-center rounded border border-input bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                  className="p-3 text-primary transition hover:bg-background disabled:opacity-40"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-10 text-center text-sm font-semibold text-primary">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.min(currentStock, value + 1))
                  }
                  disabled={quantity >= currentStock || isOutOfStock}
                  aria-label="Increase quantity"
                  className="p-3 text-primary transition hover:bg-background disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2.5 rounded-md bg-accent px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={16} />
                {isOutOfStock ? "Out of Stock" : "Add to Shopping Bag"}
              </button>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex flex-1 items-center justify-center rounded-md border border-accent bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
                aria-pressed={liked}
                className="inline-flex items-center justify-center rounded-md border border-input bg-white px-4 py-4 transition hover:border-accent"
              >
                <Heart
                  size={18}
                  fill={liked ? "currentColor" : "none"}
                  color="currentColor"
                />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-y border-border py-4 text-[11px] text-muted-foreground">
              <p className="flex items-start gap-2">
                <Truck size={16} className="shrink-0 text-accent" />
                Free shipping across India on orders above Rs. 2,000
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck size={16} className="shrink-0 text-accent" />
                100% Genuine KiddieQuick Brand Quality Guaranteed
              </p>
            </div>

            <details className="mt-5 border-t border-border pt-4" open>
              <summary className="cursor-pointer text-xs font-semibold text-primary">
                Product Description &amp; Care
              </summary>
              <div className="mt-3">
                {product.longDescription ? (
                  <BlogRichContent
                    html={normalizeRichContentInput(product.longDescription)}
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm leading-7 text-muted-foreground">
                    {product.description}
                  </p>
                )}
              </div>
            </details>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                  More To Explore
                </p>
                <h2 className="font-serif text-2xl text-primary">
                  Similar in {product.category}
                </h2>
              </div>
              <Link
                href={`/categories/${product.categorySlug}`}
                className="text-xs font-medium text-accent hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
