import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3000/api/mock/v1"),
})

const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
})

export const apiConfig = {
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, ""),
  timeoutMs: 10_000,
  retries: 2,
  mockLatencyMs: Number(process.env.NEXT_PUBLIC_MOCK_LATENCY_MS ?? 400),
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
