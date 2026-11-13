export type BannerStatus = "active" | "inactive";

export type StoreBanner = {
  id: string;
  image: string;
  order: number;
  status: BannerStatus;
  updatedAt: string;
};

export type StoreBannerInput = {
  id?: string;
  image: string;
  order?: number;
  status?: BannerStatus;
  updatedAt?: string;
};

export const defaultBanners: StoreBanner[] = [
  {
    id: "banner-001",
    image: "/Majisavesh_Banner.png",
    order: 1,
    status: "active",
    updatedAt: "2026-11-11T10:00:00.000Z",
  },
];
