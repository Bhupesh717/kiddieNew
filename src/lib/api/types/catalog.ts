import { z } from "zod"

export const productSchema = z.object({
  id: z.string(), slug: z.string(), name: z.string(), description: z.string().optional(), price: z.number().nonnegative(), compareAtPrice: z.number().nonnegative().optional(), currency: z.string().default("INR"), images: z.array(z.string()), categorySlug: z.string(), fabric: z.string().optional(), colors: z.array(z.string()).default([]), sizes: z.array(z.string()).default([]), stock: z.number().int().nonnegative(), occasion: z.array(z.string()).default([]), rating: z.number().min(0).max(5).optional(), reviewCount: z.number().int().nonnegative().optional(), available: z.boolean().default(true),
})
const categoryNodeSchema = z.object({ id: z.string(), slug: z.string(), name: z.string(), image: z.string().optional(), parentSlug: z.string().nullable().optional(), productCount: z.number().int().nonnegative().optional() })
export const categorySchema = categoryNodeSchema.extend({ children: z.array(categoryNodeSchema).default([]) })
export const productListQuerySchema = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(24), search: z.string().optional(), category: z.string().optional(), minPrice: z.coerce.number().nonnegative().optional(), maxPrice: z.coerce.number().nonnegative().optional(), sort: z.enum(["relevance", "price-asc", "price-desc", "newest"]).default("relevance") })
export type Product = z.infer<typeof productSchema>
export type Category = z.infer<typeof categorySchema>
export type ProductListQuery = z.infer<typeof productListQuerySchema>
