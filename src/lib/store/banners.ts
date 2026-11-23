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

export const defaultBanners: StoreBanner[] = [];
