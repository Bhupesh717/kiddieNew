"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";
import {
  transactionApiService,
  type AdminTransaction,
} from "@/src/lib/api/services/transaction-service";

type StatusTab = "all" | "success" | "pending" | "failed" | "refunded";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [selectedTxn, setSelectedTxn] = useState<AdminTransaction | null>(null);

  const fetchTransactions = () => {
    setLoading(true);
    transactionApiService
      .list()
      .then((data) => {
        setTransactions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load transactions", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const counts = useMemo(() => {
    return {
      all: transactions.length,
      success: transactions.filter((t) => t.status === "success").length,
      pending: transactions.filter((t) => t.status === "pending").length,
      failed: transactions.filter((t) => t.status === "failed").length,
      refunded: transactions.filter((t) => t.status === "refunded").length,
    };
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((item) => {
      if (activeTab !== "all" && item.status !== activeTab) return false;
      if (!q) return true;
      return (
        item.transactionId.toLowerCase().includes(q) ||
        item.orderReference.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        item.paymentMethod.toLowerCase().includes(q)
      );
    });
  }, [transactions, activeTab, search]);

  const pagination = useTablePagination(filtered, 12);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-success">
            <CheckCircle2 size={11} /> Success
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            <Clock size={11} /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-destructive">
            <XCircle size={11} /> Failed
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 bg-secondary/50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <AlertCircle size={11} /> Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-secondary/50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  return (
    <section className="container mx-auto px-4 py-7 sm:px-6 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Finance &amp; Ledger · KiddieQuick LLP
          </p>
          <h1 className="mt-2 font-serif text-3xl text-primary sm:text-4xl">
            Transactions
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Audit and track customer payments, gateway settlement IDs, payment
            methods, and refund logs in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex items-center gap-2 border border-input bg-white px-4 py-2.5 text-xs font-medium text-primary transition hover:bg-background disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="mt-7 flex flex-wrap gap-2 border-b border-border pb-4">
        {(
          [
            { key: "all", label: "All Transactions" },
            { key: "success", label: "Success / Paid" },
            { key: "pending", label: "Pending" },
            { key: "refunded", label: "Refunded" },
            { key: "failed", label: "Failed" },
          ] as const
        ).map(({ key, label }) => {
          const count = counts[key];
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveTab(key);
                pagination.setPage(1);
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted-foreground hover:bg-background hover:text-primary"
              }`}
            >
              <span>{label}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] font-semibold ${
                  active ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="mt-6 overflow-hidden border border-border bg-white">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 border border-border px-3 py-2 text-sm text-muted-foreground">
            <Search size={15} />
            <span className="sr-only">Search transactions</span>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                pagination.setPage(1);
              }}
              placeholder="Search TXN ID, Order #, Customer..."
              className="w-full bg-transparent text-sm text-primary outline-none sm:w-64"
            />
          </label>
          <span className="text-xs text-muted-foreground">
            Showing {filtered.length} of {transactions.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-4 font-semibold sm:px-5">TXN ID</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Order</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Customer</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Method / Gateway</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Amount</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Date</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Status</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Details</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedItems.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-t border-border text-muted-foreground transition hover:bg-background/50"
                >
                  <td className="px-4 py-3.5 font-mono text-xs font-medium text-primary sm:px-5">
                    {txn.transactionId}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <span className="font-mono text-xs font-semibold text-accent">
                      {txn.orderReference}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <div>
                      <p className="font-medium text-primary">{txn.customer}</p>
                      <p className="text-[11px] text-muted-foreground">{txn.phone || txn.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <div>
                      <p className="text-xs font-medium text-primary">
                        {txn.paymentMethod}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Via {txn.paymentGateway}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-primary sm:px-5">
                    {txn.formattedAmount}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground sm:px-5">
                    {txn.date}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    {getStatusBadge(txn.status)}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <button
                      type="button"
                      onClick={() => setSelectedTxn(txn)}
                      title="View Transaction Breakdown"
                      className="inline-flex items-center gap-1 border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-primary transition hover:border-accent hover:text-accent"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Loading transaction ledger...
          </p>
        )}

        {!loading && !filtered.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search
              ? "No transactions match your search query."
              : "No transactions found in this category."}
          </p>
        )}

        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startEntry={pagination.startEntry}
          endEntry={pagination.endEntry}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="transactions"
        />
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-lg border border-input bg-white p-6 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                  Transaction Receipt
                </p>
                <h3 className="mt-1 font-mono text-lg font-bold text-primary">
                  {selectedTxn.transactionId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 text-muted-foreground hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Status:</span>
                <div>{getStatusBadge(selectedTxn.status)}</div>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold text-sm text-primary">
                  {selectedTxn.formattedAmount}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Order Reference:</span>
                <span className="font-mono font-medium text-accent">
                  {selectedTxn.orderReference}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium text-primary">{selectedTxn.customer}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Contact:</span>
                <span className="text-primary">
                  {selectedTxn.phone || "—"} · {selectedTxn.email || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium text-primary">
                  {selectedTxn.paymentMethod} ({selectedTxn.paymentGateway})
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="text-primary">{selectedTxn.date}</span>
              </div>
              {selectedTxn.notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground">Audit Note:</span>
                  <p className="mt-1 bg-background p-2.5 text-muted-foreground border border-border">
                    {selectedTxn.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="bg-primary px-4 py-2 text-xs font-medium text-white transition hover:bg-primary/90"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
