import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().default(""),
})

const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
})

export const apiConfig = {
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL ? env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "") : "/api",
  timeoutMs: 10_000,
  retries: 2,
} as const

export const apiTags = {
  products: "products",
  categories: "categories",
  blog: "blog",
  content: "content",
  cart: "cart",
  wishlist: "wishlist",
  orders: "orders",
  customers: "customers",
} as const

/**
 * Returns the resolved API URL for server-side fetches.
 * - On production: uses INTERNAL_API_URL, BACKEND_URL, or NEXT_PUBLIC_API_BASE_URL
 * - On local: seamlessly falls back to http://127.0.0.1:8000 (or NEXT_PUBLIC_API_BASE_URL if set in .env.local)
 */
export function getServerApiUrl(endpoint: string): string {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const backendUrl =
    process.env.INTERNAL_API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL;

  if (backendUrl) {
    const trimmed = backendUrl.replace(/\/+$/, "");
    if (path.startsWith("/api")) {
      return `${trimmed}${path}`;
    }
    return `${trimmed}/api${path}`;
  }

  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    const trimmed = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");
    if (path.startsWith("/api")) {
      const sub = path.replace(/^\/api/, "");
      return `${trimmed}${sub}`;
    }
    return `${trimmed}${path}`;
  }

  // Local fallback (works automatically without any env configuration)
  return path.startsWith("/api")
    ? `http://127.0.0.1:8000${path}`
    : `http://127.0.0.1:8000/api${path}`;
}

