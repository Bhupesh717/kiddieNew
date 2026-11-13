export type StoreProduct = {
  id: string
  slug: string
  name: string
  category: string
  categorySlug: string
  price: number
  compareAtPrice?: number
  image: string
  images?: string[]
  tag: string
  description: string
  longDescription?: string
  fabric: string
  stock: number
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
  { label: "Heritage Maroon Poshak", value: "/hero-ethnic-wear.png" },
  { label: "Teal Poshak & Kurti", value: "/products/teal-poshak.png" },
  { label: "Mustard Zari Suit", value: "/products/mustard-poshak.png" },
  { label: "Rose Silk Drape", value: "/products/rose-silk.png" },
  { label: "Kundan Rani Haar", value: "/products/kundan-haar.png" },
] as const

export const DEMO_PROMO_CODES: PromoCodeRule[] = [
  { code: "WELCOME10", type: "percentage", value: 10, label: "10% off welcome offer", active: true },
  { code: "FESTIVE25", type: "percentage", value: 25, label: "25% off festive edit", active: true },
  { code: "ATELIER500", type: "fixed", value: 500, label: "Rs. 500 off (expired)", active: false },
]

export const categories: StoreCategory[] = [
  { name: "Kurti Set", slug: "kurti-set", image: "/products/teal-poshak.png" },
  { name: "Pure Poshak", slug: "pure-poshak", image: "/hero-ethnic-wear.png" },
  { name: "Semi Pure Poshak", slug: "semi-pure-poshak", image: "/products/teal-poshak.png" },
  { name: "Stitched Poshaks", slug: "stitched-poshaks", image: "/products/mustard-poshak.png" },
  { name: "Regular Suit", slug: "regular-suit", image: "/products/mustard-poshak.png" },
  { name: "Fabric", slug: "fabric", image: "/products/rose-silk.png" },
  { name: "Accessories", slug: "accessories", image: "/products/kundan-haar.png" },
]

