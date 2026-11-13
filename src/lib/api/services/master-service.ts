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
    throw new Error(
      payload?.error?.message ?? "Unable to complete master update",
    );
  }
  return payload.data;
}

export const masterApiService = {
  async list(
    type: MasterType,
    status: MasterStatus | "all" = "all",
  ): Promise<MasterItem[]> {
    const query = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
    const response = await fetch(`/api/masters/${type}${query}`, {
      cache: "no-store",
    });
    return parseEnvelope<MasterItem[]>(response);
  },

  async create(type: MasterType, input: MasterItemInput): Promise<MasterItem> {
    const response = await fetch(`/api/masters/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      `/api/masters/${type}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      },
    );
    return parseEnvelope<MasterItem>(response);
  },

  async remove(type: MasterType, id: string): Promise<MasterItem> {
    const response = await fetch(
      `/api/masters/${type}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
    return parseEnvelope<MasterItem>(response);
  },

  async reset(type: MasterType): Promise<MasterItem[]> {
    const response = await fetch(`/api/masters/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    return parseEnvelope<MasterItem[]>(response);
  },
};

