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
  AlertCircle,
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

  const [banners, setBanners] = useState<StoreBanner[]>(initialBanners ?? []);
  const [loading, setLoading] = useState(true);
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

  const loadLiveBanners = () => {
    setLoading(true);
    bannerApiService
      .list("all", true)
      .then((live) => {
        setBanners(Array.isArray(live) ? sortByOrder(live) : []);
      })
      .catch((err) => {
        console.error("Failed to fetch admin banners", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLiveBanners();
  }, []);

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

    // Validate file type
    const validMimes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/avif",
    ];
    if (
      !validMimes.includes(file.type.toLowerCase()) &&
      !/\.(png|jpe?g|webp|avif)$/i.test(file.name)
    ) {
      setUploadError(
        "Invalid file type. Only PNG, JPG, WEBP, and AVIF images are supported.",
      );
      return;
    }

    // Validate file size (5MB max)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(
        `Selected image is ${sizeInMb} MB. Maximum allowed upload size is 5 MB.`,
      );
      return;
    }

    // Validate aspect ratio (Banner requires 16:9 Widescreen Landscape)
    try {
      const dimensions = await new Promise<{ width: number; height: number }>(
        (resolve, reject) => {
          const img = new window.Image();
          const objectUrl = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Could not decode image to inspect dimensions."));
          };
          img.src = objectUrl;
        },
      );

      if (dimensions.height > 0) {
        const ratio = dimensions.width / dimensions.height;
        // 16:9 ratio is ~1.78. Reject if < 1.35 or > 2.25
        if (ratio < 1.35 || ratio > 2.25) {
          const orientation = dimensions.width < dimensions.height ? "Portrait" : "Square/Non-widescreen";
          setUploadError(
            `Invalid aspect ratio! Homepage banner must be in 16:9 widescreen landscape ratio (recommended: 1920×1080px or 1600×900px). Selected image is ${dimensions.width}×${dimensions.height} (${orientation}, ratio ${ratio.toFixed(2)}:1).`,
          );
          return;
        }
      }
    } catch {
      // Let backend validate if client decode fails
    }

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
    loadLiveBanners();
  }

  return (
    <section className="container mx-auto px-4 py-7 sm:px-6 lg:py-10">
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Storefront · Hero showcase
          </p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Banners</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Upload 16:9 homepage banner images, set display order, and control
            active visibility.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 border border-border bg-white px-3.5 py-3 text-xs font-medium text-primary transition hover:border-primary"
          >
            <ExternalLink size={14} /> View homepage
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 border border-border bg-white px-3 py-3 text-xs text-muted-foreground transition hover:border-accent"
          >
            <RotateCcw size={14} /> Refresh
          </button>
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center justify-center gap-2 bg-accent px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-accent/90"
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
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-success/30 bg-success/10 text-success"
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

      <div className="mt-7 overflow-hidden border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
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
                      ? "bg-primary text-white"
                      : "border border-border bg-background text-muted-foreground hover:border-primary"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground">
            Recommended aspect ratio: 16:9 · Lowest order displays first
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
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
                    className="border-t border-border text-muted-foreground"
                  >
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="min-w-8 font-mono text-xs font-semibold text-primary">
                          #{banner.order}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={isBusy || !canMoveUp}
                            onClick={() => handleMove(banner.id, "up")}
                            aria-label={`Move banner #${banner.order} up`}
                            title="Move up"
                            className="border border-border p-1 text-muted-foreground hover:border-accent hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy || !canMoveDown}
                            onClick={() => handleMove(banner.id, "down")}
                            aria-label={`Move banner #${banner.order} down`}
                            title="Move down"
                            className="border border-border p-1 text-muted-foreground hover:border-accent hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-4">
                        <div className="relative aspect-video w-40 shrink-0 overflow-hidden border border-border bg-secondary">
                          <BlogCoverImage
                            src={banner.image}
                            alt={`Banner ${idx + 1}`}
                            sizes="160px"
                            className="object-cover"
                          />
                        </div>
                        <span className="max-w-xs truncate font-mono text-[11px] text-muted-foreground">
                          {banner.image.startsWith("data:")
                            ? "Uploaded image"
                            : banner.image}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground sm:px-5">
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
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
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
                          className="border border-border p-2 hover:border-accent"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(banner)}
                          aria-label="Edit banner"
                          title="Edit"
                          className="border border-border p-2 hover:border-accent"
                        >
                          <Pencil size={15} />
                        </button>
                        {confirmDeleteId === banner.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDelete(banner.id)}
                              className="bg-accent px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="border border-border px-2 py-1.5 text-[10px]"
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
                            className="border border-border p-2 text-accent hover:border-accent"
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

        {loading && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Loading banners...
          </p>
        )}
        {!loading && !visibleBanners.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No banners uploaded yet. Click &ldquo;Add banner&rdquo; to create one.
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="banner-dialog-title"
            className="max-h-[92vh] w-full overflow-y-auto bg-popover p-5 sm:max-w-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  Homepage Banner
                </p>
                <h2
                  id="banner-dialog-title"
                  className="mt-1 font-serif text-2xl text-primary"
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
                className="p-2 text-muted-foreground hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {dialog === "view" && activeBanner ? (
              <div className="mt-5">
                <div className="relative aspect-video w-full overflow-hidden border border-border bg-secondary">
                  <BlogCoverImage
                    src={activeBanner.image}
                    alt="KiddieQuick banner preview"
                    sizes="(max-width: 768px) 100vw, 680px"
                    className="object-cover"
                  />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="border border-border bg-background px-2.5 py-1 font-mono text-[11px] font-semibold text-primary">
                      Order #{activeBanner.order}
                    </span>
                    <span
                      className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        activeBanner.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      {activeBanner.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(activeBanner)}
                    className="bg-primary px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
                  >
                    Edit banner
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground/90">
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
                        className="inline-flex items-center gap-1.5 border border-primary bg-white px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
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
                    <div className="relative aspect-video w-full overflow-hidden border border-input bg-secondary">
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
                      className="flex aspect-video w-full flex-col items-center justify-center gap-2 border border-dashed border-input bg-background px-4 text-center text-xs text-muted-foreground transition hover:border-accent hover:text-primary"
                    >
                      <Upload size={22} className="text-accent" />
                      <span className="font-medium text-primary">
                        {uploading
                          ? "Uploading banner image..."
                          : "Click to upload 16:9 homepage banner image"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        PNG, JPG, WEBP or AVIF · Max 5 MB
                      </span>
                    </button>
                  )}

                  {uploadError && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-sm border border-red-200 bg-red-50 p-3 text-xs text-red-800 animate-in fade-in">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-red-900">Upload Validation Error</p>
                        <p className="mt-0.5 text-red-700 leading-relaxed">{uploadError}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadError("")}
                        className="text-red-400 hover:text-red-700"
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-foreground/90">
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
                      className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                    />
                  </label>

                  <div className="text-xs font-medium text-foreground/90">
                    <span>Status *</span>
                    <div className="mt-1.5 grid grid-cols-2 border border-input bg-white p-1">
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
                                  ? "bg-success text-white"
                                  : "bg-muted-foreground text-white"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                          >
                            {statusOption}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setDialog(null)}
                    className="border border-input bg-white px-4 py-2.5 text-xs font-medium text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-accent/90 disabled:opacity-50"
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
