import type { Metadata } from "next"
import { ProductManager } from "@/components/admin/product-manager"

export const metadata: Metadata = {
  title: "Admin Products",
}

export default function ProductsPage() {
  return <ProductManager />
}
