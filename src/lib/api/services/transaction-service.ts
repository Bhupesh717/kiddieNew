import { getAuthHeaders } from "@/src/lib/api/auth-token";
import type { ApiEnvelope } from "@/src/lib/api/types/common";

export type AdminTransaction = {
  id: string;
  transactionId: string;
  orderId?: number;
  orderReference: string;
  customer: string;
  email?: string;
  phone?: string;
  amount: number;
  formattedAmount: string;
  paymentMethod: string;
  paymentGateway: string;
  gatewayTransactionId?: string;
  status: "success" | "pending" | "failed" | "refunded";
  date: string;
  notes?: string;
  order?: any;
};

async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    const errorMsg =
      payload?.error?.message ??
      (response.status === 401
        ? "Unauthorized: Please log in as an administrator"
        : response.status === 403
        ? "Forbidden: Administrator privileges required"
        : "Failed to fetch transactions");
    throw new Error(errorMsg);
  }
  return payload.data;
}

export const transactionApiService = {
  async list(params?: { search?: string; status?: string }): Promise<AdminTransaction[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status && params.status !== "all") searchParams.set("status", params.status);

    const qs = searchParams.toString();
    const endpoint = `/api/admin/transactions${qs ? `?${qs}` : ""}`;

    const response = await fetch(endpoint, {
      headers: getAuthHeaders(false),
      cache: "no-store",
    });

    return parseEnvelope<AdminTransaction[]>(response);
  },

  async getById(id: string): Promise<AdminTransaction> {
    const response = await fetch(`/api/admin/transactions/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(false),
      cache: "no-store",
    });

    return parseEnvelope<AdminTransaction>(response);
  },

  async updateStatus(
    id: string,
    status: "success" | "pending" | "failed" | "refunded",
    notes?: string,
  ): Promise<any> {
    const response = await fetch(
      `/api/admin/transactions/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ status, notes }),
      },
    );

    return parseEnvelope<any>(response);
  },
};
