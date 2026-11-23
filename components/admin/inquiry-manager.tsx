"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Archive,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MailCheck,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { getAuthHeaders } from "@/src/lib/api/auth-token";

type ContactInquiry = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  admin_notes?: string | null;
  created_at: string;
};

type NewsletterSubscriber = {
  id: number;
  email: string;
  status: string;
  source?: string | null;
  created_at: string;
};

type InquiryCounts = {
  total: number;
  new: number;
  read: number;
  replied: number;
};

type SubscriberCounts = {
  total: number;
  active: number;
  unsubscribed: number;
};

export function InquiryManager() {
  const [activeTab, setActiveTab] = useState<"inquiries" | "subscribers">("inquiries");

  // Inquiries State
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquiryCounts, setInquiryCounts] = useState<InquiryCounts>({ total: 0, new: 0, read: 0, replied: 0 });
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Subscribers State
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subscriberCounts, setSubscriberCounts] = useState<SubscriberCounts>({ total: 0, active: 0, unsubscribed: 0 });
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [copiedEmails, setCopiedEmails] = useState(false);

  useEffect(() => {
    fetchInquiries();
    fetchSubscribers();
  }, []);

  function fetchInquiries() {
    setLoadingInquiries(true);
    const params = new URLSearchParams();
    if (inquiryStatusFilter && inquiryStatusFilter !== "all") {
      params.set("status", inquiryStatusFilter);
    }
    if (inquirySearch.trim()) {
      params.set("q", inquirySearch.trim());
    }

    fetch(`/api/admin/inquiries?${params.toString()}`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setInquiries(res.data);
          if (res.meta?.counts) {
            setInquiryCounts(res.meta.counts);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInquiries(false));
  }

  function fetchSubscribers() {
    setLoadingSubscribers(true);
    const params = new URLSearchParams();
    if (subscriberSearch.trim()) {
      params.set("q", subscriberSearch.trim());
    }

    fetch(`/api/admin/subscribers?${params.toString()}`, {
      headers: getAuthHeaders(),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setSubscribers(res.data);
          if (res.meta?.counts) {
            setSubscriberCounts(res.meta.counts);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSubscribers(false));
  }

  async function handleUpdateStatus(id: number, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
        }
        // Refresh counts
        fetchInquiries();
      }
    } catch {
      alert("Failed to update status.");
    }
  }

  async function handleSaveNotes() {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ admin_notes: adminNotesInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setSelectedInquiry({ ...selectedInquiry, admin_notes: adminNotesInput.trim() });
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === selectedInquiry.id ? { ...item, admin_notes: adminNotesInput.trim() } : item
          )
        );
        alert("Admin notes saved successfully.");
      }
    } catch {
      alert("Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDeleteInquiry(id: number) {
    if (!confirm("Are you sure you want to permanently delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        fetchInquiries();
      }
    } catch {
      alert("Failed to delete inquiry.");
    }
  }

  async function handleDeleteSubscriber(id: number) {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
        fetchSubscribers();
      }
    } catch {
      alert("Failed to remove subscriber.");
    }
  }

  function handleCopyAllEmails() {
    const emails = subscribers.map((s) => s.email).filter(Boolean);
    if (emails.length === 0) return;
    navigator.clipboard.writeText(emails.join(", "));
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 3000);
  }

  function openDetailModal(inquiry: ContactInquiry) {
    setSelectedInquiry(inquiry);
    setAdminNotesInput(inquiry.admin_notes || "");
    // If it was 'new', mark as 'read' automatically
    if (inquiry.status === "new") {
      handleUpdateStatus(inquiry.id, "read");
    }
  }

  return (
    <section className="container mx-auto px-6 py-8 sm:px-8 lg:px-10 lg:py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Inquiries &amp; Newsletter Leads
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            View customer support inquiries from the contact form and audience leads from newsletter subscription.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchInquiries();
            fetchSubscribers();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-secondary"
        >
          <RefreshCw size={14} className={loadingInquiries || loadingSubscribers ? "animate-spin" : ""} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("inquiries")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "inquiries"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare size={15} />
          <span>Contact Queries ({inquiryCounts.total})</span>
          {inquiryCounts.new > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {inquiryCounts.new}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscribers")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "subscribers"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users size={15} />
          <span>Newsletter Subscribers ({subscriberCounts.total})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: CONTACT QUERIES
      ========================================================================= */}
      {activeTab === "inquiries" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Queries
              </span>
              <p className="mt-1 text-2xl font-bold text-primary">{inquiryCounts.total}</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                New / Unread
              </span>
              <p className="mt-1 text-2xl font-bold text-amber-900">{inquiryCounts.new}</p>
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">
                In Review / Read
              </span>
              <p className="mt-1 text-2xl font-bold text-sky-900">{inquiryCounts.read}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                Replied / Resolved
              </span>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{inquiryCounts.replied}</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {["all", "new", "read", "replied"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setInquiryStatusFilter(st);
                    setTimeout(() => fetchInquiries(), 0);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    inquiryStatusFilter === st
                      ? "bg-accent text-white shadow-sm"
                      : "border border-border bg-white text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {st === "all" ? "All Statuses" : st}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchInquiries();
              }}
              className="relative w-full sm:w-72"
            >
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                placeholder="Search by name, email, topic..."
                className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-xs outline-none transition focus:border-accent"
              />
            </form>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            {loadingInquiries ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-accent" />
              </div>
            ) : inquiries.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                <Inbox size={32} className="mx-auto text-muted-foreground/50" />
                <p className="mt-3 font-semibold text-primary">No contact inquiries found</p>
                <p className="mt-1">Inquiries submitted from the Contact Us page will show up here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Topic / Subject</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {inquiries.map((inq) => {
                      const badgeColors: Record<string, string> = {
                        new: "bg-amber-50 text-amber-700 border-amber-200",
                        read: "bg-sky-50 text-sky-700 border-sky-200",
                        replied: "bg-emerald-50 text-emerald-800 border-emerald-200",
                        archived: "bg-gray-100 text-gray-700 border-gray-200",
                      };

                      return (
                        <tr key={inq.id} className="transition hover:bg-secondary/20">
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-primary">{inq.name}</p>
                            <p className="text-[11px] text-muted-foreground">{inq.email}</p>
                            {inq.phone && (
                              <p className="text-[10px] font-mono text-muted-foreground">+91 {inq.phone}</p>
                            )}
                          </td>

                          <td className="px-4 py-3.5 font-medium text-foreground">
                            {inq.subject || "General inquiry"}
                          </td>

                          <td className="px-4 py-3.5 max-w-xs">
                            <p className="line-clamp-2 text-muted-foreground leading-relaxed">
                              {inq.message}
                            </p>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                badgeColors[inq.status] || "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              {inq.status === "new" && (
                                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                              )}
                              {inq.status}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                            {new Date(inq.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openDetailModal(inq)}
                                title="View inquiry details"
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-primary transition hover:border-accent hover:text-accent"
                              >
                                <Eye size={12} /> View
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteInquiry(inq.id)}
                                title="Delete inquiry"
                                className="rounded-md border border-border bg-white p-1 text-muted-foreground transition hover:border-red-200 hover:text-red-600"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: NEWSLETTER SUBSCRIBERS
      ========================================================================= */}
      {activeTab === "subscribers" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Subscribers
              </span>
              <p className="mt-1 text-2xl font-bold text-primary">{subscriberCounts.total}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                Active Subscribers
              </span>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{subscriberCounts.active}</p>
            </div>

            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Acquisition Channel
              </span>
              <p className="mt-1 text-xs font-semibold text-primary">Footer Newsletter Bar (100%)</p>
            </div>
          </div>

          {/* Search & Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchSubscribers();
              }}
              className="relative w-full sm:w-72"
            >
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                placeholder="Search subscriber email..."
                className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-xs outline-none transition focus:border-accent"
              />
            </form>

            <button
              type="button"
              onClick={handleCopyAllEmails}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent/90"
            >
              {copiedEmails ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedEmails ? "Copied to Clipboard!" : "Copy All Subscriber Emails"}</span>
            </button>
          </div>

          {/* Subscribers Table */}
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            {loadingSubscribers ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-accent" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                <Users size={32} className="mx-auto text-muted-foreground/50" />
                <p className="mt-3 font-semibold text-primary">No newsletter subscribers yet</p>
                <p className="mt-1">Visitors subscribing via the website footer newsletter form will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Subscriber Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Date Subscribed</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="transition hover:bg-secondary/20">
                        <td className="px-4 py-3.5 font-semibold text-primary">
                          {sub.email}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            ● {sub.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-muted-foreground capitalize">
                          {sub.source ? sub.source.replace(/_/g, " ") : "Website Footer"}
                        </td>

                        <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                          {new Date(sub.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            title="Unsubscribe / Delete"
                            className="rounded-md border border-border bg-white p-1 text-muted-foreground transition hover:border-red-200 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          INQUIRY DETAIL MODAL
      ========================================================================= */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Contact Inquiry #{selectedInquiry.id}
                </span>
                <h3 className="font-serif text-xl font-bold text-primary">
                  {selectedInquiry.subject || "Customer Inquiry"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Customer Contact Card */}
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-secondary/30 p-3.5 sm:grid-cols-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Sender
                  </span>
                  <p className="font-semibold text-primary">{selectedInquiry.name}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || "KiddieQuick Inquiry")}`}
                    className="flex items-center gap-1 font-semibold text-accent hover:underline"
                  >
                    <Mail size={12} /> {selectedInquiry.email}
                  </a>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Phone / WhatsApp
                  </span>
                  {selectedInquiry.phone ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="font-mono text-primary hover:text-accent"
                      >
                        +91 {selectedInquiry.phone}
                      </a>
                      <a
                        href={`https://wa.me/91${selectedInquiry.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-[10px]"
                      >
                        [WhatsApp]
                      </a>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Not provided</p>
                  )}
                </div>
              </div>

              {/* Message Body */}
              <div className="rounded-xl border border-border bg-white p-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Inquiry Message:
                </span>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">Status:</span>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleUpdateStatus(selectedInquiry.id, e.target.value)}
                    className="h-8 rounded-lg border border-border bg-white px-2.5 text-xs font-semibold uppercase tracking-wider outline-none focus:border-accent"
                  >
                    <option value="new">New</option>
                    <option value="read">In Review / Read</option>
                    <option value="replied">Replied / Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || "KiddieQuick Inquiry")}`}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, "replied")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent/90"
                  >
                    <Send size={13} />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>

              {/* Admin Notes Section */}
              <div className="border-t border-border pt-3">
                <label className="text-[11px] font-semibold text-muted-foreground block">
                  Internal Admin Notes
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder="Add private note (e.g. Called customer, resolved size question)..."
                    className="h-9 w-full rounded-lg border border-border bg-white px-3 text-xs outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    disabled={savingNotes}
                    onClick={handleSaveNotes}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-secondary px-3 text-xs font-semibold hover:bg-accent hover:text-white transition"
                  >
                    {savingNotes ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
