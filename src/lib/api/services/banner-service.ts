import type { ApiEnvelope } from "@/src/lib/api/types/common";
import type {
  BannerStatus,
  StoreBanner,
  StoreBannerInput,
} from "@/src/lib/store/banners";

async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message ?? "Unable to sync banner request",
    );
  }
  return payload.data;
}

export const bannerApiService = {
  async list(status: BannerStatus | "all" = "all"): Promise<StoreBanner[]> {
    const query = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
    const response = await fetch(`/api/banners${query}`, { cache: "no-store" });
    return parseEnvelope<StoreBanner[]>(response);
  },

  async create(input: StoreBannerInput): Promise<StoreBanner> {
    const response = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseEnvelope<StoreBanner>(response);
  },

  async update(
    id: string,
    patch: Partial<StoreBannerInput>,
  ): Promise<StoreBanner> {
    const response = await fetch(
      `/api/banners/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      },
    );
    return parseEnvelope<StoreBanner>(response);
  },

  async move(id: string, direction: "up" | "down"): Promise<StoreBanner[]> {
    const response = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", id, direction }),
    });
    return parseEnvelope<StoreBanner[]>(response);
  },

  async remove(id: string): Promise<StoreBanner> {
    const response = await fetch(
      `/api/banners/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
    return parseEnvelope<StoreBanner>(response);
  },

  async reset(): Promise<StoreBanner[]> {
    const response = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    return parseEnvelope<StoreBanner[]>(response);
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/banners/upload", {
      method: "POST",
      body: formData,
    });
    const data = await parseEnvelope<{ url: string }>(response);
    return data.url;
  },
};
