import { apiRequest } from "../http-client"
import { endpoints } from "../endpoints"
import { adaptCategory, adaptProduct, adaptProducts } from "../adapters/catalog"
import type { Category, Product, ProductListQuery } from "../types/catalog"

const defaultProductQuery: ProductListQuery = { page: 1, limit: 24, sort: "relevance" }

export const productService = {
  async list(query: ProductListQuery = defaultProductQuery) { const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)])); return adaptProducts(await apiRequest<unknown>(`${endpoints.products.list}?${params}`)) },
  async bySlug(slug: string) { return adaptProduct(await apiRequest<unknown>(endpoints.products.bySlug(slug), { next: { revalidate: 300, tags: [`product:${slug}`, "products"] } })) },
}
export const categoryService = {
  async list() { const data = await apiRequest<unknown>(endpoints.categories.list, { next: { revalidate: 3600, tags: ["categories"] } }); return Array.isArray(data) ? data.map(adaptCategory) : [] as Category[] },
  async bySlug(slug: string) { return adaptCategory(await apiRequest<unknown>(endpoints.categories.bySlug(slug), { next: { revalidate: 300, tags: ["categories", `category:${slug}`] } })) },
}
