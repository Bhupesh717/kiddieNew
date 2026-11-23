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
  CheckCircle2,
  Eye,
  EyeOff,
  FolderTree,
  Layers,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Ruler,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";
import { blogApiService } from "@/src/lib/api/services/blog-service";
import { masterApiService } from "@/src/lib/api/services/master-service";
import {
  MASTER_META,
  MASTER_TYPES,
  slugifyMasterName,
  type MasterItem,
  type MasterStatus,
  type MasterType,
} from "@/src/lib/store/masters";

type MasterDraft = {
  name: string;
  slug: string;
  categorySlug?: string;
  colorCode?: string;
  description: string;
  image: string;
  status: MasterStatus;
};

function createEmptyDraft(type: MasterType): MasterDraft {
  return {
    name: "",
    slug: "",
    categorySlug: type === "size" ? "kids" : "",
    colorCode: type === "color" ? "#800020" : "",
    description: "",
    image: "",
    status: "active",
  };
}

const MASTER_ICONS: Record<MasterType, typeof Layers> = {
  category: Layers,
  subcategory: FolderTree,
  color: Palette,
  size: Ruler,
  fabric: Sparkles,
  tag: Tag,
};

export function MasterManager({
  type,
  initialItems,
}: {
  type: MasterType;
  initialItems: MasterItem[];
}) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const meta = MASTER_META[type];

  const [items, setItems] = useState<MasterItem[]>(initialItems ?? []);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MasterStatus>("all");
  const [dialog, setDialog] = useState<"add" | "edit" | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);
  const [draft, setDraft] = useState<MasterDraft>(() => createEmptyDraft(type));
  const [parentCategories, setParentCategories] = useState<MasterItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string>("");
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const loadLiveItems = () => {
    setLoading(true);
    masterApiService
      .list(type, "all", true)
      .then((live) => {
        if (!Array.isArray(live)) {
          setItems([]);
          return;
        }
        const seen = new Set<string>();
        const unique = live.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setItems(unique);
      })
      .catch((err) => {
        console.error("Failed to load admin master items", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLiveItems();
    if (type === "subcategory") {
      masterApiService
        .list("category", "all", true)
        .then((cats) => {
          if (Array.isArray(cats)) setParentCategories(cats);
        })
        .catch(() => {});
    }
  }, [type]);

  useEffect(() => {
    if (!dialog) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDialog(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog]);

  const activeCount = useMemo(
    () => items.filter((item) => item.status === "active").length,
    [items],
  );
  const inactiveCount = items.length - activeCount;

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!q) return true;
      return `${item.name} ${item.slug} ${item.description}`
        .toLowerCase()
        .includes(q);
    });
  }, [items, search, statusFilter]);

  const pagination = useTablePagination(visibleItems);

  function startAdd() {
    setFeedback(null);
    setModalError("");
    setActiveId(null);
    setSlugLocked(false);
    setDraft(createEmptyDraft(type));
    setDialog("add");
  }

  function startEdit(item: MasterItem) {
    setFeedback(null);
    setModalError("");
    setActiveId(item.id);
    setSlugLocked(true);
    setDraft({
      name: item.name,
      slug: item.slug,
      categorySlug: item.categorySlug ?? "",
      colorCode: item.colorCode || item.color_code || "#800020",
      description: item.description,
      image: item.image ?? "",
      status: item.status,
    });
    setDialog("edit");
  }

  function handleNameChange(value: string) {
    setDraft((prev) => ({
      ...prev,
      name: value,
      slug: slugLocked ? prev.slug : slugifyMasterName(value),
    }));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setModalError("");

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
      setModalError(
        "Invalid file type. Only PNG, JPG, WEBP, and AVIF images are supported.",
      );
      event.target.value = "";
      return;
    }

    // Validate file size (max 5 MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
      setModalError(
        `Selected image is ${sizeInMb} MB. Maximum allowed upload size is 5 MB.`,
      );
      event.target.value = "";
      return;
    }

    // Validate image dimensions and aspect ratio (Category requires 4:5 Portrait)
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

      if (type === "category" && dimensions.height > 0) {
        const ratio = dimensions.width / dimensions.height;
        // 4:5 ratio is 0.80. Reject if ratio > 0.90 (landscape or square) or < 0.65
        if (ratio > 0.90 || ratio < 0.65) {
          const orientation =
            ratio > 1.35
              ? "16:9 Landscape"
              : ratio > 1.0
              ? "Landscape"
              : "Square/Narrow";
          setModalError(
            `Invalid aspect ratio! Category cover image must be in 4:5 portrait ratio (recommended: 800×1000px). Selected image is ${dimensions.width}×${dimensions.height} (${orientation}, ratio ${ratio.toFixed(2)}:1). Please select a vertical 4:5 image.`,
          );
          event.target.value = "";
          return;
        }
      }
    } catch {
      // If browser fails decoding, let backend validator handle it
    }

    setUploadingImage(true);
    setFeedback(null);
    try {
      const url = await masterApiService.uploadImage(type, file);
      setDraft((prev) => ({ ...prev, image: url }));
    } catch (error) {
      setModalError(
        error instanceof Error ? error.message : "Image upload failed",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    setModalError("");

    const targetName = draft.name.trim();
    const targetSlug = (
      draft.slug.trim() || slugifyMasterName(draft.name)
    ).toLowerCase();

    // Required and length validation for name
    if (!targetName) {
      setModalError(`${meta.label} name is required.`);
      setSubmitting(false);
      return;
    }
    if (targetName.length < 2) {
      setModalError(`${meta.label} name must be at least 2 characters.`);
      setSubmitting(false);
      return;
    }
    if (targetName.length > 100) {
      setModalError(`${meta.label} name cannot exceed 100 characters.`);
      setSubmitting(false);
      return;
    }

    // Slug format validation
    if (!targetSlug) {
      setModalError("Slug is required.");
      setSubmitting(false);
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(targetSlug)) {
      setModalError(
        "Slug must contain only lowercase letters, numbers, and hyphens (e.g. boys-wear).",
      );
      setSubmitting(false);
      return;
    }

    // Category-specific cover image validation
    if (type === "category" && !draft.image.trim()) {
      setModalError(
        "Category cover image is required for the storefront category slider. Please upload or provide an image (4:5 ratio recommended).",
      );
      setSubmitting(false);
      return;
    }

    // Description length validation
    if (draft.description.trim().length > 500) {
      setModalError("Description cannot exceed 500 characters.");
      setSubmitting(false);
      return;
    }

    // Client-side Unique Name validation
    const duplicateName = items.find(
      (item) =>
        item.id !== activeId &&
        item.name.trim().toLowerCase() === targetName.toLowerCase(),
    );
    if (duplicateName) {
      setModalError(
        `A ${meta.label.toLowerCase()} with the name "${targetName}" already exists. Please choose a unique name.`,
      );
      setSubmitting(false);
      return;
    }

    // Client-side Unique Slug validation
    const duplicateSlug = items.find(
      (item) =>
        item.id !== activeId &&
        item.slug.trim().toLowerCase() === targetSlug,
    );
    if (duplicateSlug) {
      setModalError(
        `A ${meta.label.toLowerCase()} with the slug "${targetSlug}" already exists. Please choose a unique slug.`,
      );
      setSubmitting(false);
      return;
    }

    const payload = {
      name: targetName,
      slug: targetSlug,
      categorySlug:
        type === "subcategory" || type === "size"
          ? draft.categorySlug
          : undefined,
      colorCode: type === "color" ? draft.colorCode : undefined,
      description: draft.description.trim(),
      ...(meta.supportsImage ? { image: draft.image.trim() } : {}),
      status: draft.status,
    };

    try {
      if (dialog === "edit" && activeId) {
        const updated = await masterApiService.update(type, activeId, payload);
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        setFeedback({
          type: "success",
          text: `${meta.label} "${updated.name}" updated (${updated.status}).`,
        });
      } else {
        const created = await masterApiService.create(type, payload);
        setItems((prev) => [created, ...prev]);
        setFeedback({
          type: "success",
          text: `${meta.label} "${created.name}" added (${created.status}).`,
        });
      }
      setDialog(null);
      router.refresh();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : `Could not save ${meta.label.toLowerCase()}`;
      setModalError(msg);
      setFeedback({
        type: "error",
        text: msg,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(item: MasterItem) {
    const nextStatus: MasterStatus =
      item.status === "active" ? "inactive" : "active";
    setBusyId(item.id);
    setFeedback(null);
    try {
      const updated = await masterApiService.update(type, item.id, {
        status: nextStatus,
      });
      setItems((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
      setFeedback({
        type: "success",
        text: `"${updated.name}" marked as ${updated.status}.`,
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update status",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(itemId: string) {
    setBusyId(itemId);
    setFeedback(null);
    try {
      const removed = await masterApiService.remove(type, itemId);
      setItems((prev) => prev.filter((item) => item.id !== removed.id));
      setConfirmDeleteId(null);
      setFeedback({
        type: "success",
        text: `${meta.label} "${removed.name}" deleted.`,
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Could not delete item",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleReset() {
    setFeedback(null);
    loadLiveItems();
  }

  return (
    <section className="container mx-auto px-4 py-7 sm:px-6 lg:py-10">
      <nav
        aria-label="Master subfolders"
        className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-4"
      >
        <Link
          href="/admin/master"
          className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
        >
          Master
        </Link>
        <span className="text-muted-foreground/60">/</span>
        {MASTER_TYPES.map((masterType) => {
          const Icon = MASTER_ICONS[masterType];
          const isCurrent = masterType === type;
          return (
            <Link
              key={masterType}
              href={`/admin/master/${masterType}`}
              className={`inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs font-medium transition ${
                isCurrent
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-white text-muted-foreground hover:border-primary"
              }`}
            >
              <Icon size={13} />
              {MASTER_META[masterType].label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Master · {meta.label} management
          </p>
          <h1 className="mt-2 font-serif text-4xl text-primary">
            {meta.plural}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {meta.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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
            <Plus size={15} /> Add {meta.label}
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
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["all", `All (${items.length})`],
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

          <label className="flex items-center gap-2 border border-border px-3 py-2 text-sm text-muted-foreground">
            <Search size={15} />
            <span className="sr-only">Search {meta.plural}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                pagination.setPage(1);
              }}
              placeholder={`Search ${meta.plural.toLowerCase()}...`}
              className="w-full bg-transparent text-sm text-primary outline-none sm:w-56"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-4 font-semibold sm:px-5">
                  {meta.label} Name
                </th>
                <th className="px-4 py-4 font-semibold sm:px-5">Slug</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Notes</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Status</th>
                <th className="px-4 py-4 font-semibold sm:px-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedItems.map((item) => {
                const isActive = item.status === "active";
                const isBusy = busyId === item.id;

                return (
                  <tr
                    key={`${item.id}-${item.slug}`}
                    className="border-t border-border text-muted-foreground"
                  >
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-3">
                        {meta.supportsImage && item.image && (
                          <div className="relative size-11 shrink-0 overflow-hidden border border-border bg-secondary">
                            <BlogCoverImage
                              src={item.image}
                              alt={item.name}
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        {type === "color" && (
                          <span
                            className="size-5 shrink-0 rounded-full border border-border shadow-xs"
                            style={{
                              backgroundColor:
                                item.colorCode || item.color_code || "#ccc",
                            }}
                            title={item.colorCode || item.color_code || ""}
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-primary">
                            {item.name}
                          </span>
                          {type === "color" &&
                            (item.colorCode || item.color_code) && (
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {item.colorCode || item.color_code}
                              </span>
                            )}
                          {type === "size" && item.categorySlug && (
                            <span className="text-[10px] font-medium uppercase tracking-wider text-accent">
                              Group: {item.categorySlug}
                            </span>
                          )}
                          {type === "subcategory" && item.categorySlug && (
                            <span className="text-[10px] font-medium uppercase tracking-wider text-accent">
                              Category: {item.categorySlug.replace(/-/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground sm:px-5">
                      {item.slug}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-xs text-muted-foreground sm:px-5">
                      {item.description || "—"}
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => toggleStatus(item)}
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
                          onClick={() => startEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className="border border-border p-2 hover:border-accent"
                        >
                          <Pencil size={15} />
                        </button>
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDelete(item.id)}
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
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label={`Delete ${item.name}`}
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
            Loading {meta.plural.toLowerCase()}...
          </p>
        )}
        {!loading && !visibleItems.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search
              ? `No ${meta.plural.toLowerCase()} match your search.`
              : `No ${meta.plural.toLowerCase()} created yet. Click "Add ${meta.label}" to add one.`}
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
          itemLabel={meta.plural.toLowerCase()}
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
            aria-labelledby="master-dialog-title"
            className="max-h-[92vh] w-full overflow-y-auto bg-popover p-5 sm:max-w-lg sm:p-7"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  Master · {meta.label}
                </p>
                <h2
                  id="master-dialog-title"
                  className="mt-1 font-serif text-2xl text-primary"
                >
                  {dialog === "add"
                    ? `Add ${meta.label}`
                    : `Edit ${meta.label}`}
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

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {modalError && (
                <div className="flex items-start gap-2.5 rounded-sm border border-red-200 bg-red-50 p-3 text-xs text-red-800 animate-in fade-in">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Validation Error</p>
                    <p className="mt-0.5 text-red-700 leading-relaxed">{modalError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalError("")}
                    className="text-red-400 hover:text-red-700"
                    aria-label="Close error"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <label className="block text-xs font-medium text-foreground/90">
                {meta.label} Name *
                <input
                  type="text"
                  required
                  value={draft.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder={meta.placeholderName}
                  className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                />
              </label>

              {(type === "color" || meta.supportsColorCode) && (
                <div className="space-y-2 rounded-xs border border-accent/20 bg-accent/5 p-3.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="color-picker-box"
                      className="block text-xs font-semibold text-primary flex items-center gap-1.5"
                    >
                      <Palette size={14} className="text-accent" />
                      Visual Color Box (Color Picker) &amp; Hex Code *
                    </label>
                    <span
                      className="size-4 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: draft.colorCode || "#800020" }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        id="color-picker-box"
                        type="color"
                        value={draft.colorCode || "#800020"}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            colorCode: event.target.value,
                          }))
                        }
                        className="h-11 w-14 cursor-pointer rounded-xs border-2 border-border bg-white p-1 shadow-sm transition hover:scale-105"
                      />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Click box to pick
                      </span>
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={draft.colorCode || ""}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            colorCode: event.target.value,
                          }))
                        }
                        placeholder="#800020"
                        className="w-full border border-input bg-white px-3 py-2.5 text-sm font-mono text-foreground outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {type === "size" && (
                <label className="block text-xs font-medium text-foreground/90">
                  <span>Size Group / Category</span>
                  <select
                    value={draft.categorySlug || "kids"}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        categorySlug: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-xs text-foreground outline-none focus:border-accent"
                  >
                    <option value="kids">
                      Kids Wear (e.g. 0-6M, 2-3Y, 4-5Y...)
                    </option>
                    <option value="apparel">
                      Men &amp; Women Apparel (e.g. XS, S, M, L, XL, XXL...)
                    </option>
                    <option value="bottoms">
                      Bottoms &amp; Waists (e.g. 28, 30, 32, 34, 36...)
                    </option>
                    <option value="accessories">Accessories / Free Size</option>
                  </select>
                </label>
              )}

              {type === "subcategory" && (
                <label className="block text-xs font-medium text-foreground/90">
                  <span>Parent Category</span>
                  <select
                    value={draft.categorySlug || ""}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        categorySlug: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-xs text-foreground outline-none focus:border-accent"
                  >
                    <option value="">
                      Select Parent Category (e.g. Kids Wear, Men, Women)
                    </option>
                    {parentCategories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name} ({cat.slug})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block text-xs font-medium text-foreground/90">
                Slug *
                <div className="mt-1.5 flex items-center border border-input bg-white">
                  <input
                    type="text"
                    required
                    value={draft.slug}
                    onChange={(event) => {
                      setSlugLocked(true);
                      setDraft((prev) => ({
                        ...prev,
                        slug: event.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-"),
                      }));
                    }}
                    className="w-full px-3 py-2.5 font-mono text-xs text-foreground outline-none"
                  />
                  <button
                    type="button"
                    title="Auto-generate slug from name"
                    onClick={() => {
                      setSlugLocked(false);
                      setDraft((prev) => ({
                        ...prev,
                        slug: slugifyMasterName(prev.name),
                      }));
                    }}
                    className="px-3 text-accent hover:opacity-75"
                  >
                    <Sparkles size={14} />
                  </button>
                </div>
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

              {meta.supportsImage && (
                <div className="border border-border bg-background p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-foreground/90">
                        Category Cover Image {type === "category" ? "*" : ""}
                      </span>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Recommended ratio: 4:5 (e.g. 800×1000px) · Max 5 MB
                      </p>
                    </div>
                    <div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => imageInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 border border-primary bg-white px-2.5 py-1.5 text-[11px] font-medium text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
                      >
                        <Upload size={12} />
                        {uploadingImage ? "Uploading..." : "Upload image"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden border border-input bg-secondary">
                      <BlogCoverImage
                        src={draft.image}
                        alt={draft.name || "Category image"}
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <input
                      type="text"
                      value={draft.image}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          image: event.target.value,
                        }))
                      }
                      placeholder="Paste image URL or click Upload"
                      className="w-full border border-input bg-white px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                    />
                  </div>
                </div>
              )}

              <label className="block text-xs font-medium text-foreground/90">
                Description / Notes
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder={meta.placeholderDesc}
                  className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                />
              </label>

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
                  disabled={submitting}
                  className="bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-accent/90 disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : dialog === "edit"
                      ? "Save changes"
                      : `Create ${meta.label.toLowerCase()}`}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
