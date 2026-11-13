import type { ReactNode } from "react"
import { StorefrontProvider } from "@/components/storefront/cart-provider"

export default function StoreLayout({ children }: { children: ReactNode }) {
  return <StorefrontProvider>{children}</StorefrontProvider>
}
