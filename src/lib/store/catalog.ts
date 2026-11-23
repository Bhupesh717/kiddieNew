export type ProductVariant = {
  id?: string
  sku?: string
  size: string
  color: string
  colorCode?: string
  price: number
  compareAtPrice?: number
  stock: number
  status?: string
}

export type StoreProduct = {
  id: string
  slug: string
  name: string
  category: string
  categorySlug: string
  subCategory?: string
  subCategorySlug?: string
  price: number
  compareAtPrice?: number
  currency?: string
  image: string
  images?: string[]
  tag: string
  description: string
  longDescription?: string
  fabric?: string
  stock: number
  variants?: ProductVariant[]
  colors?: string[]
  sizes?: string[]
  isFeatured?: boolean
  is_featured?: boolean
}

export type StoreCategory = {
  name: string
  slug: string
  image: string
}

export type PromoCodeRule = {
  code: string
  type: "percentage" | "fixed"
  value: number
  label: string
  active: boolean
}

export const FREE_SHIPPING_THRESHOLD = 2000
export const STANDARD_SHIPPING_FEE = 150

export const AVAILABLE_PRODUCT_IMAGES = [
  { label: "Boys T-Shirts", value: "https://ecom-backendnew.kiddiequick.in/category-images/1753650754_f824ace74015d7d1daffa8a650187476.jpg" },
  { label: "Girls Frocks & Dresses", value: "https://ecom-backendnew.kiddiequick.in/category-images/1753650743_kiddiquick6.jpg" },
  { label: "New Born Rompers", value: "https://ecom-backendnew.kiddiequick.in/category-images/1753650836_5791b6bfc3e3da0d6826bac66f837fa3.jpg" },
  { label: "Men Wear", value: "https://ecom-backendnew.kiddiequick.in/category-images/1759071445_1405dd66-a756-4cb9-8d93-07157709b41f1706782615754-Mast--Harbour-Men-Shirts-8221706782614906-1.jpeg" },
  { label: "Women Wear", value: "https://ecom-backendnew.kiddiequick.in/category-images/1759071469_KSR4sbqb_7d03bb1c6a5148d5aed27e9e05f7da1b.jpeg" },
  { label: "Fashion Accessories", value: "https://ecom-backendnew.kiddiequick.in/category-images/1760195567_3791878_89281.png" },
] as const

export const DEMO_PROMO_CODES: PromoCodeRule[] = []

export const categories: StoreCategory[] = []

export const products: StoreProduct[] = []

export function formatPrice(price: number) {
  return `Rs. ${Number(price || 0).toLocaleString("en-IN")}`
}

export function getProductBySlug(slug: string) {
  return products.find((item) => item.slug === slug)
}

export function getCategoryBySlug(slug: string) {
  return categories.find((item) => item.slug === slug)
}

export function getRelatedProducts(product: StoreProduct, limit = 4) {
  const sameCategory = products.filter(
    (item) => item.id !== product.id && item.categorySlug === product.categorySlug,
  )
  const others = products.filter(
    (item) => item.id !== product.id && item.categorySlug !== product.categorySlug,
  )
  return [...sameCategory, ...others].slice(0, limit)
}

export function computePromoDiscount(subtotal: number, rule: PromoCodeRule | null) {
  if (!rule || !rule.active || subtotal <= 0) return 0
  if (rule.type === "percentage") {
    return Math.round((subtotal * rule.value) / 100)
  }
  return Math.min(subtotal, rule.value)
}
