"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  formatPrice,
} from "@/src/lib/store/catalog";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { useCart } from "@/components/storefront/cart-provider";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

export function CartPage() {
  const {
    items,
    selectedTotal,
    setQuantity,
    removeItem,
    toggleSelected,
    toggleAllSelected,
  } = useCart();

  const selectedItems = items.filter((item) => item.selected);
  const selectedCount = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const shippingFee =
    selectedTotal === 0 || selectedTotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING_FEE;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="container mx-auto px-4 py-9 sm:px-6 sm:py-14">
        <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
          Your edit
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-4xl sm:text-5xl">Shopping cart</h1>
          {items.length > 0 && (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => toggleAllSelected(event.target.checked)}
                className="accent-accent"
              />
              Select all ({items.length})
            </label>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {items.length ? (
            <div className="border-y border-border">
              {items.map(({ lineKey, product, size, quantity, selected }) => (
                <article
                  key={lineKey}
                  className="grid grid-cols-[22px_82px_1fr] gap-3 border-b border-border py-4 last:border-b-0 sm:grid-cols-[22px_112px_1fr_auto] sm:gap-5"
                >
                  <input
                    type="checkbox"
                    aria-label={`Select ${product.name} for checkout`}
                    checked={selected}
                    onChange={() => toggleSelected(product.id, size)}
                    className="mt-3 accent-accent"
                  />
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative aspect-[3/4] w-full overflow-hidden bg-secondary"
                  >
                    <BlogCoverImage
                      src={product.image}
                      alt={product.name}
                      sizes="112px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0 py-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-serif text-lg leading-tight hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {product.category} · {product.fabric}
                    </p>
                    <p className="mt-2 text-sm">{formatPrice(product.price)}</p>
                    <div className="mt-3 flex w-fit items-center border border-input bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(product.id, size, quantity - 1)
                        }
                        disabled={quantity <= 1}
                        aria-label={`Decrease ${product.name} quantity`}
                        className="p-2 disabled:opacity-40"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="min-w-8 text-center text-xs">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(product.id, size, quantity + 1)
                        }
                        aria-label={`Increase ${product.name} quantity`}
                        disabled={quantity >= product.stock}
                        className="p-2 disabled:opacity-40"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="col-start-3 flex items-center justify-between sm:col-start-4 sm:flex-col sm:items-end sm:justify-between sm:py-1">
                    <strong className="text-sm">
                      {formatPrice(product.price * quantity)}
                    </strong>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id, size)}
                      aria-label={`Delete ${product.name} from cart`}
                      className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-accent hover:opacity-75"
                    >
                      <Trash2 size={14} />
                      <span className="sm:hidden">Remove</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border-y border-border py-16 text-center">
              <ShoppingBag className="mx-auto text-muted-foreground" size={30} />
              <h2 className="mt-4 font-serif text-2xl">
                Your cart is still empty
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The perfect piece for your next celebration is waiting.
              </p>
              <Link
                href="/collection"
                className="mt-5 inline-block bg-primary px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-white"
              >
                Explore collection
              </Link>
            </div>
          )}

          <aside className="h-fit border border-border bg-white p-5">
            <h2 className="font-serif text-xl">Order summary</h2>
            <div className="mt-5 flex justify-between text-sm">
              <span>Selected items</span>
              <span>{selectedCount}</span>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span>Subtotal</span>
              <strong>{formatPrice(selectedTotal)}</strong>
            </div>
            <div className="mt-3 flex justify-between text-sm text-muted-foreground">
              <span>Shipping</span>
              <span>
                {selectedTotal === 0
                  ? "—"
                  : shippingFee === 0
                    ? "Free"
                    : formatPrice(shippingFee)}
              </span>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm">
              <span className="font-semibold">Estimated total</span>
              <strong>{formatPrice(selectedTotal + shippingFee)}</strong>
            </div>
            <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
              Free shipping on domestic orders above Rs 2,000.
            </p>
            {selectedItems.length > 0 ? (
              <Link
                href="/checkout"
                className="mt-5 block bg-primary py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
              >
                Proceed to checkout
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-5 block w-full cursor-not-allowed bg-muted py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
              >
                Proceed to checkout
              </button>
            )}
            <Link
              href="/collection"
              className="mt-3 block border border-input py-3 text-center text-[10px] uppercase tracking-wider transition hover:border-primary"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
