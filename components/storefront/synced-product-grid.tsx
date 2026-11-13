"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import type { StoreProduct } from "@/src/lib/store/catalog";

const ADMIN_PRODUCTS_STORAGE_KEY = "majisavesh_admin_products_v1";

export function SyncedProductGrid({
  fallbackProducts,
  categorySlug,
  limit,
}: {
  fallbackProducts: StoreProduct[];
  categorySlug?: string;
  limit?: number;
}) {
  const [items, setItems] = useState<StoreProduct[]>(fallbackProducts);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as unknown;
      if (!Array.isArray(parsed) || parsed.length === 0) return;

      const typed = parsed as StoreProduct[];
      const scoped = categorySlug
        ? typed.filter((product) => product.categorySlug === categorySlug)
        : typed;
      setItems(typeof limit === "number" ? scoped.slice(0, limit) : scoped);
    } catch {
      // Ignore malformed cache
    }
  }, [categorySlug, limit]);

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

