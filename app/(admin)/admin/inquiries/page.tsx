import type { Metadata } from "next";
import { InquiryManager } from "@/components/admin/inquiry-manager";

export const metadata: Metadata = {
  title: "Inquiries & Newsletter Leads | KiddieQuick Admin",
  description: "Manage customer contact inquiries and newsletter subscribers.",
};

export default function AdminInquiriesPage() {
  return <InquiryManager />;
}
