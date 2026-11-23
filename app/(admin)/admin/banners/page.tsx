import type { Metadata } from "next";
import { BannerManager } from "@/components/admin/banner-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Banners",
};

export default function AdminBannersPage() {
  return <BannerManager initialBanners={[]} />;
}
