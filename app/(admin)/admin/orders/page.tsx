import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/module-page";

export const metadata: Metadata = {
  title: "Admin Orders",
};

export default function OrdersPage() {
  return (
    <ModulePage
      eyebrow="Sales"
      title="Orders"
      description="Track every order from your atelier to your customer’s doorstep."
      columns={["Order", "Customer", "Date", "Total", "Status"]}
      rows={[
        ["#MV-1048", "Meera Sharma", "17 Oct 2026", "Rs. 18,500", "Processing"],
        ["#MV-1047", "Ananya Kapoor", "16 Oct 2026", "Rs. 24,800", "Shipped"],
        ["#MV-1046", "Riya Bansal", "16 Oct 2026", "Rs. 12,400", "Delivered"],
      ]}
    />
  );
}
