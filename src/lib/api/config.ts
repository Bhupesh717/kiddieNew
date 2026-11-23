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