export const products: StoreProduct[] = [
  {
    id: "rg-001",
    slug: "gulab-khas-poshak",
    name: "Gulab Khas Poshak",
    category: "Pure Poshak",
    categorySlug: "pure-poshak",
    price: 8950,
    compareAtPrice: 10950,
    image: "/hero-ethnic-wear.png",
    tag: "Bestseller",
    description:
      "A celebration-ready poshak finished with delicate zari accents and considered traditional detailing.",
    longDescription: `<p>Crafted in collaboration with Jaipur karigars, the Gulab Khas Poshak drapes in a royal four-piece silhouette designed for wedding ceremonies and festive evenings.</p><ul><li><strong>Kurti &amp; Kanchali:</strong> 2.25 meters silk blend with hand embroidery</li><li><strong>Kalidar Ghagra:</strong> 4.00 meters with full flare lining support</li><li><strong>Odhni:</strong> 2.50 meters weighted with antique zari &amp; gota patti border</li><li><strong>Care:</strong> Dry clean only; store folded in breathable muslin</li></ul>`,
    fabric: "Silk blend with zari work",
    stock: 12,
  },
  {
    id: "rg-002",
    slug: "sunehri-zari-suit",
    name: "Sunehri Zari Suit",
    category: "Regular Suit",
    categorySlug: "regular-suit",
    price: 4250,
    image: "/products/mustard-poshak.png",
    tag: "New arrival",
    description:
      "A softly structured suit with warm gold embroidery for intimate celebrations and festive evenings.",
    longDescription: `<p>Hand-embroidered across sunlit cotton silk, this three-piece festive suit pairs breathable daytime comfort with ceremonial shine.</p><ul><li><strong>Kurta Fabric:</strong> 2.50 meters embroidered cotton silk</li><li><strong>Bottom / Salwar:</strong> 2.50 meters dyed silk blend</li><li><strong>Dupatta:</strong> 2.40 meters woven zari pallu border</li></ul>`,
    fabric: "Cotton silk",
    stock: 8,
  },
  {
    id: "rg-003",
    slug: "mogra-silk-saree",
    name: "Mogra Silk Saree",
    category: "Fabric",
    categorySlug: "fabric",
    price: 6800,
    image: "/products/rose-silk.png",
    tag: "Atelier pick",
    description:
      "A fluid silk drape with a fine woven border, made for heirloom moments and easy elegance.",
    longDescription: `<p>Woven from pure lustrous silk with traditional motifs inspired by palace archives.</p><ul><li><strong>Saree Length:</strong> 5.50 meters</li><li><strong>Blouse Piece (Unstitched):</strong> 0.90 meters included</li><li><strong>Border Finish:</strong> Woven antique gold zari pallu</li></ul>`,
    fabric: "Pure silk",
    stock: 5,
  },
  {
    id: "rg-004",
    slug: "kundan-rani-haar",
    name: "Kundan Rani Haar",
    category: "Accessories",
    categorySlug: "accessories",
    price: 2950,
    image: "/products/kundan-haar.png",
    tag: "Limited",
    description:
      "A statement-inspired finishing piece with the graceful spirit of Jaipur jewellery craft.",
    longDescription: `<p>Handcrafted Kundan-finish ceremonial necklace framed with ruby-toned beads and pearl drops.</p><ul><li><strong>Set Includes:</strong> Layered Rani Haar necklace with adjustable dori tassel</li><li><strong>Finish:</strong> Antique gold plating with glass kundan work</li><li><strong>Length:</strong> Adjustable up to 24 inches</li></ul>`,
    fabric: "Kundan finish",
    stock: 15,
  },
  {
    id: "rg-005",
    slug: "jaipur-rose-kurti",
    name: "Jaipur Rose Kurti Set",
    category: "Kurti Set",
    categorySlug: "kurti-set",
    price: 3750,
    image: "/products/teal-poshak.png",
    tag: "Bestseller",
    description:
      "A versatile Jaipur-inspired kurti set, easy to style from festive lunches to evening gatherings.",
    longDescription: `<p>Soft velvet-kissed silhouette finished with delicate gota trims across neckline, sleeves, and hem.</p><ul><li><strong>Kurti:</strong> 2.25 meters finished length with fine piping</li><li><strong>Bottom:</strong> 2.25 meters flared sharara/palazzo cut</li><li><strong>Dupatta:</strong> 2.25 meters sheer organza trim</li></ul>`,
    fabric: "Cotton blend",
    stock: 7,
  },
  {
    id: "rg-006",
    slug: "mehfil-banarsi-poshak",
    name: "Mehfil Banarasi Poshak",
    category: "Semi Pure Poshak",
    categorySlug: "semi-pure-poshak",
    price: 5900,
    image: "/products/teal-poshak.png",
    tag: "Hand-finished",
    description:
      "A rich occasion set combining a luminous Banarasi-inspired weave with fine hand-finished details.",
    longDescription: `<p>Balanced semi-pure weave designed for effortless comfort across long wedding functions.</p><ul><li><strong>Kurti &amp; Kanchali:</strong> 2.25 meters semi-pure Banarasi silk blend</li><li><strong>Ghagra:</strong> 4.00 meters pleated kalidar skirt</li><li><strong>Odhni:</strong> 2.50 meters hand-edged kiran border</li></ul>`,
    fabric: "Banarasi silk blend",
    stock: 4,
  },
  {
    id: "rg-007",
    slug: "mewar-stitched-poshak",
    name: "Mewar Stitched Poshak",
    category: "Stitched Poshaks",
    categorySlug: "stitched-poshaks",
    price: 7200,
    image: "/products/mustard-poshak.png",
    tag: "Made to wear",
    description:
      "A thoughtfully tailored heritage silhouette with a comfortable fit and artisanal finish.",
    longDescription: `<p>Tailored ready-to-wear Mewari poshak crafted for immediate celebratory dressing without additional stitching delays.</p><ul><li><strong>Included Pieces:</strong> Pre-stitched Kurti, Kanchali, Kalidar Ghagra &amp; Odhni</li><li><strong>Ghagra Gher:</strong> 4.00 meters full heritage flare</li><li><strong>Odhni Span:</strong> 2.50 meters embroidered border drape</li></ul>`,
    fabric: "Art silk",
    stock: 3,
  },
]

export function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-IN")}`
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
