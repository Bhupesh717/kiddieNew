"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";
import {
  discountApiService,
  type DiscountItem,
  type DiscountStatus,
  type DiscountType,
} from "@/src/lib/api/services/discount-service";

type DiscountDraft = {
  code: string;
  type: DiscountType;
  value: string;
  usageLimit: string;
  label: string;
};

const EMPTY_DRAFT: DiscountDraft = {
  code: "",
  type: "percentage",
  value: "15",
  usageLimit: "100",
  label: "",
};

export function DiscountManager() {
  const [items, setItems] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");

  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DiscountDraft>(EMPTY_DRAFT);

  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await discountApiService.list();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch admin discounts", err);
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to fetch discounts",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiscounts();
  }, [loadDiscounts]);

  useEffect(() => {
    if (!dialog && !confirmDeleteId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDialog(null);
        setConfirmDeleteId(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog, confirmDeleteId]);

  const activeCount = useMemo(
    () => items.filter((d) => d.status === "active").length,
    [items],
  );
  const expiredCount = useMemo(
    () => items.filter((d) => d.status !== "active").length,
    [items],
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter === "active" && item.status !== "active") return false;
      if (statusFilter === "expired" && item.status === "active") return false;
      if (!q) return true;
      return (
        item.code.toLowerCase().includes(q) ||
        (item.label && item.label.toLowerCase().includes(q)) ||
        item.type.toLowerCase().includes(q)
      );
    });
  }, [items, search, statusFilter]);

  const pagination = useTablePagination(filteredItems);

  function openCreateDialog() {
    setDraft(EMPTY_DRAFT);
    setFormError("");
    setEditingId(null);
    setDialog("create");
  }

  function openEditDialog(item: DiscountItem) {
    setDraft({
      code: item.code,
      type: item.type,
      value: String(item.value),
      usageLimit: item.usageLimit ? String(item.usageLimit) : "",
      label: item.label || "",
    });
    setFormError("");
    setEditingId(item.id);
    setDialog("edit");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    const code = draft.code.trim().toUpperCase();
    if (!code) {
      setFormError("Promo code is required.");
      return;
    }

    const numericValue = parseFloat(draft.value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setFormError("Please enter a valid discount value greater than 0.");
      return;
    }

    if (draft.type === "percentage" && numericValue > 100) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }

    const usageLimit = draft.usageLimit.trim()
      ? parseInt(draft.usageLimit.trim(), 10)
      : null;

    if (usageLimit !== null && (isNaN(usageLimit) || usageLimit < 1)) {
      setFormError("Usage limit must be at least 1 or left blank for unlimited.");
      return;
    }

    setSubmitting(true);
    try {
      if (dialog === "create") {
        const created = await discountApiService.create({
          code,
          type: draft.type,
          value: numericValue,
          label: draft.label.trim() || `${code} Discount`,
          usageLimit,
          status: "active", // Default status is active when creating
        });

        setItems((prev) => [created, ...prev]);
        setFeedback({
          type: "success",
          text: `Discount code "${created.code}" created successfully!`,
        });
      } else if (dialog === "edit" && editingId) {
        const updated = await discountApiService.update(editingId, {
          code,
          type: draft.type,
          value: numericValue,
          label: draft.label.trim() || `${code} Discount`,
          usageLimit,
        });

        setItems((prev) =>
          prev.map((row) => (row.id === editingId ? updated : row)),
        );
        setFeedback({
          type: "success",
          text: `Discount code "${updated.code}" updated successfully!`,
        });
      }

      setDialog(null);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save discount.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(item: DiscountItem) {
    const nextStatus: DiscountStatus =
      item.status === "active" ? "expired" : "active";
    setBusyId(item.id);
    setFeedback(null);

    try {
      const updated = await discountApiService.update(item.id, {
        status: nextStatus,
      });

      setItems((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
      setFeedback({
        type: "success",
        text: `Discount "${updated.code}" marked as ${updated.status === "active" ? "Active" : "Expired"}.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to update discount status",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setFeedback(null);
    try {
      await discountApiService.delete(id);
      setItems((prev) => prev.filter((row) => row.id !== id));
      setFeedback({
        type: "success",
        text: "Discount deleted successfully.",
      });
      setConfirmDeleteId(null);
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to delete discount",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="container mx-auto px-6 py-8 lg:px-10 lg:py-12">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Growth
          </p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Discounts</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Create thoughtful festive promotions and seasonal offers (
            {loading ? "Loading..." : `${activeCount} active offers`}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadDiscounts}
            disabled={loading}
            className="inline-flex items-center gap-1.5 border border-border bg-white px-3.5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition hover:bg-stone-50 disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex items-center justify-center gap-2 bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-accent/90"
          >
            <Plus size={15} /> Create discount
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
              <span className="sr-only">Search discounts</span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  pagination.setPage(1);
                }}
                placeholder="Search promo code..."
                className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted-foreground sm:w-64"
              />
            </label>

            {/* Filter Tabs */}
            <div className="flex items-center border border-border bg-background p-0.5 text-xs">
              {(
                [
                  ["all", `All (${items.length})`],
                  ["active", `Active (${activeCount})`],
                  ["expired", `Expired (${expiredCount})`],
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
              : `${filteredItems.length} ${
                  filteredItems.length === 1 ? "record" : "records"
                }`}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">Code</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Discount</th>
                <th className="px-5 py-4 font-semibold">Uses</th>
                <th className="px-5 py-4 font-semibold">Status (Toggle)</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedItems.map((item) => {
                const isActive = item.status === "active";
                const isBusy = busyId === item.id;
                const formattedValue =
                  item.type === "percentage"
                    ? `${item.value}%`
                    : `Rs. ${Number(item.value).toLocaleString("en-IN")}`;
                const usageDisplay = `${item.timesUsed ?? 0} / ${
                  item.usageLimit || "∞"
                }`;

                return (
                  <tr
                    key={item.id}
                    className="border-t border-border text-muted-foreground transition hover:bg-stone-50/60"
                  >
                    {/* Code */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold tracking-wide text-primary">
                          {item.code}
                        </span>
                        {item.label && (
                          <span className="hidden text-xs text-muted-foreground sm:inline">
                            — {item.label}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-sm bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                        {item.type === "percentage" ? (
                          <>
                            <Percent size={11} className="text-stone-500" />
                            Percentage
                          </>
                        ) : (
                          <>
                            <Tag size={11} className="text-stone-500" />
                            Fixed amount
                          </>
                        )}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-5 py-4 font-medium text-primary">
                      {formattedValue}
                    </td>

                    {/* Uses */}
                    <td className="px-5 py-4 text-xs font-medium text-stone-600">
                      {usageDisplay}
                    </td>

                    {/* Status with Direct Interactive Toggle */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => toggleStatus(item)}
                        title={`Click to mark as ${
                          isActive ? "Expired" : "Active"
                        }`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition disabled:opacity-50 cursor-pointer ${
                          isActive
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        {isBusy ? "Updating..." : isActive ? "Active" : "Expired"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(item)}
                          disabled={isBusy}
                          title="Edit discount"
                          className="border border-border p-1.5 text-stone-500 transition hover:border-primary hover:text-primary disabled:opacity-50"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          disabled={isBusy}
                          title="Delete discount"
                          className="border border-border p-1.5 text-stone-500 transition hover:border-accent hover:text-accent disabled:opacity-50"
                        >
                          <Trash2 size={14} />
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
            Loading discounts...
          </p>
        )}
        {!loading && !filteredItems.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search ? `No discounts match "${search}".` : "No discounts found."}
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
          itemLabel="discounts"
        />
      </div>

      {/* Create / Edit Dialog Modal */}
      {dialog && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) setDialog(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="discount-dialog-title"
            className="w-full max-w-md bg-white p-6 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  Discounts
                </p>
                <h2
                  id="discount-dialog-title"
                  className="mt-1 font-serif text-2xl text-primary"
                >
                  {dialog === "create" ? "Create discount" : "Edit discount"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDialog(null)}
                disabled={submitting}
                aria-label="Close form"
                className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error in Dialog */}
            {formError && (
              <div className="mt-4 flex items-start gap-2 border border-accent/30 bg-accent/10 p-3 text-xs text-accent">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              {/* Promo Code */}
              <label className="text-xs font-medium text-foreground/90">
                Promo code *
                <input
                  required
                  type="text"
                  value={draft.code}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                    }))
                  }
                  placeholder="e.g. FESTIVE15"
                  className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 font-mono text-sm uppercase tracking-wider outline-none focus:border-accent"
                />
              </label>

              {/* Type Dropdown (Requested: Select instead of free text) */}
              <label className="text-xs font-medium text-foreground/90">
                Type (Percentage or Fixed amount) *
                <div className="relative mt-1.5">
                  <select
                    value={draft.type}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        type: e.target.value as DiscountType,
                      }))
                    }
                    className="w-full appearance-none border border-input bg-white px-3 py-2.5 pr-8 text-sm text-primary outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed amount (₹)</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                </div>
              </label>

              {/* Value Input */}
              <label className="text-xs font-medium text-foreground/90">
                Value (
                {draft.type === "percentage"
                  ? "e.g. 15 for 15%"
                  : "e.g. 500 for Rs. 500"}
                ) *
                <div className="relative mt-1.5">
                  <input
                    required
                    type="number"
                    min="1"
                    max={draft.type === "percentage" ? "100" : undefined}
                    step="any"
                    value={draft.value}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, value: e.target.value }))
                    }
                    placeholder={draft.type === "percentage" ? "15" : "500"}
                    className="w-full border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    {draft.type === "percentage" ? "%" : "₹"}
                  </span>
                </div>
              </label>

              {/* Usage Limit */}
              <label className="text-xs font-medium text-foreground/90">
                Usage limit (leave empty for unlimited)
                <input
                  type="number"
                  min="1"
                  value={draft.usageLimit}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      usageLimit: e.target.value,
                    }))
                  }
                  placeholder="e.g. 100"
                  className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
                />
              </label>

              {/* Note: Status has been REMOVED from the form as requested */}

              {/* Form Buttons */}
              <div className="mt-3 flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setDialog(null)}
                  className="border border-input px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-accent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white transition hover:bg-accent/90 disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : dialog === "create"
                    ? "Create discount"
                    : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busyId) {
              setConfirmDeleteId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-sm bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-accent">
              <AlertCircle size={22} />
              <h3
                id="delete-dialog-title"
                className="font-serif text-xl text-primary"
              >
                Delete Discount
              </h3>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete this discount code?
              Customers will no longer be able to use it at checkout.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => setConfirmDeleteId(null)}
                className="border border-input px-4 py-2 text-[10px] uppercase tracking-wider text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => handleDelete(confirmDeleteId)}
                className="bg-accent px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-accent/90 disabled:opacity-50"
              >
                {busyId === confirmDeleteId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
