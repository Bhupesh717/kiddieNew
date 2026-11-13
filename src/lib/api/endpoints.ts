export const endpoints = {
  products: {
    list: "/products",
    bySlug: (slug: string) => `/products/${encodeURIComponent(slug)}`,
    reviews: (slug: string) => `/products/${encodeURIComponent(slug)}/reviews`,
  },
  categories: { list: "/categories", bySlug: (slug: string) => `/categories/${encodeURIComponent(slug)}` },
  search: { products: "/search/products", suggestions: "/search/suggestions" },
  cart: { current: "/cart", items: "/cart/items" },
  wishlist: { current: "/wishlist", toggle: "/wishlist/items" },
  orders: { list: "/orders", byId: (id: string) => `/orders/${encodeURIComponent(id)}`, track: "/orders/track" },
  auth: { login: "/auth/login", register: "/auth/register", otp: "/auth/otp", logout: "/auth/logout", session: "/auth/session" },
  users: { profile: "/users/me", addresses: "/users/me/addresses" },
  coupons: { validate: "/coupons/validate" },
  shipping: { pincode: (pincode: string) => `/shipping/pincode/${encodeURIComponent(pincode)}` },
  blog: { list: "/blog", bySlug: (slug: string) => `/blog/${encodeURIComponent(slug)}` },
  content: { home: "/content/home", page: (slug: string) => `/content/pages/${encodeURIComponent(slug)}` },
  admin: { dashboard: "/admin/dashboard", products: "/admin/products", orders: "/admin/orders", customers: "/admin/customers" },
} as const
