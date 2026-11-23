import { getAuthHeaders } from "@/src/lib/api/auth-token";
import type { ApiEnvelope } from "@/src/lib/api/types/common";
import type {
  BannerStatus,
  StoreBanner,
  StoreBannerInput,
} from "@/src/lib/store/banners";

async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    const errorMsg =
      payload?.error?.message ??
      (response.status === 401
        ? "Unauthorized: Please log in as an administrator"
        : response.status === 403
        ? "Forbidden: Administrator privileges required"
        : "Unable to sync banner request with server");
    throw new Error(errorMsg);
  }
  return payload.data;
}

export const bannerApiService = {
  /**
   * List banners. If in admin context, fetches from /api/admin/banners; otherwise public /api/banners.
   */
  async list(status: BannerStatus | "all" = "all", isAdmin = true): Promise<StoreBanner[]> {
    const query = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
    const endpoint = isAdmin ? `/api/admin/banners${query}` : `/api/banners${query}`;
    const response = await fetch(endpoint, {
      headers: isAdmin ? getAuthHeaders(false) : { Accept: "application/json" },
      cache: "no-store",
    });
    return parseEnvelope<StoreBanner[]>(response);
  },

  async create(input: StoreBannerInput): Promise<StoreBanner> {
    const response = await fetch("/api/admin/banners", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(input),
    });
    return parseEnvelope<StoreBanner>(response);
  },

  async update(
    id: string,
    patch: Partial<StoreBannerInput>,
  ): Promise<StoreBanner> {
    const response = await fetch(
      `/api/admin/banners/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(patch),
      },
    );
    return parseEnvelope<StoreBanner>(response);
  },

  async move(id: string, direction: "up" | "down"): Promise<StoreBanner[]> {
    const response = await fetch("/api/admin/banners", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ action: "reorder", id, direction }),
    });
    return parseEnvelope<StoreBanner[]>(response);
  },

  async remove(id: string): Promise<StoreBanner> {
    const response = await fetch(
      `/api/admin/banners/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(false),
      },
    );
    return parseEnvelope<StoreBanner>(response);
  },

  async reset(): Promise<StoreBanner[]> {
    return this.list("all", true);
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const headers = getAuthHeaders(false) as Record<string, string>;
    delete headers["Content-Type"];

    const response = await fetch("/api/admin/banners/upload", {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await parseEnvelope<{ url: string }>(response);
    return data.url;
  },
};
