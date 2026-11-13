import type { Metadata } from "next";
import { BannerManager } from "@/components/admin/banner-manager";
import { listBanners } from "@/src/lib/server/banner-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Banners",
};

export default function AdminBannersPage() {
  const banners = listBanners("all");
  return <BannerManager initialBanners={banners} />;
}

