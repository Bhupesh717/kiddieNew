import { productSchema, categorySchema, type Product, type Category } from "../types/catalog"

export function adaptProduct(input: unknown): Product { return productSchema.parse(input) }
export function adaptCategory(input: unknown): Category { return categorySchema.parse(input) }
export function adaptProducts(input: unknown): Product[] { return Array.isArray(input) ? input.map(adaptProduct) : [] }
