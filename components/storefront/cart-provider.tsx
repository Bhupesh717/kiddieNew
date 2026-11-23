"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  FREE_SHIPPING_THRESHOLD,
  formatPrice,
  type StoreProduct,
} from "@/src/lib/store/catalog";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";

const CART_STORAGE_KEY = "kiddiequick_store_cart_v2";
const WISHLIST_STORAGE_KEY = "kiddiequick_store_wishlist_v2";

export type CartVariantInfo = {
  size: string;
  color?: string;
  sku?: string;
  variantId?: string;
  price?: number;
  stock?: number;
};

export type CartLine = {
  productId: string;
  size: string;
  color?: string;
  sku?: string;
  variantId?: string;
  price?: number;
  quantity: number;
  selected: boolean;
};

export type CartItem = CartLine & {
  lineKey: string;
  product: StoreProduct;
  unitPrice: number;
};

type CartContextValue = {
  lines: CartLine[];
  items: CartItem[];
  count: number;
  selectedTotal: number;
  wishlist: string[];
  wishlistCount: number;
  isHydrated: boolean;
  addItem: (
    productId: string,
    quantity?: number,
    variantOrSize?: string | CartVariantInfo,
  ) => void;
  setQuantity: (
    productId: string,
    size: string,
    quantity: number,
    color?: string,
  ) => void;
  removeItem: (productId: string, size: string, color?: string) => void;
  toggleSelected: (productId: string, size: string, color?: string) => void;
  toggleAllSelected: (selected: boolean) => void;
  clearSelectedItems: () => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function getCartLineKey(
  productId: string,
  size: string,
  color?: string,
) {
  return `${productId}::${color || "standard"}::${size || "standard"}`;
}

const DEFAULT_LINE_VARIANT = "standard";

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside StorefrontProvider");
  return value;
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [catalogProducts, setCatalogProducts] = useState<StoreProduct[]>([]);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((payload) => {
        const liveProducts: StoreProduct[] =
          payload?.success && Array.isArray(payload.data) ? payload.data : [];
        setCatalogProducts(liveProducts);

        try {
          const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
          if (savedCart) {
            const parsed = JSON.parse(savedCart) as unknown;
            if (Array.isArray(parsed)) {
              const validLines = parsed.flatMap((entry): CartLine[] => {
                if (!entry || typeof entry !== "object") return [];
                const record = entry as Partial<CartLine>;
                if (
                  typeof record.productId !== "string" &&
                  typeof (record as any).productId !== "number"
                )
                  return [];
                const pid = String(record.productId);
                const product = liveProducts.find(
                  (item) => String(item.id) === pid,
                );
                if (!product || product.stock <= 0) return [];
                const size =
                  typeof record.size === "string" && record.size.length > 0
                    ? record.size
                    : DEFAULT_LINE_VARIANT;
                const color =
                  typeof record.color === "string" ? record.color : undefined;
                const quantity =
                  typeof record.quantity === "number" &&
                  Number.isFinite(record.quantity)
                    ? Math.max(
                        1,
                        Math.min(Math.floor(record.quantity), product.stock),
                      )
                    : 1;
                return [
                  {
                    productId: pid,
                    size,
                    color,
                    sku: record.sku,
                    variantId: record.variantId,
                    price:
                      typeof record.price === "number"
                        ? record.price
                        : product.price,
                    quantity,
                    selected: record.selected !== false,
                  },
                ];
              });
              setLines(validLines);
            }
          }
          const savedWishlist =
            window.localStorage.getItem(WISHLIST_STORAGE_KEY);
          if (savedWishlist) {
            const parsed = JSON.parse(savedWishlist) as unknown;
            if (Array.isArray(parsed)) {
              setWishlist(
                parsed.filter(
                  (id): id is string =>
                    typeof id === "string" &&
                    liveProducts.some((item) => String(item.id) === id),
                ),
              );
            }
          }
        } catch {
          // Ignore malformed storage entries
        } finally {
          setIsHydrated(true);
        }
      })
      .catch(() => {
        setIsHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ignore storage quota errors
    }
  }, [lines, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlist),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlist, isHydrated]);

  const items = useMemo<CartItem[]>(
    () =>
      lines.flatMap((line) => {
        const product = catalogProducts.find(
          (item) => item.id === line.productId,
        );
        if (!product) return [];
        const unitPrice =
          typeof line.price === "number" && line.price > 0
            ? line.price
            : product.price;
        return [
          {
            ...line,
            lineKey: getCartLineKey(line.productId, line.size, line.color),
            product,
            unitPrice,
          },
        ];
      }),
    [lines, catalogProducts],
  );

  const addItem = useCallback(
    (
      productId: string,
      quantity = 1,
      variantOrSize?: string | CartVariantInfo,
    ) => {
      const product = catalogProducts.find((item) => item.id === productId);
      if (!product || product.stock <= 0) return;

      let size = DEFAULT_LINE_VARIANT;
      let color: string | undefined = undefined;
      let sku: string | undefined = undefined;
      let variantId: string | undefined = undefined;
      let price = product.price;
      let maxStock = product.stock;

      if (typeof variantOrSize === "string") {
        size = variantOrSize || DEFAULT_LINE_VARIANT;
      } else if (variantOrSize && typeof variantOrSize === "object") {
        size = variantOrSize.size || DEFAULT_LINE_VARIANT;
        color = variantOrSize.color;
        sku = variantOrSize.sku;
        variantId = variantOrSize.variantId;
        if (typeof variantOrSize.price === "number") {
          price = variantOrSize.price;
        }
        if (typeof variantOrSize.stock === "number") {
          maxStock = variantOrSize.stock;
        }
      }

      setLines((current) => {
        const existing = current.find(
          (line) =>
            line.productId === productId &&
            line.size === size &&
            line.color === color,
        );
        if (existing) {
          return current.map((line) =>
            line.productId === productId &&
            line.size === size &&
            line.color === color
              ? {
                  ...line,
                  quantity: Math.min(line.quantity + quantity, maxStock),
                }
              : line,
          );
        }
        return [
          ...current,
          {
            productId,
            size,
            color,
            sku,
            variantId,
            price,
            quantity: Math.max(1, Math.min(quantity, maxStock)),
            selected: true,
          },
        ];
      });
    },
    [catalogProducts],
  );

  const setQuantity = useCallback(
    (productId: string, size: string, quantity: number, color?: string) => {
      const product = catalogProducts.find((item) => item.id === productId);
      const maxStock = product?.stock ?? 99;
      setLines((current) =>
        current.map((line) =>
          line.productId === productId &&
          line.size === size &&
          line.color === color
            ? { ...line, quantity: Math.max(1, Math.min(quantity, maxStock)) }
            : line,
        ),
      );
    },
    [catalogProducts],
  );

  const removeItem = useCallback(
    (productId: string, size: string, color?: string) => {
      setLines((current) =>
        current.filter(
          (line) =>
            !(
              line.productId === productId &&
              line.size === size &&
              line.color === color
            ),
        ),
      );
    },
    [],
  );

  const toggleSelected = useCallback(
    (productId: string, size: string, color?: string) => {
      setLines((current) =>
        current.map((line) =>
          line.productId === productId &&
          line.size === size &&
          line.color === color
            ? { ...line, selected: !line.selected }
            : line,
        ),
      );
    },
    [],
  );

  const toggleAllSelected = useCallback((selected: boolean) => {
    setLines((current) => current.map((line) => ({ ...line, selected })));
  }, []);

  const clearSelectedItems = useCallback(() => {
    setLines((current) => current.filter((line) => !line.selected));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value: CartContextValue = {
    lines,
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    selectedTotal: items.reduce(
      (sum, item) => sum + (item.selected ? item.unitPrice * item.quantity : 0),
      0,
    ),
    wishlist,
    wishlistCount: wishlist.length,
    isHydrated,
    addItem,
    setQuantity,
    removeItem,
    toggleSelected,
    toggleAllSelected,
    clearSelectedItems,
    clearCart,
    toggleWishlist,
    isWishlisted,
    openCart,
    closeCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer open={isOpen} />
    </CartContext.Provider>
  );
}

function CartDrawer({ open }: { open: boolean }) {
  const {
    items,
    selectedTotal,
    setQuantity,
    removeItem,
    toggleSelected,
    closeCart,
  } = useCart();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeCart]);

  if (!open) return null;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - selectedTotal);
  const hasSelected = items.some((item) => item.selected);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]"
      onClick={closeCart}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-popover shadow-2xl sm:max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-5">
          <h2
            id="cart-title"
            className="font-serif text-xl uppercase tracking-wide text-primary"
          >
            Your Shopping Bag
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-2 transition hover:bg-secondary"
          >
            <X size={18} />
          </button>
        </header>
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs font-medium text-success">
            {remaining === 0
              ? "Free shipping on orders above Rs. 2,000 unlocked!"
              : `Add ${formatPrice(remaining)} more for free domestic shipping.`}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-success transition-all duration-300"
              style={{
                width: `${Math.min(100, (selectedTotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
              }}
            />
          </div>
        </div>
        {items.length ? (
          <div className="flex-1 overflow-y-auto px-5">
            {items.map(
              ({
                lineKey,
                product,
                size,
                color,
                sku,
                unitPrice,
                quantity,
                selected,
              }) => (
                <article
                  key={lineKey}
                  className="flex gap-3 border-b border-border py-5"
                >
                  <input
                    type="checkbox"
                    aria-label={`Select ${product.name}`}
                    checked={selected}
                    onChange={() => toggleSelected(product.id, size, color)}
                    className="mt-2 accent-accent"
                  />
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={closeCart}
                    className="relative size-20 shrink-0 overflow-hidden bg-secondary"
                  >
                    <BlogCoverImage
                      src={product.image}
                      alt={product.name}
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={closeCart}
                          className="font-serif text-base leading-tight hover:text-accent"
                        >
                          {product.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                          {color && (
                            <span className="rounded bg-secondary px-1.5 py-0.5 font-medium text-primary">
                              {color}
                            </span>
                          )}
                          {size && size !== DEFAULT_LINE_VARIANT && (
                            <span className="rounded border border-input px-1.5 py-0.5 font-medium">
                              Size: {size}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${product.name}`}
                        onClick={() => removeItem(product.id, size, color)}
                        className="p-1 text-accent transition hover:opacity-75"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label={`Decrease ${product.name} quantity`}
                          onClick={() =>
                            setQuantity(product.id, size, quantity - 1, color)
                          }
                          disabled={quantity <= 1}
                          className="p-1.5 disabled:opacity-40"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="min-w-8 text-center text-xs font-medium">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${product.name} quantity`}
                          onClick={() =>
                            setQuantity(product.id, size, quantity + 1, color)
                          }
                          disabled={quantity >= product.stock}
                          className="p-1.5 disabled:opacity-40"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-accent">
                        {formatPrice(unitPrice * quantity)}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="text-muted-foreground" size={32} />
            <h3 className="mt-4 font-serif text-xl">Your bag is empty</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore smart collections for Kids, Men, and Women.
            </p>
            <Link
              href="/collection"
              onClick={closeCart}
              className="mt-5 bg-primary px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-primary/90"
            >
              Explore Collection
            </Link>
          </div>
        )}
        <footer className="border-t border-border bg-background p-5">
          <div className="flex justify-between text-sm">
            <span>Selected subtotal</span>
            <strong>{formatPrice(selectedTotal)}</strong>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Shipping &amp; promo codes calculated at checkout.
          </p>
          {hasSelected ? (
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-4 block w-full bg-accent py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent/90"
            >
              Proceed to checkout
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 block w-full cursor-not-allowed bg-muted py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
            >
              Proceed to checkout
            </button>
          )}
          <button
            type="button"
            onClick={closeCart}
            className="mt-3 w-full py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition hover:text-primary"
          >
            Continue shopping
          </button>
        </footer>
      </aside>
    </div>
  );
}
