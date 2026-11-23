import { getAuthHeaders } from "@/src/lib/api/auth-token";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderItemDetail = {
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

export type AdminOrderDetail = {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  stateCode?: string;
  stateName?: string;
  pinCode?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode?: string | null;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
  createdAt: string;
  formattedDate: string;
  items: OrderItemDetail[];
};

export type AdminOrderRow = {
  id: string;
  order: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  total: string;
  total_raw: number;
  status: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  items_count: number;
  details: AdminOrderDetail;
};

export const orderApiService = {
  async list(): Promise<AdminOrderRow[]> {
    const res = await fetch("/api/admin/orders", {
      headers: getAuthHeaders(false),
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to fetch orders",
      );
    }
    const list = Array.isArray(payload?.data)
      ? payload.data
      : (payload?.data?.orders ?? []);
    return list;
  },

  async get(id: string): Promise<AdminOrderDetail> {
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(false),
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to fetch order details",
      );
    }
    return payload.data;
  },

  async update(
    id: string,
    data: {
      orderStatus?: OrderStatus;
      trackingNumber?: string;
      shippingCarrier?: string;
      paymentStatus?: PaymentStatus;
      notes?: string;
    },
  ): Promise<AdminOrderDetail> {
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(data),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to update order",
      );
    }
    return payload.data;
  },

  async cancel(id: string, notes?: string): Promise<AdminOrderDetail> {
    const res = await fetch(
      `/api/admin/orders/${encodeURIComponent(id)}/cancel`,
      {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ notes }),
      },
    );
    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || payload?.message || "Failed to cancel order",
      );
    }
    return payload.data;
  },
};
