import type { Metadata } from "next"
import { CartPage } from "@/components/storefront/cart-page"

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your selected Majisavesh pieces before checkout.",
}

export default function ShoppingCartRoute() {
  return <CartPage />
}
