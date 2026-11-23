import { getAuthHeaders } from "@/src/lib/api/auth-token";
import type { ApiEnvelope } from "@/src/lib/api/types/common";
import type { ProductVariant, StoreProduct } from "@/src/lib/store/catalog";

async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    const errorMsg =
      payload?.error?.message ??
      (response.status === 401
        ? "Unauthorized: Please log in as an administrator"
        : response.status === 403
        ? "Forbidden: Administrator privileges required"
        : "Failed to communicate with product server");
    throw new Error(errorMsg);
  }
  return payload.data;
}

export type ProductInput = {
  name: string;
  categorySlug: string;
  subCategorySlug?: string;
  subCategoryName?: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  fabric?: string;
  tag?: string;
  image?: string;
  images?: string[];
  description?: string;
  longDescription?: string;
  variants?: ProductVariant[];
  status?: string;
  isFeatured?: boolean;
  is_featured?: boolean;
};

export const productApiService = {
  /**
   * Public Storefront Product List
   */
  async list(
    categorySlug?: string,
    limit?: number,
    featured?: boolean,
  ): Promise<StoreProduct[]> {
    const params = new URLSearchParams();
    if (categorySlug && categorySlug !== "all") params.set("category", categorySlug);
    if (limit) params.set("limit", String(limit));
    if (featured !== undefined) params.set("featured", featured ? "1" : "0");
    const url = `/api/products${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, { cache: "no-store" });
    return parseEnvelope<StoreProduct[]>(response);
  },

  /**
   * Public Storefront Single Product
   */
  async bySlug(slug: string): Promise<StoreProduct> {
    const response = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    return parseEnvelope<StoreProduct>(response);
  },

  /**
   * Admin: List all products (requires Sanctum Bearer token)
   */
  async adminList(): Promise<StoreProduct[]> {
    const response = await fetch("/api/admin/products", {
      headers: getAuthHeaders(false),
      cache: "no-store",
    });
    return parseEnvelope<StoreProduct[]>(response);
  },

  /**
   * Admin: Create product (requires Sanctum Bearer token)
   */
  async create(input: ProductInput): Promise<StoreProduct> {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(input),
    });
    return parseEnvelope<StoreProduct>(response);
  },

  /**
   * Admin: Update product (requires Sanctum Bearer token)
   */
  async update(id: string, patch: Partial<ProductInput>): Promise<StoreProduct> {
    const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(patch),
    });
    return parseEnvelope<StoreProduct>(response);
  },

  /**
   * Admin: Delete product (requires Sanctum Bearer token)
   */
  async remove(id: string): Promise<StoreProduct> {
    const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });
    return parseEnvelope<StoreProduct>(response);
  },

  /**
   * Admin: Upload product image (requires Sanctum Bearer token)
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const headers = getAuthHeaders(false) as Record<string, string>;
    delete headers["Content-Type"];

    const response = await fetch("/api/admin/products/upload", {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await parseEnvelope<{ url: string }>(response);
    return data.url;
  },
};

