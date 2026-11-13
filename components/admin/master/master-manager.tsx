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
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Plus,
  RotateCcw,
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
  AVAILABLE_CATEGORY_IMAGES,
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
  description: string;
  image: string;
  status: MasterStatus;
};

function createEmptyDraft(type: MasterType): MasterDraft {
  return {
    name: "",
    slug: "",
    description: "",
    image: type === "category" ? AVAILABLE_CATEGORY_IMAGES[0].value : "",
    status: "active",
  };
}

const MASTER_ICONS: Record<MasterType, typeof Layers> = {
  category: Layers,
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

  const [items, setItems] = useState<MasterItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MasterStatus>("all");
  const [dialog, setDialog] = useState<"add" | "edit" | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);
  const [draft, setDraft] = useState<MasterDraft>(() => createEmptyDraft(type));

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

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
    setActiveId(null);
    setSlugLocked(false);
    setDraft(createEmptyDraft(type));
    setDialog("add");
  }

  function startEdit(item: MasterItem) {
    setFeedback(null);
    setActiveId(item.id);
    setSlugLocked(true);
    setDraft({
      name: item.name,
      slug: item.slug,
      description: item.description,
      image: item.image ?? AVAILABLE_CATEGORY_IMAGES[0].value,
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
    setUploadingImage(true);
    setFeedback(null);
    try {
      const url = await blogApiService.uploadImage(file);
      setDraft((prev) => ({ ...prev, image: url }));
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Image upload failed",
      });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const payload = {
      name: draft.name.trim(),
      slug: (draft.slug.trim() || slugifyMasterName(draft.name)).toLowerCase(),
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
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : `Could not save ${meta.label.toLowerCase()}`,
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
    try {
      const defaults = await masterApiService.reset(type);
      setItems(defaults);
      setFeedback({
        type: "success",
        text: `Default ${meta.plural.toLowerCase()} restored.`,
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
      <nav
        aria-label="Master subfolders"
        className="mb-6 flex flex-wrap items-center gap-2 border-b border-[#e8ded2] pb-4"
      >
        <Link
          href="/admin/master"
          className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#77675d] hover:text-[#39231e]"
        >
          Master
        </Link>
        <span className="text-[#c8b8a8]">/</span>
        {MASTER_TYPES.map((masterType) => {
          const Icon = MASTER_ICONS[masterType];
          const isCurrent = masterType === type;
          return (
            <Link
              key={masterType}
              href={`/admin/master/${masterType}`}
              className={`inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs font-medium transition ${
                isCurrent
                  ? "border-[#8d3428] bg-[#f7eee9] text-[#8d3428]"
                  : "border-[#dfd8cf] bg-white text-[#5f5750] hover:border-[#39231e]"
              }`}
            >
              <Icon size={13} />
              {MASTER_META[masterType].label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col justify-between gap-5 border-b border-[#dfd8cf] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a44436]">
            Master · {meta.label} management
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#39231e]">
            {meta.plural}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#77675d]">
            {meta.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 border border-[#dfd8cf] bg-white px-3 py-3 text-xs text-[#77675d] transition hover:border-[#8d3428]"
          >
            <RotateCcw size={14} /> Reset defaults
          </button>
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center justify-center gap-2 bg-[#8d3428] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#70281f]"
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
        <div className="flex flex-col gap-3 border-b border-[#eee8e0] p-4 sm:flex-row sm:items-center sm:justify-between">
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
                      ? "bg-[#39231e] text-white"
                      : "border border-[#dfd8cf] bg-[#faf7f3] text-[#5f5750] hover:border-[#39231e]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 border border-[#dfd8cf] px-3 py-2 text-sm text-[#a49a90]">
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
              className="w-full bg-transparent text-sm text-[#39231e] outline-none sm:w-56"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-[#faf7f3] text-[10px] uppercase tracking-[0.12em] text-[#a48668]">
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
                    key={item.id}
                    className="border-t border-[#eee8e0] text-[#5f5750]"
                  >
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-3">
                        {meta.supportsImage && item.image && (
                          <div className="relative size-11 shrink-0 overflow-hidden border border-[#e8ded2] bg-[#f2e9df]">
                            <BlogCoverImage
                              src={item.image}
                              alt={item.name}
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="font-medium text-[#39231e]">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#77675d] sm:px-5">
                      {item.slug}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-xs text-[#77675d] sm:px-5">
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
                          onClick={() => startEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className="border border-[#e4dbd1] p-2 hover:border-[#8d3428]"
                        >
                          <Pencil size={15} />
                        </button>
                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDelete(item.id)}
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
                            onClick={() => setConfirmDeleteId(item.id)}
                            aria-label={`Delete ${item.name}`}
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

        {!visibleItems.length && (
          <p className="p-8 text-center text-sm text-[#77675d]">
            No {meta.plural.toLowerCase()} match your search or status filter.
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#201915]/55 sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="master-dialog-title"
            className="max-h-[92vh] w-full overflow-y-auto bg-[#fffdf9] p-5 sm:max-w-lg sm:p-7"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#e8ded2] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#a44436]">
                  Master · {meta.label}
                </p>
                <h2
                  id="master-dialog-title"
                  className="mt-1 font-serif text-2xl text-[#39231e]"
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
                className="p-2 text-[#77675d] hover:text-[#39231e]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block text-xs font-medium text-[#4b3c33]">
                {meta.label} Name *
                <input
                  type="text"
                  required
                  value={draft.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder={meta.placeholderName}
                  className="mt-1.5 w-full border border-[#ded3c7] bg-white px-3 py-2.5 text-sm text-[#33251f] outline-none focus:border-[#8d3428]"
                />
              </label>

              <label className="block text-xs font-medium text-[#4b3c33]">
                Slug *
                <div className="mt-1.5 flex items-center border border-[#ded3c7] bg-white">
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
                    className="w-full px-3 py-2.5 font-mono text-xs text-[#33251f] outline-none"
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
                    className="px-3 text-[#8d3428] hover:opacity-75"
                  >
                    <Sparkles size={14} />
                  </button>
                </div>
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

              {meta.supportsImage && (
                <div className="border border-[#e4dbd1] bg-[#faf7f3] p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#4b3c33]">
                      Category Cover Image
                    </span>
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
                        className="inline-flex items-center gap-1.5 border border-[#39231e] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#39231e] transition hover:bg-[#39231e] hover:text-white disabled:opacity-50"
                      >
                        <Upload size={12} />
                        {uploadingImage ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden border border-[#ded3c7] bg-[#eee4d8]">
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
                      placeholder="/products/teal-poshak.png"
                      className="w-full border border-[#ded3c7] bg-white px-3 py-2 text-xs text-[#33251f] outline-none"
                    />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {AVAILABLE_CATEGORY_IMAGES.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({ ...prev, image: preset.value }))
                        }
                        className={`border px-2 py-1 text-[10px] transition ${
                          draft.image === preset.value
                            ? "border-[#8d3428] bg-[#f7eee9] font-medium text-[#8d3428]"
                            : "border-[#ded3c7] bg-white text-[#5f5750]"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="block text-xs font-medium text-[#4b3c33]">
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
                  className="mt-1.5 w-full border border-[#ded3c7] bg-white px-3 py-2.5 text-sm text-[#33251f] outline-none focus:border-[#8d3428]"
                />
              </label>

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
                  disabled={submitting}
                  className="bg-[#8d3428] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#70281f] disabled:opacity-50"
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
