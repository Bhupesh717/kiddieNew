"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Image from "next/image";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";
import {
  orderApiService,
  type AdminOrderDetail,
  type AdminOrderRow,
  type OrderStatus,
  type PaymentStatus,
} from "@/src/lib/api/services/order-service";

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; bgClass: string; textClass: string }
> = {
  placed: {
    label: "Placed",
    badgeClass: "border-stone-300 bg-stone-100 text-stone-700",
    bgClass: "bg-stone-50",
    textClass: "text-stone-700",
  },
  confirmed: {
    label: "Confirmed",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
  },
  processing: {
    label: "Processing",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
  },
  shipped: {
    label: "Shipped",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
    bgClass: "bg-sky-50",
    textClass: "text-sky-700",
  },
  delivered: {
    label: "Delivered",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
    bgClass: "bg-rose-50",
    textClass: "text-rose-700",
  },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; badgeClass: string }
> = {
  paid: {
    label: "Paid",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  pending: {
    label: "Pending",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
  },
  failed: {
    label: "Failed",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
  },
  refunded: {
    label: "Refunded",
    badgeClass: "border-purple-200 bg-purple-50 text-purple-700",
  },
};

export function OrderManager() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeOrderDetail, setActiveOrderDetail] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status update state inside detail modal
  const [editStatus, setEditStatus] = useState<OrderStatus>("processing");
  const [editTracking, setEditTracking] = useState("");
  const [editCarrier, setEditCarrier] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>("pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderApiService.list();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch admin orders", err);
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load orders",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Load single order detail when selected
  useEffect(() => {
    if (!selectedOrderId) {
      setActiveOrderDetail(null);
      return;
    }

    // Try finding in existing orders first
    const found = orders.find(
      (o) => o.id === selectedOrderId || o.order === selectedOrderId,
    );
    if (found?.details) {
      setActiveOrderDetail(found.details);
      setEditStatus(found.details.orderStatus || "processing");
      setEditTracking(found.details.trackingNumber || "");
      setEditCarrier(found.details.shippingCarrier || "");
      setEditPaymentStatus(found.details.paymentStatus || "pending");
    }

    setDetailLoading(true);
    orderApiService
      .get(selectedOrderId)
      .then((detail) => {
        setActiveOrderDetail(detail);
        setEditStatus(detail.orderStatus || "processing");
        setEditTracking(detail.trackingNumber || "");
        setEditCarrier(detail.shippingCarrier || "");
        setEditPaymentStatus(detail.paymentStatus || "pending");
      })
      .catch((err) => {
        console.error("Failed to load full order detail", err);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  }, [selectedOrderId, orders]);

  // Modal ESC key listener
  useEffect(() => {
    if (!selectedOrderId && !confirmCancelId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedOrderId(null);
        setConfirmCancelId(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedOrderId, confirmCancelId]);

  // Counts for tabs
  const processingCount = useMemo(
    () => orders.filter((o) => o.order_status === "processing").length,
    [orders],
  );
  const shippedCount = useMemo(
    () => orders.filter((o) => o.order_status === "shipped").length,
    [orders],
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.order_status === "delivered").length,
    [orders],
  );
  const cancelledCount = useMemo(
    () => orders.filter((o) => o.order_status === "cancelled").length,
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.order_status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.order.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter]);

  const pagination = useTablePagination(filteredOrders);

  // Quick status update from table or modal
  async function handleQuickStatusChange(
    orderId: string,
    newStatus: OrderStatus,
  ) {
    setBusyId(orderId);
    setFeedback(null);
    try {
      const updated = await orderApiService.update(orderId, {
        orderStatus: newStatus,
      });

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId || o.order === orderId) {
            return {
              ...o,
              status:
                newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
              order_status: newStatus,
              details: updated,
            };
          }
          return o;
        }),
      );

      if (activeOrderDetail && (activeOrderDetail.id === orderId || activeOrderDetail.reference === orderId)) {
        setActiveOrderDetail(updated);
        setEditStatus(updated.orderStatus);
      }

      setFeedback({
        type: "success",
        text: `Order ${updated.reference} status updated to ${ORDER_STATUS_CONFIG[newStatus]?.label || newStatus}.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update status",
      });
    } finally {
      setBusyId(null);
    }
  }

  // Save changes from order detail modal (Status + Carrier + Tracking)
  async function handleSaveFulfillment(e: FormEvent) {
    e.preventDefault();
    if (!activeOrderDetail) return;

    setUpdatingStatus(true);
    setFeedback(null);
    try {
      const updated = await orderApiService.update(activeOrderDetail.id, {
        orderStatus: editStatus,
        shippingCarrier: editCarrier.trim() || undefined,
        trackingNumber: editTracking.trim() || undefined,
        paymentStatus: editPaymentStatus,
      });

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === activeOrderDetail.id || o.order === activeOrderDetail.reference) {
            return {
              ...o,
              status:
                editStatus.charAt(0).toUpperCase() + editStatus.slice(1),
              order_status: editStatus,
              payment_status: editPaymentStatus,
              details: updated,
            };
          }
          return o;
        }),
      );

      setActiveOrderDetail(updated);
      setFeedback({
        type: "success",
        text: `Order ${updated.reference} fulfillment details updated successfully.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update order",
      });
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Cancel order handler
  async function handleConfirmCancel() {
    if (!confirmCancelId) return;
    setBusyId(confirmCancelId);
    setFeedback(null);
    try {
      const updated = await orderApiService.cancel(
        confirmCancelId,
        cancelReason.trim() || "Cancelled by admin",
      );

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === confirmCancelId || o.order === confirmCancelId) {
            return {
              ...o,
              status: "Cancelled",
              order_status: "cancelled",
              details: updated,
            };
          }
          return o;
        }),
      );

      if (activeOrderDetail && (activeOrderDetail.id === confirmCancelId || activeOrderDetail.reference === confirmCancelId)) {
        setActiveOrderDetail(updated);
        setEditStatus("cancelled");
      }

      setFeedback({
        type: "success",
        text: `Order ${updated.reference} has been cancelled.`,
      });
      setConfirmCancelId(null);
      setCancelReason("");
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to cancel order",
      });
    } finally {
      setBusyId(null);
    }
  }

  function handlePrintInvoice() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <section className="container mx-auto px-6 py-8 lg:px-10 lg:py-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Sales
          </p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Orders</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Track every order from your atelier to your customer’s doorstep (
            {loading ? "Loading..." : `${orders.length} orders recorded`}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 border border-border bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition hover:bg-stone-50 disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`mt-6 flex items-start justify-between gap-3 border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-accent" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-700"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Orders Table Card */}
      <div className="mt-8 overflow-hidden border border-border bg-white shadow-sm">
        {/* Toolbar: Search + Status Tabs */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              <Search size={15} />
              <span className="sr-only">Search orders</span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  pagination.setPage(1);
                }}
                placeholder="Search order #, customer..."
                className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted-foreground sm:w-64"
              />
            </label>

            {/* Filter Tabs */}
            <div className="flex items-center border border-border bg-background p-0.5 text-xs">
              {(
                [
                  ["all", `All (${orders.length})`],
                  ["processing", `Processing (${processingCount})`],
                  ["shipped", `Shipped (${shippedCount})`],
                  ["delivered", `Delivered (${deliveredCount})`],
                  ["cancelled", `Cancelled (${cancelledCount})`],
                ] as const
              ).map(([value, label]) => {
                const selected = statusFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(value);
                      pagination.setPage(1);
                    }}
                    className={`px-3 py-1.5 font-medium transition ${
                      selected
                        ? "bg-white text-primary shadow-xs"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <span className="text-xs text-muted-foreground">
            {loading
              ? "Loading..."
              : `${filteredOrders.length} ${
                  filteredOrders.length === 1 ? "order" : "orders"
                }`}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">Order</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Items</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Status (Change)</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedItems.map((o) => {
                const isBusy = busyId === o.id;
                const statusMeta =
                  ORDER_STATUS_CONFIG[o.order_status] ||
                  ORDER_STATUS_CONFIG.processing;
                const itemsCount =
                  o.details?.items?.length ?? o.items_count ?? 1;

                return (
                  <tr
                    key={o.id}
                    className="border-t border-border transition hover:bg-stone-50/70"
                  >
                    {/* Order Reference */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold tracking-wide text-primary">
                          {o.order}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-serif text-sm font-medium text-primary">
                          {o.customer}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {o.email}
                        </span>
                      </div>
                    </td>

                    {/* Items Preview */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-sm bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                          <Package size={12} className="text-stone-500" />
                          {itemsCount === 1
                            ? "1 Product"
                            : `${itemsCount} Products`}
                        </span>
                        {o.details?.items?.[0] && (
                          <span className="hidden text-xs text-stone-500 xl:inline truncate max-w-[160px]">
                            {o.details.items[0].name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {o.date}
                    </td>

                    {/* Total & Payment */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-primary">
                          {o.total}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {o.details?.paymentMethod || "COD"} •{" "}
                          <span
                            className={
                              o.details?.paymentStatus === "paid"
                                ? "text-emerald-700 font-semibold"
                                : "text-amber-700"
                            }
                          >
                            {o.details?.paymentStatus === "paid"
                              ? "Paid"
                              : "Pending"}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Status Dropdown (Direct Inline Update) */}
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <select
                          disabled={isBusy}
                          value={o.order_status}
                          onChange={(e) =>
                            handleQuickStatusChange(
                              o.id,
                              e.target.value as OrderStatus,
                            )
                          }
                          className={`appearance-none rounded-xs border px-3 py-1 pr-7 text-[11px] font-semibold uppercase tracking-wider outline-none cursor-pointer transition disabled:opacity-50 ${statusMeta.badgeClass}`}
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown
                          size={13}
                          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-70"
                        />
                      </div>
                    </td>

                    {/* Actions: View & Cancel */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(o.id)}
                          className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:border-primary hover:bg-stone-50"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {/* Cancel Button (if not already cancelled/delivered) */}
                        {o.order_status !== "cancelled" &&
                          o.order_status !== "delivered" && (
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(o.id)}
                              disabled={isBusy}
                              title="Cancel order"
                              className="border border-rose-200 bg-white p-1.5 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty States */}
        {loading && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Loading orders...
          </p>
        )}
        {!loading && !filteredOrders.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search ? `No orders match "${search}".` : "No orders found."}
          </p>
        )}

        {/* Pagination */}
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startEntry={pagination.startEntry}
          endEntry={pagination.endEntry}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="orders"
        />
      </div>

      {/* Professional Order Details Drawer / Modal */}
      {selectedOrderId && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !updatingStatus) {
              setSelectedOrderId(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col bg-white shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border bg-stone-50/70 p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Order Details & Fulfillment
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h2
                    id="order-detail-title"
                    className="font-mono text-2xl font-bold text-primary"
                  >
                    {activeOrderDetail?.reference ?? `#MV-${selectedOrderId}`}
                  </h2>

                  {/* Status Badge */}
                  {activeOrderDetail && (
                    <span
                      className={`inline-flex items-center gap-1 border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        ORDER_STATUS_CONFIG[activeOrderDetail.orderStatus]
                          ?.badgeClass || ""
                      }`}
                    >
                      {ORDER_STATUS_CONFIG[activeOrderDetail.orderStatus]
                        ?.label || activeOrderDetail.orderStatus}
                    </span>
                  )}

                  <span className="text-xs text-muted-foreground">
                    Placed on {activeOrderDetail?.formattedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="hidden sm:inline-flex items-center gap-1.5 border border-border bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  title="Print invoice / order summary"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  disabled={updatingStatus}
                  aria-label="Close order details"
                  className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <RefreshCw className="size-6 animate-spin text-accent" />
                  <p className="mt-3 text-xs text-muted-foreground">
                    Loading full order details & items...
                  </p>
                </div>
              ) : activeOrderDetail ? (
                <>
                  {/* Fulfillment Control Box (Admin Status Updater) */}
                  <form
                    onSubmit={handleSaveFulfillment}
                    className="border border-accent/20 bg-amber-50/20 p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2 text-primary font-serif font-semibold">
                        <Truck size={17} className="text-accent" />
                        <span>Fulfillment & Delivery Status</span>
                      </div>
                      {activeOrderDetail.orderStatus !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmCancelId(activeOrderDetail.id)
                          }
                          className="text-xs font-semibold uppercase tracking-wider text-rose-600 hover:underline"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Order Status Select */}
                      <div>
                        <label className="text-xs font-medium text-stone-700">
                          Order Status *
                        </label>
                        <div className="relative mt-1">
                          <select
                            value={editStatus}
                            onChange={(e) =>
                              setEditStatus(e.target.value as OrderStatus)
                            }
                            className="w-full appearance-none border border-input bg-white px-3 py-2 pr-7 text-xs font-medium text-primary outline-none focus:border-accent"
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400"
                          />
                        </div>
                      </div>

                      {/* Payment Status Select */}
                      <div>
                        <label className="text-xs font-medium text-stone-700">
                          Payment Status
                        </label>
                        <div className="relative mt-1">
                          <select
                            value={editPaymentStatus}
                            onChange={(e) =>
                              setEditPaymentStatus(
                                e.target.value as PaymentStatus,
                              )
                            }
                            className="w-full appearance-none border border-input bg-white px-3 py-2 pr-7 text-xs font-medium text-primary outline-none focus:border-accent"
                          >
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                          <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400"
                          />
                        </div>
                      </div>

                      {/* Shipping Carrier */}
                      <div>
                        <label className="text-xs font-medium text-stone-700">
                          Shipping Carrier
                        </label>
                        <input
                          type="text"
                          value={editCarrier}
                          onChange={(e) => setEditCarrier(e.target.value)}
                          placeholder="e.g. Delhivery Express"
                          className="mt-1 w-full border border-input bg-white px-3 py-2 text-xs outline-none focus:border-accent"
                        />
                      </div>

                      {/* Tracking Number */}
                      <div>
                        <label className="text-xs font-medium text-stone-700">
                          Tracking #
                        </label>
                        <input
                          type="text"
                          value={editTracking}
                          onChange={(e) => setEditTracking(e.target.value)}
                          placeholder="e.g. DELHIVERY8921389"
                          className="mt-1 w-full border border-input bg-white px-3 py-2 text-xs font-mono outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={updatingStatus}
                        className="inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent/90 disabled:opacity-50"
                      >
                        <Send size={13} />
                        <span>
                          {updatingStatus
                            ? "Updating..."
                            : "Update Status & Fulfillment"}
                        </span>
                      </button>
                    </div>
                  </form>

                  {/* Products Ordered (Single & Multiple products support) */}
                  <div className="border border-border bg-white p-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Package size={17} className="text-accent" />
                        <h3 className="font-serif text-lg text-primary">
                          Products in this Order (
                          {activeOrderDetail.items?.length ?? 0})
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {activeOrderDetail.items?.length === 1
                          ? "Single Item Order"
                          : "Multiple Items Order"}
                      </span>
                    </div>

                    <div className="mt-4 divide-y divide-border/60">
                      {activeOrderDetail.items?.map((item) => {
                        const lineTotal =
                          item.lineTotal || item.price * item.quantity;

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Product Thumbnail */}
                              <div className="relative size-16 shrink-0 overflow-hidden rounded-xs border border-border bg-stone-100">
                                {item.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="size-full object-cover object-center"
                                  />
                                ) : (
                                  <div className="flex size-full items-center justify-center text-stone-400">
                                    <ShoppingBag size={20} />
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="font-serif text-sm font-semibold text-primary">
                                  {item.name}
                                </h4>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-600">
                                  {item.size && (
                                    <span className="rounded-xs bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700">
                                      Size: {item.size}
                                    </span>
                                  )}
                                  {item.color && (
                                    <span className="rounded-xs bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700">
                                      Color: {item.color}
                                    </span>
                                  )}
                                  <span className="text-muted-foreground">
                                    Qty: {item.quantity} × Rs.{" "}
                                    {Number(item.price).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right sm:shrink-0">
                              <span className="font-serif text-base font-semibold text-primary">
                                Rs. {Number(lineTotal).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2-Column Grid: Customer/Delivery + Financials */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Customer & Delivery Details */}
                    <div className="border border-border bg-white p-5">
                      <div className="flex items-center gap-2 border-b border-border pb-3">
                        <User size={16} className="text-accent" />
                        <h4 className="font-serif text-base font-semibold text-primary">
                          Customer & Delivery
                        </h4>
                      </div>

                      <div className="mt-4 space-y-3 text-xs">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Customer Name
                          </p>
                          <p className="mt-0.5 font-medium text-primary">
                            {activeOrderDetail.customerName}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-stone-700">
                          <Mail size={13} className="text-stone-400" />
                          <span>{activeOrderDetail.customerEmail}</span>
                        </div>

                        {activeOrderDetail.customerPhone && (
                          <div className="flex items-center gap-2 text-stone-700">
                            <Phone size={13} className="text-stone-400" />
                            <span>{activeOrderDetail.customerPhone}</span>
                          </div>
                        )}

                        <div className="border-t border-border/60 pt-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <MapPin size={12} className="text-accent" />
                            Shipping Address
                          </p>
                          <p className="mt-1 text-stone-800 leading-relaxed">
                            {activeOrderDetail.address}
                            <br />
                            {activeOrderDetail.city},{" "}
                            {activeOrderDetail.stateName}{" "}
                            {activeOrderDetail.pinCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary & Payment */}
                    <div className="border border-border bg-white p-5">
                      <div className="flex items-center gap-2 border-b border-border pb-3">
                        <CreditCard size={16} className="text-accent" />
                        <h4 className="font-serif text-base font-semibold text-primary">
                          Payment & Summary
                        </h4>
                      </div>

                      <div className="mt-4 space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-stone-600">Payment Method:</span>
                          <span className="font-medium text-primary uppercase">
                            {activeOrderDetail.paymentMethod || "COD"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-stone-600">Payment Status:</span>
                          <span
                            className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              PAYMENT_STATUS_CONFIG[
                                activeOrderDetail.paymentStatus
                              ]?.badgeClass || ""
                            }`}
                          >
                            {activeOrderDetail.paymentStatus}
                          </span>
                        </div>

                        <div className="border-t border-border/60 pt-2.5 flex justify-between">
                          <span className="text-stone-600">Subtotal:</span>
                          <span className="font-medium text-primary">
                            Rs.{" "}
                            {Number(activeOrderDetail.subtotal).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>

                        {activeOrderDetail.discount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Discount {activeOrderDetail.promoCode ? `(${activeOrderDetail.promoCode})` : ""}:</span>
                            <span>
                              - Rs.{" "}
                              {Number(
                                activeOrderDetail.discount,
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-stone-600">Shipping:</span>
                          <span className="font-medium text-primary">
                            {activeOrderDetail.shipping > 0
                              ? `Rs. ${Number(
                                  activeOrderDetail.shipping,
                                ).toLocaleString("en-IN")}`
                              : "Free"}
                          </span>
                        </div>

                        <div className="border-t border-border pt-3 flex justify-between items-baseline">
                          <span className="font-serif text-sm font-bold text-primary">
                            Grand Total:
                          </span>
                          <span className="font-serif text-xl font-bold text-accent">
                            Rs.{" "}
                            {Number(activeOrderDetail.total).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-border bg-stone-50/70 p-4">
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="bg-primary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {confirmCancelId && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busyId) {
              setConfirmCancelId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="w-full max-w-sm bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-rose-600">
              <XCircle size={22} />
              <h3
                id="cancel-dialog-title"
                className="font-serif text-xl text-primary"
              >
                Cancel Order
              </h3>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to cancel this order? This will mark the order
              as cancelled and notify the records.
            </p>
            <div className="mt-3">
              <label className="text-[11px] font-medium text-stone-700">
                Cancellation Reason (Optional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation"
                className="mt-1 w-full border border-input bg-white px-3 py-2 text-xs outline-none focus:border-accent"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => setConfirmCancelId(null)}
                className="border border-input px-4 py-2 text-[10px] uppercase tracking-wider text-stone-700 hover:bg-stone-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={handleConfirmCancel}
                className="bg-rose-600 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {busyId === confirmCancelId ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
