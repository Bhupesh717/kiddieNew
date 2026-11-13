import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/module-page";

export const metadata: Metadata = {
  title: "Admin Customers",
};

export default function CustomersPage() {
  return (
    <ModulePage
      eyebrow="Relationships"
      title="Customers"
      description="Understand and care for the people who wear Majisavesh."
      columns={["Customer", "Email", "Orders", "Spent", "Joined"]}
      rows={[
        ["Meera Sharma", "meera@example.com", "8", "Rs. 86,400", "Mar 2026"],
        ["Ananya Kapoor", "ananya@example.com", "5", "Rs. 62,100", "May 2026"],
        ["Riya Bansal", "riya@example.com", "3", "Rs. 31,200", "Aug 2026"],
      ]}
    />
  );
}
