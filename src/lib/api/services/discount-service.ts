import { getAuthHeaders } from "@/src/lib/api/auth-token";

export type DiscountType = "percentage" | "fixed";
export type DiscountStatus = "active" | "expired" | "disabled";

export type DiscountItem = {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  label?: string;
  active: boolean;
  status: DiscountStatus;
  usageLimit: number | null;
  timesUsed: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
};

export type CreateDiscountPayload = {
  code: string;
  type: DiscountType;
  value: number;
  label?: string;
  usageLimit?: number | null;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  status?: DiscountStatus;
};

export type UpdateDiscountPayload = Partial<CreateDiscountPayload>;

export const discountApiService = {
  async list(): Promise<DiscountItem[]> {
    const res = await fetch("/api/admin/discounts", {
      headers: getAuthHeaders(false),
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to fetch discounts",
      );
    }
    const list = Array.isArray(payload?.data)
      ? payload.data
      : (payload?.data?.discounts ?? []);
    return list;
  },

  async create(data: CreateDiscountPayload): Promise<DiscountItem> {
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(data),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to create discount",
      );
    }
    return payload.data;
  },

  async update(id: string, data: UpdateDiscountPayload): Promise<DiscountItem> {
    const res = await fetch(`/api/admin/discounts/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(data),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to update discount",
      );
    }
    return payload.data;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/admin/discounts/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to delete discount",
      );
    }
  },
};
