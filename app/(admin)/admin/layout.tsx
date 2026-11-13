import type { ReactNode } from "react"
import { AdminAuthShell } from "@/components/admin/admin-auth-shell"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthShell>{children}</AdminAuthShell>
}
