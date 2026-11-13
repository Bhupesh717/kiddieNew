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
  products as defaultCatalogProducts,
  type StoreProduct,
} from "@/src/lib/store/catalog";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";

const CART_STORAGE_KEY = "majisavesh_store_cart_v1";
const WISHLIST_STORAGE_KEY = "majisavesh_store_wishlist_v1";
const ADMIN_PRODUCTS_STORAGE_KEY = "majisavesh_admin_products_v1";

export type CartLine = {
  productId: string;
  size: string;
  quantity: number;
  selected: boolean;
};

export type CartItem = CartLine & {
  lineKey: string;
  product: StoreProduct;
};

type CartContextValue = {
  lines: CartLine[];
  items: CartItem[];
  count: number;
  selectedTotal: number;
  wishlist: string[];
  wishlistCount: number;
  isHydrated: boolean;
  addItem: (productId: string, quantity?: number, size?: string) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  toggleSelected: (productId: string, size: string) => void;
  toggleAllSelected: (selected: boolean) => void;
  clearSelectedItems: () => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function getCartLineKey(productId: string, size: string) {
  return `${productId}::${size}`;
}

const DEFAULT_LINE_VARIANT = "standard";

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside StorefrontProvider");
  return value;
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [catalogProducts, setCatalogProducts] = useState<StoreProduct[]>(
    defaultCatalogProducts,
  );
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let activeCatalog = defaultCatalogProducts;
    try {
      const savedProducts = window.localStorage.getItem(
        ADMIN_PRODUCTS_STORAGE_KEY,
      );
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts) as unknown;
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          activeCatalog = parsedProducts as StoreProduct[];
          setCatalogProducts(activeCatalog);
        }
      }

      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as unknown;
        if (Array.isArray(parsed)) {
          const validLines = parsed.flatMap((entry): CartLine[] => {
            if (!entry || typeof entry !== "object") return [];
            const record = entry as Partial<CartLine>;
            if (typeof record.productId !== "string") return [];
            const product = activeCatalog.find(
              (item) => item.id === record.productId,
            );
            if (!product || product.stock <= 0) return [];
            const size =
              typeof record.size === "string" && record.size.length > 0
                ? record.size
                : DEFAULT_LINE_VARIANT;
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
                productId: record.productId,
                size,
                quantity,
                selected: record.selected !== false,
              },
            ];
          });
          setLines(validLines);
        }
      }
      const savedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist) as unknown;
        if (Array.isArray(parsed)) {
          setWishlist(
            parsed.filter(
              (id): id is string =>
                typeof id === "string" &&
                activeCatalog.some((item) => item.id === id),
            ),
          );
        }
      }
    } catch {
      // Ignore malformed storage entries
    } finally {
      setIsHydrated(true);
    }
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
        return [
          {
            ...line,
            lineKey: getCartLineKey(line.productId, line.size),
            product,
          },
        ];
      }),
    [lines, catalogProducts],
  );

  const addItem = useCallback(
    (productId: string, quantity = 1, size?: string) => {
      const product = catalogProducts.find((item) => item.id === productId);
      if (!product || product.stock <= 0) return;
      const resolvedSize = size || DEFAULT_LINE_VARIANT;
      const maxStock = product.stock;
      setLines((current) => {
        const existing = current.find(
          (line) => line.productId === productId && line.size === resolvedSize,
        );
        if (existing) {
          return current.map((line) =>
            line.productId === productId && line.size === resolvedSize
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
            size: resolvedSize,
            quantity: Math.max(1, Math.min(quantity, maxStock)),
            selected: true,
          },
        ];
      });
    },
    [catalogProducts],
  );

  const setQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      const maxStock =
        catalogProducts.find((item) => item.id === productId)?.stock ?? 99;
      setLines((current) =>
        current.map((line) =>
          line.productId === productId && line.size === size
            ? { ...line, quantity: Math.max(1, Math.min(quantity, maxStock)) }
            : line,
        ),
      );
    },
    [catalogProducts],
  );

  const removeItem = useCallback((productId: string, size: string) => {
    setLines((current) =>
      current.filter(
        (line) => !(line.productId === productId && line.size === size),
      ),
    );
  }, []);

  const toggleSelected = useCallback((productId: string, size: string) => {
    setLines((current) =>
      current.map((line) =>
        line.productId === productId && line.size === size
          ? { ...line, selected: !line.selected }
          : line,
      ),
    );
  }, []);

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
      (sum, item) =>
        sum + (item.selected ? item.product.price * item.quantity : 0),
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
      className="fixed inset-0 z-50 bg-[#201915]/45 backdrop-blur-[1px]"
      onClick={closeCart}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-[#fffdf9] shadow-2xl sm:max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[#e8ded2] px-5 py-5">
          <h2
            id="cart-title"
            className="font-serif text-xl uppercase tracking-wide"
          >
            Your shopping bag
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-2 transition hover:bg-[#f3ece2]"
          >
            <X size={18} />
          </button>
        </header>
        <div className="border-b border-[#e8ded2] px-5 py-4">
          <p className="text-xs font-medium text-[#138452]">
            {remaining === 0
              ? "Free shipping on domestic orders above Rs 2,000."
              : `Add ${formatPrice(remaining)} more for free shipping on domestic orders.`}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9e4dc]">
            <div
              className="h-full rounded-full bg-[#15945f] transition-all duration-300"
              style={{
                width: `${Math.min(100, (selectedTotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
              }}
            />
          </div>
        </div>
        {items.length ? (
          <div className="flex-1 overflow-y-auto px-5">
            {items.map(({ lineKey, product, size, quantity, selected }) => (
              <article
                key={lineKey}
                className="flex gap-3 border-b border-[#e8ded2] py-5"
              >
                <input
                  type="checkbox"
                  aria-label={`Select ${product.name}`}
                  checked={selected}
                  onChange={() => toggleSelected(product.id, size)}
                  className="mt-2 accent-[#8d3428]"
                />
                <Link
                  href={`/products/${product.slug}`}
                  onClick={closeCart}
                  className="relative size-20 shrink-0 overflow-hidden bg-[#f1e8dd]"
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
                        className="font-serif text-base leading-tight hover:text-[#8d3428]"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-[#8b796b]">
                        {product.category} · {product.fabric}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${product.name}`}
                      onClick={() => removeItem(product.id, size)}
                      className="p-1 text-[#a44436] transition hover:opacity-75"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-[#e8ded2]">
                      <button
                        type="button"
                        aria-label={`Decrease ${product.name} quantity`}
                        onClick={() =>
                          setQuantity(product.id, size, quantity - 1)
                        }
                        disabled={quantity <= 1}
                        className="p-1.5 disabled:opacity-40"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="min-w-8 text-center text-xs">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${product.name} quantity`}
                        onClick={() =>
                          setQuantity(product.id, size, quantity + 1)
                        }
                        disabled={quantity >= product.stock}
                        className="p-1.5 disabled:opacity-40"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="text-[#a48668]" size={30} />
            <h3 className="mt-4 font-serif text-xl">Your bag is waiting</h3>
            <p className="mt-2 text-sm text-[#77675d]">
              Find something beautiful for your next celebration.
            </p>
            <Link
              href="/collection"
              onClick={closeCart}
              className="mt-5 bg-[#39231e] px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition hover:bg-[#52342c]"
            >
              Explore collection
            </Link>
          </div>
        )}
        <footer className="border-t border-[#e8ded2] bg-[#fbf8f3] p-5">
          <div className="flex justify-between text-sm">
            <span>Selected subtotal</span>
            <strong>{formatPrice(selectedTotal)}</strong>
          </div>
          <p className="mt-1 text-[10px] text-[#8b796b]">
            Shipping and promo codes calculated at checkout.
          </p>
          {hasSelected ? (
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-4 block w-full bg-[#39231e] py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#52342c]"
            >
              Proceed to checkout
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 block w-full cursor-not-allowed bg-[#b4aaa1] py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
            >
              Proceed to checkout
            </button>
          )}
          <Link
            href="/cart"
            onClick={closeCart}
            className="mt-3 block w-full border border-[#cbbcae] py-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] transition hover:border-[#39231e]"
          >
            View cart
          </Link>
          <button
            type="button"
            onClick={closeCart}
            className="mt-3 w-full py-2 text-[10px] uppercase tracking-[0.16em] text-[#75675d] transition hover:text-[#39231e]"
          >
            Continue shopping
          </button>
        </footer>
      </aside>
    </div>
  );
}
