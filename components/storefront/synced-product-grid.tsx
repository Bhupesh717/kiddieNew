"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { productApiService } from "@/src/lib/api/services/product-service";
import type { StoreProduct } from "@/src/lib/store/catalog";

export function SyncedProductGrid({
  fallbackProducts = [],
  categorySlug,
  limit,
  featured,
}: {
  fallbackProducts?: StoreProduct[];
  categorySlug?: string;
  limit?: number;
  featured?: boolean;
}) {
  const [items, setItems] = useState<StoreProduct[]>(() =>
    featured ? fallbackProducts.filter((p) => p.isFeatured || p.is_featured) : fallbackProducts,
  );
  const [loading, setLoading] = useState(fallbackProducts.length === 0);

  useEffect(() => {
    productApiService
      .list(categorySlug, limit, featured)
      .then((live) => {
        if (Array.isArray(live)) {
          setItems(live);
        }
      })
      .catch((err) => {
        console.error("Failed to load storefront products", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categorySlug, limit, featured]);

  if (loading && items.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground">
        Loading products from atelier...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground">
        No pieces currently available in this edit.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
