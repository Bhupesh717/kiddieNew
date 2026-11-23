import { getAuthHeaders } from "@/src/lib/api/auth-token";
import type { ApiEnvelope } from "@/src/lib/api/types/common";
import type {
  MasterItem,
  MasterItemInput,
  MasterStatus,
  MasterType,
} from "@/src/lib/store/masters";

async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    const errorMsg =
      payload?.error?.message ??
      (response.status === 401
        ? "Unauthorized: Please log in as an administrator"
        : response.status === 403
        ? "Forbidden: Administrator privileges required"
        : "Unable to complete master update");
    throw new Error(errorMsg);
  }
  return payload.data;
}

export const masterApiService = {
  /**
   * List master items. If isAdmin is true, fetches from /api/admin/masters/${type}; otherwise /api/masters/${type}.
   */
  async list(
    type: MasterType,
    status: MasterStatus | "all" = "all",
    isAdmin = false,
  ): Promise<MasterItem[]> {
    const query = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
    const endpoint = isAdmin ? `/api/admin/masters/${type}${query}` : `/api/masters/${type}${query}`;
    const response = await fetch(endpoint, {
      headers: isAdmin ? getAuthHeaders(false) : { Accept: "application/json" },
      cache: "no-store",
    });
    return parseEnvelope<MasterItem[]>(response);
  },

  async create(type: MasterType, input: MasterItemInput): Promise<MasterItem> {
    const response = await fetch(`/api/admin/masters/${type}`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(input),
    });
    return parseEnvelope<MasterItem>(response);
  },

  async update(
    type: MasterType,
    id: string,
    patch: Partial<MasterItemInput>,
  ): Promise<MasterItem> {
    const response = await fetch(
      `/api/admin/masters/${type}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(patch),
      },
    );
    return parseEnvelope<MasterItem>(response);
  },

  async remove(type: MasterType, id: string): Promise<MasterItem> {
    const response = await fetch(
      `/api/admin/masters/${type}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(false),
      },
    );
    return parseEnvelope<MasterItem>(response);
  },

  async reset(type: MasterType): Promise<MasterItem[]> {
    return this.list(type, "all", true);
  },

  async uploadImage(type: MasterType, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const headers = getAuthHeaders(false) as Record<string, string>;
    delete headers["Content-Type"];

    const response = await fetch(`/api/admin/masters/${encodeURIComponent(type)}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await parseEnvelope<{ url: string }>(response);
    return data.url;
  },
};
