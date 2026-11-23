"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  Eye,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";
import {
  customerApiService,
  type CustomerDetail,
  type CustomerItem,
  type CustomerOrder,
  type CustomerStatus,
} from "@/src/lib/api/services/customer-service";

function getOrderStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "delivered") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (s === "shipped") {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }
  if (s === "processing" || s === "confirmed") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (s === "cancelled") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-stone-100 text-stone-700 border-stone-200";
}

function getPaymentStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "paid") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (s === "pending") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-rose-50 text-rose-700 border-rose-200";
}

export function CustomerManager() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerStatus>("all");

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerApiService.list();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch admin customers", err);
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load customers",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerDetail(null);
      return;
    }
    setDetailLoading(true);
    customerApiService
      .getDetail(selectedCustomerId)
      .then((data) => {
        setCustomerDetail(data);
      })
      .catch((err) => {
        setFeedback({
          type: "error",
          text:
            err instanceof Error
              ? err.message
              : "Failed to load customer profile",
        });
      })
      .finally(() => {
        setDetailLoading(false);
      });
  }, [selectedCustomerId]);

  useEffect(() => {
    if (!selectedCustomerId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedCustomerId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCustomerId]);

  const activeCount = useMemo(
    () => customers.filter((c) => c.status !== "blocked").length,
    [customers],
  );
  const blockedCount = useMemo(
    () => customers.filter((c) => c.status === "blocked").length,
    [customers],
  );

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (statusFilter === "active" && c.status === "blocked") return false;
      if (statusFilter === "blocked" && c.status !== "blocked") return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    });
  }, [customers, search, statusFilter]);

  const pagination = useTablePagination(filteredCustomers);

  async function handleToggleBlock(id: string, customerName: string) {
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await customerApiService.toggleBlock(id);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: res.status, is_blocked: res.is_blocked }
            : c,
        ),
      );

      // If detail modal is open for this customer, update it too
      if (customerDetail && customerDetail.customer.id === id) {
        setCustomerDetail({
          ...customerDetail,
          customer: {
            ...customerDetail.customer,
            status: res.status,
            is_blocked: res.is_blocked,
          },
        });
      }

      setFeedback({
        type: "success",
        text: res.message || `Customer status updated.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : `Failed to update status for ${customerName}`,
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="container mx-auto px-6 py-8 lg:px-10 lg:py-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Relationships
          </p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Customers</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Understand and care for the people who wear KiddieQuick (
            {loading ? "Loading..." : `${customers.length} registered patrons`}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadCustomers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 border border-border bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition hover:bg-stone-50 disabled:opacity-50"
            title="Refresh list"
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

      {/* Main Table Card */}
      <div className="mt-8 overflow-hidden border border-border bg-white shadow-sm">
        {/* Toolbar: Search + Filter Tabs */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              <Search size={15} />
              <span className="sr-only">Search customers</span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  pagination.setPage(1);
                }}
                placeholder="Search customers..."
                className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted-foreground sm:w-64"
              />
            </label>

            {/* Filter Tabs */}
            <div className="flex items-center border border-border bg-background p-0.5 text-xs">
              {(
                [
                  ["all", `All (${customers.length})`],
                  ["active", `Active (${activeCount})`],
                  ["blocked", `Blocked (${blockedCount})`],
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
              : `${filteredCustomers.length} ${
                  filteredCustomers.length === 1 ? "record" : "records"
                }`}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Orders</th>
                <th className="px-5 py-4 font-semibold">Spent</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedItems.map((c) => {
                const isBlocked = c.status === "blocked";
                const isBusy = busyId === c.id;

                return (
                  <tr
                    key={c.id}
                    className={`border-t border-border transition hover:bg-stone-50/70 ${
                      isBlocked ? "bg-rose-50/20" : ""
                    }`}
                  >
                    {/* Name + Phone */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-serif text-base font-medium text-primary">
                          {c.name}
                        </span>
                        {c.phone && c.phone !== "—" && (
                          <span className="text-xs text-muted-foreground">
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-xs font-mono text-stone-700">
                      {c.email}
                    </td>

                    {/* Orders */}
                    <td className="px-5 py-4 text-xs font-semibold text-primary">
                      {c.orders}
                    </td>

                    {/* Spent */}
                    <td className="px-5 py-4 text-xs font-medium text-stone-800">
                      {c.spent}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {c.joined}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1.5 border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                          <UserX size={12} /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                          <UserCheck size={12} /> Active
                        </span>
                      )}
                    </td>

                    {/* Actions: View Details & Block/Unblock */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerId(c.id)}
                          className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:border-primary hover:bg-stone-50"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {/* Block / Unblock Toggle Button */}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleBlock(c.id, c.name)}
                          title={
                            isBlocked
                              ? "Click to Unblock Customer"
                              : "Click to Block Customer"
                          }
                          className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                            isBlocked
                              ? "border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
                              : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                          }`}
                        >
                          {isBlocked ? (
                            <>
                              <ShieldCheck size={13} className="text-emerald-600" />
                              <span>{isBusy ? "Unblocking..." : "Unblock"}</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert size={13} className="text-rose-600" />
                              <span>{isBusy ? "Blocking..." : "Block"}</span>
                            </>
                          )}
                        </button>
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
            Loading customers...
          </p>
        )}
        {!loading && !filteredCustomers.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search ? `No customers match "${search}".` : "No customers found."}
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
          itemLabel="customers"
        />
      </div>

      {/* Customer Details & Orders Modal */}
      {selectedCustomerId && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedCustomerId(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-detail-title"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col bg-white shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border bg-stone-50/60 p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Customer Profile & Orders
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h2
                    id="customer-detail-title"
                    className="font-serif text-2xl text-primary"
                  >
                    {customerDetail?.customer?.name ?? "Customer Details"}
                  </h2>

                  {/* Status Badge */}
                  {customerDetail && (
                    <span
                      className={`inline-flex items-center gap-1 border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        customerDetail.customer.status === "blocked"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {customerDetail.customer.status === "blocked" ? (
                        <>
                          <Ban size={12} /> Blocked
                        </>
                      ) : (
                        <>
                          <UserCheck size={12} /> Active
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Modal Action: Block / Unblock inside modal */}
                {customerDetail && (
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onClick={() =>
                      handleToggleBlock(
                        customerDetail.customer.id,
                        customerDetail.customer.name,
                      )
                    }
                    className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      customerDetail.customer.status === "blocked"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
                    }`}
                  >
                    {customerDetail.customer.status === "blocked" ? (
                      <>
                        <ShieldCheck size={14} className="text-emerald-700" />
                        <span>Unblock Customer</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={14} className="text-rose-700" />
                        <span>Block Customer</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCustomerId(null)}
                  aria-label="Close customer details"
                  className="p-1.5 text-stone-400 hover:text-stone-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="size-6 animate-spin text-accent" />
                  <p className="mt-3 text-xs text-muted-foreground">
                    Loading customer profile and order history...
                  </p>
                </div>
              ) : customerDetail ? (
                <div className="space-y-6">
                  {/* Customer Metrics Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Contact */}
                    <div className="border border-border bg-stone-50/40 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail size={14} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          Email
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-mono font-medium text-primary break-all">
                        {customerDetail.customer.email}
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="border border-border bg-stone-50/40 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={14} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          Phone
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-primary">
                        {customerDetail.customer.phone || "—"}
                      </p>
                    </div>

                    {/* Orders count */}
                    <div className="border border-border bg-stone-50/40 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShoppingBag size={14} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          Total Orders
                        </span>
                      </div>
                      <p className="mt-2 text-base font-semibold text-primary">
                        {customerDetail.orders.length}
                      </p>
                    </div>

                    {/* Total spent */}
                    <div className="border border-border bg-stone-50/40 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={14} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          Joined
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-primary">
                        {customerDetail.customer.joined}
                      </p>
                    </div>
                  </div>

                  {/* Customer Addresses if available */}
                  {customerDetail.customer.addresses &&
                    customerDetail.customer.addresses.length > 0 && (
                      <div className="border border-border p-4">
                        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                          <MapPin size={14} className="text-accent" />
                          Saved Address
                        </h4>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {customerDetail.customer.addresses.map((addr) => (
                            <p key={addr.id}>
                              {addr.address_line1}, {addr.city}, {addr.state} -{" "}
                              {addr.postal_code}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Orders History Section */}
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-accent" />
                        <h3 className="font-serif text-lg text-primary">
                          Order History
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {customerDetail.orders.length}{" "}
                        {customerDetail.orders.length === 1
                          ? "order"
                          : "orders"}
                      </span>
                    </div>

                    {customerDetail.orders.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No orders placed by this customer yet.
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        {customerDetail.orders.map((order) => (
                          <div
                            key={order.id}
                            className="border border-border bg-white p-4 transition hover:border-stone-400"
                          >
                            {/* Order Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-bold tracking-wide text-primary">
                                  {order.reference}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {order.formattedDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Order Status */}
                                <span
                                  className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getOrderStatusBadge(
                                    order.orderStatus,
                                  )}`}
                                >
                                  {order.orderStatus}
                                </span>
                                {/* Payment Status */}
                                <span
                                  className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getPaymentStatusBadge(
                                    order.paymentStatus,
                                  )}`}
                                >
                                  {order.paymentStatus}
                                </span>
                                {/* Order Total */}
                                <span className="font-serif text-sm font-semibold text-primary">
                                  Rs.{" "}
                                  {Number(order.total).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>

                            {/* Order Items */}
                            {order.items && order.items.length > 0 && (
                              <div className="mt-3 divide-y divide-border/40">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between py-2 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-primary">
                                        {item.name}
                                      </span>
                                      {(item.size || item.color) && (
                                        <span className="text-muted-foreground">
                                          ({[item.size, item.color]
                                            .filter(Boolean)
                                            .join(" / ")})
                                        </span>
                                      )}
                                      <span className="text-stone-500">
                                        × {item.quantity}
                                      </span>
                                    </div>
                                    <span className="font-medium text-stone-700">
                                      Rs.{" "}
                                      {Number(item.lineTotal).toLocaleString(
                                        "en-IN",
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Shipping address footer */}
                            {order.city && (
                              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <MapPin size={12} className="shrink-0" />
                                <span>
                                  Shipped to: {order.address}, {order.city},{" "}
                                  {order.stateName} {order.pinCode}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-border bg-stone-50/60 p-4">
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="bg-primary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
