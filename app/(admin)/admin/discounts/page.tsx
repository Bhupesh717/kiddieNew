import type { Metadata } from "next";
import { ModulePage } from "@/components/admin/module-page";

export const metadata: Metadata = {
  title: "Admin Discounts",
};

export default function DiscountsPage() {
  return (
    <ModulePage
      storageKey="majisavesh_admin_discounts_v1"
      eyebrow="Growth"
      title="Discounts"
      description="Create thoughtful offers without losing the value of the craft."
      action="Create discount"
      createFields={[
        { label: "Promo code", placeholder: "DIWALI15" },
        {
          label: "Type",
          placeholder: "Percentage",
          defaultValue: "Percentage",
        },
        { label: "Value", placeholder: "15%" },
        {
          label: "Usage limit",
          placeholder: "0 / 100",
          defaultValue: "0 / 100",
        },
        { label: "Status", placeholder: "Active", defaultValue: "Active" },
      ]}
      columns={["Code", "Type", "Value", "Uses", "Status"]}
      rows={[
        ["WELCOME10", "Percentage", "10%", "128 / ∞", "Active"],
        ["FESTIVE25", "Percentage", "25%", "42 / 100", "Active"],
        ["ATELIER500", "Fixed amount", "Rs. 500", "86 / 100", "Expired"],
      ]}
    />
  );
}
