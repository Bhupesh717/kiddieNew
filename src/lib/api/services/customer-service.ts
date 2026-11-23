import { getAuthHeaders } from "@/src/lib/api/auth-token";

export type CustomerStatus = "active" | "blocked";

export type CustomerItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  is_blocked: boolean;
  orders: number;
  total_spent: number;
  spent: string;
  joined: string;
  created_at?: string;
};

export type CustomerOrderItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  lineTotal: number;
};

export type CustomerOrder = {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  stateName?: string;
  pinCode?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  formattedDate: string;
  items: CustomerOrderItem[];
};

export type CustomerAddress = {
  id: string | number;
  type?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  is_default?: boolean;
};

export type CustomerDetail = {
  customer: CustomerItem & {
    addresses?: CustomerAddress[];
  };
  orders: CustomerOrder[];
};

export const customerApiService = {
  async list(): Promise<CustomerItem[]> {
    const res = await fetch("/api/admin/customers", {
      headers: getAuthHeaders(false),
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to fetch customers",
      );
    }
    const list = Array.isArray(payload?.data)
      ? payload.data
      : (payload?.data?.customers ?? []);
    return list;
  },

  async getDetail(id: string): Promise<CustomerDetail> {
    const res = await fetch(`/api/admin/customers/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(false),
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to fetch customer details",
      );
    }
    return payload.data;
  },

  async toggleBlock(id: string): Promise<{
    id: string;
    name: string;
    status: CustomerStatus;
    is_blocked: boolean;
    message: string;
  }> {
    const res = await fetch(
      `/api/admin/customers/${encodeURIComponent(id)}/toggle-block`,
      {
        method: "PATCH",
        headers: getAuthHeaders(true),
      },
    );
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to update block status",
      );
    }
    return payload.data;
  },
};
