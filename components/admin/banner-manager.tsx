"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";
import { bannerApiService } from "@/src/lib/api/services/banner-service";
import type { BannerStatus, StoreBanner } from "@/src/lib/store/banners";

type BannerDraft = {
  image: string;
  order: number;
  status: BannerStatus;
};

function sortByOrder(list: StoreBanner[]): StoreBanner[] {
  return [...list].sort((a, b) => a.order - b.order);
}

export function BannerManager({
  initialBanners,
}: {
  initialBanners: StoreBanner[];
}) {
  const router = useRouter();
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [banners, setBanners] = useState<StoreBanner[]>(() =>
    sortByOrder(initialBanners),
  );
  const [statusFilter, setStatusFilter] = useState<"all" | BannerStatus>("all");
  const [dialog, setDialog] = useState<"add" | "edit" | "view" | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BannerDraft>({
    image: "",
    order: 1,
    status: "active",
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    setBanners(sortByOrder(initialBanners));
  }, [initialBanners]);

  useEffect(() => {
    if (!dialog) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDialog(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog]);

  const activeCount = useMemo(
    () => banners.filter((banner) => banner.status === "active").length,
    [banners],
  );
  const inactiveCount = banners.length - activeCount;

  const visibleBanners = useMemo(() => {
    if (statusFilter === "all") return banners;
    return banners.filter((banner) => banner.status === statusFilter);
  }, [banners, statusFilter]);

  const pagination = useTablePagination(visibleBanners);

  const activeBanner = useMemo(
    () => banners.find((banner) => banner.id === activeId),
    [banners, activeId],
  );

  function startAdd() {
    setFeedback(null);
    setUploadError("");
    setActiveId(null);
    const nextOrder =
      banners.reduce((max, item) => Math.max(max, item.order), 0) + 1;
    setDraft({
      image: "",
      order: nextOrder,
      status: "active",
    });
    setDialog("add");
  }

  function startEdit(banner: StoreBanner) {
    setFeedback(null);
    setUploadError("");
    setActiveId(banner.id);
    setDraft({
      image: banner.image,
      order: banner.order,
      status: banner.status,
    });
    setDialog("edit");
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploading(true);
    try {
      const url = await bannerApiService.uploadImage(file);
      setDraft((prev) => ({ ...prev, image: url }));
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Could not upload banner image",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.image.trim()) {
      setUploadError("Please upload a banner image.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    setUploadError("");

    const orderValue = Math.max(1, Math.floor(Number(draft.order) || 1));

    try {
      if (dialog === "edit" && activeId) {
        const updated = await bannerApiService.update(activeId, {
          image: draft.image,
          order: orderValue,
          status: draft.status,
        });
        setBanners((prev) =>
          sortByOrder(
            prev.map((item) => (item.id === updated.id ? updated : item)),
          ),
        );
        setFeedback({
          type: "success",
          text: `Banner updated (order #${updated.order}, ${updated.status}).`,
        });
      } else {
        const created = await bannerApiService.create({
          image: draft.image,
          order: orderValue,
          status: draft.status,
        });
        setBanners((prev) => sortByOrder([...prev, created]));
        setFeedback({
          type: "success",
          text: `Banner uploaded (order #${created.order}, ${created.status}).`,
        });
      }
      setDialog(null);
      router.refresh();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to save banner",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMove(bannerId: string, direction: "up" | "down") {
    setBusyId(bannerId);
    setFeedback(null);
    try {
      const reordered = await bannerApiService.move(bannerId, direction);
      setBanners(sortByOrder(reordered));
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to reorder banner",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleStatus(banner: StoreBanner) {
    const nextStatus: BannerStatus =
      banner.status === "active" ? "inactive" : "active";
    setBusyId(banner.id);
    setFeedback(null);
    try {
      const updated = await bannerApiService.update(banner.id, {
        status: nextStatus,
      });
      setBanners((prev) =>
        sortByOrder(
          prev.map((item) => (item.id === updated.id ? updated : item)),
        ),
      );
      setFeedback({
        type: "success",
        text: `Banner marked as ${updated.status}.`,
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error ? error.message : "Could not update status",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(bannerId: string) {
    setBusyId(bannerId);
    setFeedback(null);
    try {
      const removed = await bannerApiService.remove(bannerId);
      setBanners((prev) => prev.filter((item) => item.id !== removed.id));
      if (activeId === bannerId) setDialog(null);
      setConfirmDeleteId(null);
      setFeedback({
        type: "success",
        text: "Banner deleted.",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error ? error.message : "Could not delete banner",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleReset() {
    setFeedback(null);
    try {
      const defaults = await bannerApiService.reset();
      setBanners(sortByOrder(defaults));
      setFeedback({
        type: "success",
        text: "Default homepage banner restored.",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Reset failed",
      });
    }
  }

  return (
    <section className="container mx-auto px-4 py-7 sm:px-6 lg:py-10">
      <div className="flex flex-col justify-between gap-5 border-b border-[#dfd8cf] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a44436]">
            Storefront · Hero showcase
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#39231e]">Banners</h1>
          <p className="mt-2 max-w-xl text-sm text-[#77675d]">
            Upload 16:9 homepage banner images, set display order, and control
            active visibility.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 border border-[#dfd8cf] bg-white px-3.5 py-3 text-xs font-medium text-[#39231e] transition hover:border-[#39231e]"
          >
            <ExternalLink size={14} /> View homepage
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 border border-[#dfd8cf] bg-white px-3 py-3 text-xs text-[#77675d] transition hover:border-[#8d3428]"
          >
            <RotateCcw size={14} /> Reset default
          </button>
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center justify-center gap-2 bg-[#8d3428] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#70281f]"
          >
            <Plus size={15} /> Add banner
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`mt-5 flex items-center justify-between border px-4 py-3 text-xs ${
            feedback.type === "error"
              ? "border-[#e6c3bd] bg-[#fdf2f0] text-[#8d3428]"
              : "border-[#c4dfd1] bg-[#eef7f2] text-[#168252]"
          }`}
        >
          <span className="flex items-center gap-2 font-medium">
            {feedback.type === "success" && <CheckCircle2 size={15} />}
            {feedback.text}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss notification"
            className="p-1 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="mt-7 overflow-hidden border border-[#dfd8cf] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8e0] p-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["all", `All (${banners.length})`],
                ["active", `Active (${activeCount})`],
                ["inactive", `Inactive (${inactiveCount})`],
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
                  className={`px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? "bg-[#39231e] text-white"
                      : "border border-[#dfd8cf] bg-[#faf7f3] text-[#5f5750] hover:border-[#39231e]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-[#9b8d80]">
            Recommended aspect ratio: 16:9 · Lowest order displays first
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#faf7f3] text-[10px] uppercase tracking-[0.12em] text-[#a48668]">
              <tr>
                {[
                  "Order",
                  "Banner Image",
                  "Last Updated",
                  "Status",
                  "Actions",
                ].map((label) => (
                  <th key={label} className="px-4 py-4 font-semibold sm:px-5">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedItems.map((banner, idx) => {
                const isActive = banner.status === "active";
                const isBusy = busyId === banner.id;
                const globalIndex = banners.findIndex(
                  (item) => item.id === banner.id,
                );
                const canMoveUp = globalIndex > 0;
                const canMoveDown =
                  globalIndex !== -1 && globalIndex < banners.length - 1;

                return (
                  <tr
                    key={banner.id}
                    className="border-t border-[#eee8e0] text-[#5f5750]"
                  >
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="min-w-8 font-mono text-xs font-semibold text-[#39231e]">
                          #{banner.order}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={isBusy || !canMoveUp}
                            onClick={() => handleMove(banner.id, "up")}
                            aria-label={`Move banner #${banner.order} up`}
                            title="Move up"
                            className="border border-[#e4dbd1] p-1 text-[#5f5750] hover:border-[#8d3428] hover:text-[#39231e] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy || !canMoveDown}
                            onClick={() => handleMove(banner.id, "down")}
                            aria-label={`Move banner #${banner.order} down`}
                            title="Move down"
                            className="border border-[#e4dbd1] p-1 text-[#5f5750] hover:border-[#8d3428] hover:text-[#39231e] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-4">
                        <div className="relative aspect-video w-40 shrink-0 overflow-hidden border border-[#e8ded2] bg-[#f3ece2]">
                          <BlogCoverImage
                            src={banner.image}
                            alt={`Banner ${idx + 1}`}
                            sizes="160px"
                            className="object-cover"
                          />
                        </div>
                        <span className="max-w-xs truncate font-mono text-[11px] text-[#77675d]">
                          {banner.image.startsWith("data:")
                            ? "Uploaded image"
                            : banner.image}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#77675d] sm:px-5">
                      {banner.updatedAt.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => toggleStatus(banner)}
                        title={`Click to mark as ${isActive ? "Inactive" : "Active"}`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition disabled:opacity-50 ${
                          isActive
                            ? "bg-[#e8f4ec] text-[#168252] hover:bg-[#d7ecd9]"
                            : "bg-[#f2efeb] text-[#77675d] hover:bg-[#e5dfd7]"
                        }`}
                      >
                        {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        {isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveId(banner.id);
                            setDialog("view");
                          }}
                          aria-label="Preview banner"
                          title="Preview"
                          className="border border-[#e4dbd1] p-2 hover:border-[#8d3428]"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(banner)}
                          aria-label="Edit banner"
                          title="Edit"
                          className="border border-[#e4dbd1] p-2 hover:border-[#8d3428]"
                        >
                          <Pencil size={15} />
                        </button>
                        {confirmDeleteId === banner.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDelete(banner.id)}
                              className="bg-[#a44436] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="border border-[#e4dbd1] px-2 py-1.5 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(banner.id)}
                            aria-label="Delete banner"
                            title="Delete"
                            className="border border-[#e4dbd1] p-2 text-[#a44436] hover:border-[#a44436]"
                          >
                            <Trash2 size={15} />
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

        {!visibleBanners.length && (
          <p className="p-8 text-center text-sm text-[#77675d]">
            No banners found for this filter.
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
          itemLabel="banners"
        />
      </div>

      {dialog && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#201915]/55 sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="banner-dialog-title"
            className="max-h-[92vh] w-full overflow-y-auto bg-[#fffdf9] p-5 sm:max-w-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#e8ded2] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#a44436]">
                  Homepage Banner
                </p>
                <h2
                  id="banner-dialog-title"
                  className="mt-1 font-serif text-2xl text-[#39231e]"
                >
                  {dialog === "add"
                    ? "Upload banner image"
                    : dialog === "edit"
                      ? "Update banner"
                      : "Banner preview"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDialog(null)}
                aria-label="Close dialog"
                className="p-2 text-[#77675d] hover:text-[#39231e]"
              >
                <X size={18} />
              </button>
            </div>

            {dialog === "view" && activeBanner ? (
              <div className="mt-5">
                <div className="relative aspect-video w-full overflow-hidden border border-[#e8ded2] bg-[#f3ece2]">
                  <BlogCoverImage
                    src={activeBanner.image}
                    alt="Majisavesh banner preview"
                    sizes="(max-width: 768px) 100vw, 680px"
                    className="object-cover"
                  />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="border border-[#e8ded2] bg-[#faf7f3] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#39231e]">
                      Order #{activeBanner.order}
                    </span>
                    <span
                      className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        activeBanner.status === "active"
                          ? "bg-[#e8f4ec] text-[#168252]"
                          : "bg-[#f2efeb] text-[#77675d]"
                      }`}
                    >
                      {activeBanner.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(activeBanner)}
                    className="bg-[#39231e] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
                  >
                    Edit banner
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#4b3c33]">
                      Banner Image (16:9 ratio recommended) *
                    </span>
                    <div>
                      <input
                        ref={uploadInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => uploadInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 border border-[#39231e] bg-white px-3 py-2 text-xs font-medium text-[#39231e] transition hover:bg-[#39231e] hover:text-white disabled:opacity-50"
                      >
                        <Upload size={13} />
                        {uploading
                          ? "Uploading..."
                          : draft.image
                            ? "Change image"
                            : "Upload image"}
                      </button>
                    </div>
                  </div>

                  {draft.image ? (
                    <div className="relative aspect-video w-full overflow-hidden border border-[#ded3c7] bg-[#f3ece2]">
                      <BlogCoverImage
                        src={draft.image}
                        alt="Banner preview"
                        sizes="(max-width: 768px) 100vw, 680px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => uploadInputRef.current?.click()}
                      className="flex aspect-video w-full flex-col items-center justify-center gap-2 border border-dashed border-[#c9b9a7] bg-[#faf7f3] px-4 text-center text-xs text-[#77675d] transition hover:border-[#8d3428] hover:text-[#39231e]"
                    >
                      <Upload size={22} className="text-[#a44436]" />
                      <span className="font-medium text-[#39231e]">
                        {uploading
                          ? "Uploading banner image..."
                          : "Click to upload 16:9 homepage banner image"}
                      </span>
                      <span className="text-[11px] text-[#9b8d80]">
                        PNG, JPG, WEBP or AVIF · Max 4 MB
                      </span>
                    </button>
                  )}

                  {uploadError && (
                    <p className="mt-2 text-xs text-[#a44436]">{uploadError}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-[#4b3c33]">
                    Display Order *
                    <input
                      type="number"
                      min={1}
                      required
                      value={draft.order}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          order: Math.max(1, Number(event.target.value) || 1),
                        }))
                      }
                      className="mt-1.5 w-full border border-[#ded3c7] bg-white px-3 py-2.5 text-sm text-[#33251f] outline-none focus:border-[#8d3428]"
                    />
                  </label>

                  <div className="text-xs font-medium text-[#4b3c33]">
                    <span>Status *</span>
                    <div className="mt-1.5 grid grid-cols-2 border border-[#ded3c7] bg-white p-1">
                      {(["active", "inactive"] as const).map((statusOption) => {
                        const selected = draft.status === statusOption;
                        return (
                          <button
                            key={statusOption}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                status: statusOption,
                              }))
                            }
                            className={`py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                              selected
                                ? statusOption === "active"
                                  ? "bg-[#168252] text-white"
                                  : "bg-[#77675d] text-white"
                                : "text-[#77675d] hover:text-[#39231e]"
                            }`}
                          >
                            {statusOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#e8ded2] pt-4">
                  <button
                    type="button"
                    onClick={() => setDialog(null)}
                    className="border border-[#ded3c7] bg-white px-4 py-2.5 text-xs font-medium text-[#5f5750]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="bg-[#8d3428] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#70281f] disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : dialog === "edit"
                        ? "Save banner"
                        : "Add banner"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
