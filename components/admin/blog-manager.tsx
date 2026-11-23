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
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { BlogRichContent } from "@/components/storefront/blog-rich-content";
import { blogApiService } from "@/src/lib/api/services/blog-service";
import {
  AVAILABLE_BLOG_IMAGES,
  BLOG_CATEGORIES,
  BLOG_STORAGE_KEY,
  estimateReadTime,
  formatBlogDate,
  slugifyBlogTitle,
  type BlogPost,
  type BlogPostStatus,
} from "@/src/lib/store/blog";

type BlogDraft = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  coverImage: string;
  coverImageAlt: string;
  contentHtml: string;
  status: BlogPostStatus;
};

function createEmptyDraft(): BlogDraft {
  return {
    title: "",
    slug: "",
    excerpt: "",
    category: BLOG_CATEGORIES[0],
    author: "Aditi Rathore",
    publishedAt: new Date().toISOString().slice(0, 10),
    readTime: "",
    coverImage: AVAILABLE_BLOG_IMAGES[0].value,
    coverImageAlt: "",
    contentHtml: "<p>Write your story here...</p>",
    status: "active",
  };
}

export function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const router = useRouter();
  const coverUploadRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<BlogPost[]>(initialPosts ?? []);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BlogPostStatus>(
    "all",
  );
  const [dialog, setDialog] = useState<"add" | "edit" | "view" | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);
  const [editorSessionKey, setEditorSessionKey] = useState(0);
  const [draft, setDraft] = useState<BlogDraft>(createEmptyDraft);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const loadLiveBlogs = () => {
    setLoading(true);
    blogApiService
      .list("all", true)
      .then((live) => {
        setPosts(Array.isArray(live) ? live : []);
      })
      .catch((err) => {
        console.error("Failed to load admin blogs", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLiveBlogs();
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
    () => posts.filter((post) => post.status === "active").length,
    [posts],
  );
  const inactiveCount = posts.length - activeCount;

  const visiblePosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter !== "all" && post.status !== statusFilter) return false;
      if (!q) return true;
      return `${post.title} ${post.slug} ${post.category} ${post.author}`
        .toLowerCase()
        .includes(q);
    });
  }, [posts, search, statusFilter]);

  const pagination = useTablePagination(visiblePosts);

  const activePost = useMemo(
    () => posts.find((post) => post.id === activeId),
    [posts, activeId],
  );

  function startAdd() {
    setFeedback(null);
    setActiveId(null);
    setSlugLocked(false);
    setDraft(createEmptyDraft());
    setEditorSessionKey((k) => k + 1);
    setDialog("add");
  }

  function startEdit(post: BlogPost) {
    setFeedback(null);
    setActiveId(post.id);
    setSlugLocked(true);
    setDraft({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      author: post.author,
      publishedAt: post.publishedAt,
      readTime: post.readTime,
      coverImage: post.coverImage,
      coverImageAlt: post.coverImageAlt,
      contentHtml: post.contentHtml,
      status: post.status,
    });
    setEditorSessionKey((k) => k + 1);
    setDialog("edit");
  }

  function handleTitleChange(nextTitle: string) {
    setDraft((prev) => ({
      ...prev,
      title: nextTitle,
      slug: slugLocked ? prev.slug : slugifyBlogTitle(nextTitle),
    }));
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setFeedback(null);
    try {
      const url = await blogApiService.uploadImage(file);
      setDraft((prev) => ({
        ...prev,
        coverImage: url,
        coverImageAlt:
          prev.coverImageAlt ||
          file.name
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]+/g, " ")
            .trim(),
      }));
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Cover upload failed",
      });
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    const payload = {
      title: draft.title.trim(),
      slug: (draft.slug.trim() || slugifyBlogTitle(draft.title)).toLowerCase(),
      excerpt: draft.excerpt.trim(),
      category: draft.category.trim() || BLOG_CATEGORIES[0],
      author: draft.author.trim() || "Aditi Rathore",
      publishedAt:
        draft.publishedAt.trim() || new Date().toISOString().slice(0, 10),
      readTime: draft.readTime.trim() || estimateReadTime(draft.contentHtml),
      coverImage: draft.coverImage.trim() || AVAILABLE_BLOG_IMAGES[0].value,
      coverImageAlt: draft.coverImageAlt.trim() || draft.title.trim(),
      contentHtml: draft.contentHtml,
      status: draft.status,
    };

    try {
      if (dialog === "edit" && activeId) {
        const updated = await blogApiService.update(activeId, payload);
        setPosts((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        setFeedback({
          type: "success",
          text: `"${updated.title}" updated (${updated.status}).`,
        });
      } else {
        const created = await blogApiService.create(payload);
        setPosts((prev) => [created, ...prev]);
        setFeedback({
          type: "success",
          text: `"${created.title}" added (${created.status}).`,
        });
      }
      setDialog(null);
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error ? error.message : "Could not save blog post",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(post: BlogPost) {
    const nextStatus: BlogPostStatus =
      post.status === "active" ? "inactive" : "active";
    setBusyId(post.id);
    setFeedback(null);
    try {
      const updated = await blogApiService.update(post.id, {
        status: nextStatus,
      });
      setPosts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setFeedback({
        type: "success",
        text: `"${updated.title}" marked as ${updated.status}.`,
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

  async function handleDelete(postId: string) {
    setBusyId(postId);
    setFeedback(null);
    try {
      const removed = await blogApiService.remove(postId);
      setPosts((prev) => prev.filter((item) => item.id !== removed.id));
      if (activeId === postId) setDialog(null);
      setConfirmDeleteId(null);
      setFeedback({
        type: "success",
        text: `"${removed.title}" removed.`,
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Could not delete post",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleReset() {
    setFeedback(null);
    loadLiveBlogs();
  }

  return (
    <section className="container mx-auto px-4 py-7 sm:px-6 lg:py-10">
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Editorial · Journal management
          </p>
          <h1 className="mt-2 font-serif text-4xl text-primary">
            Blog posts
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Create and edit rich-text journal stories, upload separate main
            cover and detail images, and toggle active visibility on the
            storefront.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 border border-border bg-white px-3.5 py-3 text-xs font-medium text-primary transition hover:border-primary"
          >
            <ExternalLink size={14} /> View storefront blog
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
            <Plus size={15} /> Add blog post
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
                ["all", `All (${posts.length})`],
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
            <span className="sr-only">Search blog posts</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                pagination.setPage(1);
              }}
              placeholder="Search title, slug, author..."
              className="w-full bg-transparent text-sm text-primary outline-none sm:w-60"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {[
                  "Story & Slug",
                  "Category",
                  "Author & Date",
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
              {pagination.paginatedItems.map((post) => {
                const isActive = post.status === "active";
                const isBusy = busyId === post.id;

                return (
                  <tr
                    key={post.id}
                    className="border-t border-border text-muted-foreground"
                  >
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-16 shrink-0 overflow-hidden border border-border bg-secondary">
                          <BlogCoverImage
                            src={post.coverImage}
                            alt={post.coverImageAlt || post.title}
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-md truncate font-medium text-primary">
                            {post.title}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                            /blog/{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">{post.category}</td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <p className="text-xs font-medium text-primary">
                        {post.author}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatBlogDate(post.publishedAt)} · {post.readTime}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => toggleStatus(post)}
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
                        {isActive && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            aria-label={`Open live blog post ${post.title}`}
                            title="Open live page"
                            className="border border-border p-2 text-muted-foreground hover:border-accent hover:text-accent"
                          >
                            <ExternalLink size={15} />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveId(post.id);
                            setDialog("view");
                          }}
                          aria-label={`Preview ${post.title}`}
                          title="Preview"
                          className="border border-border p-2 hover:border-accent"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(post)}
                          aria-label={`Edit ${post.title}`}
                          title="Edit"
                          className="border border-border p-2 hover:border-accent"
                        >
                          <Pencil size={15} />
                        </button>
                        {confirmDeleteId === post.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDelete(post.id)}
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
                            onClick={() => setConfirmDeleteId(post.id)}
                            aria-label={`Delete ${post.title}`}
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
            Loading journal stories...
          </p>
        )}
        {!loading && !visiblePosts.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search ? "No stories match your search." : "No stories published yet. Click \"Add blog post\" to write one."}
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
          itemLabel="posts"
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
            aria-labelledby="blog-dialog-title"
            className="max-h-[94vh] w-full overflow-y-auto bg-popover p-5 sm:max-w-4xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  KiddieQuick journal
                </p>
                <h2
                  id="blog-dialog-title"
                  className="mt-1 font-serif text-2xl text-primary sm:text-3xl"
                >
                  {dialog === "add"
                    ? "Create new blog post"
                    : dialog === "edit"
                      ? "Edit blog post"
                      : "Blog preview"}
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

            {dialog === "view" && activePost ? (
              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      activePost.status === "active"
                        ? "bg-success/10 text-success"
                        : "bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    {activePost.status}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    /blog/{activePost.slug}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-3xl text-primary">
                  {activePost.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  {activePost.category} · By {activePost.author} ·{" "}
                  {formatBlogDate(activePost.publishedAt)} ·{" "}
                  {activePost.readTime}
                </p>

                <div className="relative mt-5 aspect-[16/9] overflow-hidden border border-border bg-secondary">
                  <BlogCoverImage
                    src={activePost.coverImage}
                    alt={activePost.coverImageAlt || activePost.title}
                    sizes="(max-width: 896px) 100vw, 800px"
                    className="object-cover object-[center_25%]"
                  />
                </div>
                {activePost.coverImageAlt && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Main cover alt: {activePost.coverImageAlt}
                  </p>
                )}

                <p className="mt-6 border-l-2 border-accent pl-4 text-sm italic leading-7 text-muted-foreground">
                  {activePost.excerpt}
                </p>

                <div className="mt-6 border-t border-border pt-6">
                  <BlogRichContent html={activePost.contentHtml} />
                </div>

                <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={() => startEdit(activePost)}
                    className="bg-primary px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
                  >
                    Edit post
                  </button>
                  {activePost.status === "active" && (
                    <Link
                      href={`/blog/${activePost.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 border border-primary px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary"
                    >
                      Open live story <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-[1.35fr_0.65fr]">
                  <label className="block text-xs font-medium text-foreground/90">
                    Blog Title *
                    <input
                      type="text"
                      required
                      value={draft.title}
                      onChange={(event) =>
                        handleTitleChange(event.target.value)
                      }
                      placeholder="e.g., Summer Essentials & Festive Styling Guide"
                      className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                    />
                  </label>

                  <div className="text-xs font-medium text-foreground/90">
                    <span>Visibility Status *</span>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-foreground/90">
                    URL Slug *
                    <div className="mt-1.5 flex items-center border border-input bg-white">
                      <span className="border-r border-border bg-background px-3 py-2.5 font-mono text-xs text-muted-foreground">
                        /blog/
                      </span>
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
                        placeholder="summer-essentials-styling-guide"
                        className="w-full px-3 py-2.5 font-mono text-xs text-foreground outline-none"
                      />
                      <button
                        type="button"
                        title="Generate slug from title"
                        onClick={() => {
                          setSlugLocked(false);
                          setDraft((prev) => ({
                            ...prev,
                            slug: slugifyBlogTitle(prev.title),
                          }));
                        }}
                        className="px-2.5 text-accent hover:opacity-75"
                      >
                        <Sparkles size={14} />
                      </button>
                    </div>
                  </label>

                  <label className="block text-xs font-medium text-foreground/90">
                    Category *
                    <select
                      value={draft.category}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          category: event.target.value,
                        }))
                      }
                      className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                    >
                      {BLOG_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-xs font-medium text-foreground/90">
                    Author *
                    <input
                      type="text"
                      required
                      value={draft.author}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          author: event.target.value,
                        }))
                      }
                      className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                    />
                  </label>
                  <label className="block text-xs font-medium text-foreground/90">
                    Publish Date *
                    <input
                      type="date"
                      required
                      value={draft.publishedAt}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          publishedAt: event.target.value,
                        }))
                      }
                      className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                    />
                  </label>
                  <label className="block text-xs font-medium text-foreground/90">
                    Read Time (auto if blank)
                    <input
                      type="text"
                      value={draft.readTime}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          readTime: event.target.value,
                        }))
                      }
                      placeholder={estimateReadTime(draft.contentHtml)}
                      className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                    />
                  </label>
                </div>

                <div className="border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                        Main Cover Image *
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Displayed on the /blog card and hero header of the
                        article page (separate from detail content images).
                      </p>
                    </div>
                    <div>
                      <input
                        ref={coverUploadRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        onChange={handleCoverUpload}
                        className="sr-only"
                      />
                      <button
                        type="button"
                        disabled={uploadingCover}
                        onClick={() => coverUploadRef.current?.click()}
                        className="inline-flex items-center gap-1.5 border border-primary bg-white px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
                      >
                        <Upload size={13} />
                        {uploadingCover ? "Uploading..." : "Upload cover"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
                    <div className="relative aspect-[16/10] overflow-hidden border border-input bg-secondary">
                      <BlogCoverImage
                        src={draft.coverImage}
                        alt={draft.coverImageAlt || "Cover preview"}
                        sizes="200px"
                        className="object-cover object-[center_25%]"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_BLOG_IMAGES.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                coverImage: preset.value,
                              }))
                            }
                            className={`border px-2.5 py-1 text-[11px] transition ${
                              draft.coverImage === preset.value
                                ? "border-accent bg-accent/10 font-medium text-accent"
                                : "border-input bg-white text-muted-foreground hover:border-primary"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        required
                        value={draft.coverImage}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            coverImage: event.target.value,
                          }))
                        }
                        placeholder="Cover image URL (/products/... or https://...)"
                        className="w-full border border-input bg-white px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                      />
                      <input
                        type="text"
                        value={draft.coverImageAlt}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            coverImageAlt: event.target.value,
                          }))
                        }
                        placeholder="Cover image caption / alt text"
                        className="w-full border border-input bg-white px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                <label className="block text-xs font-medium text-foreground/90">
                  Short Summary / Excerpt *
                  <textarea
                    rows={2}
                    required
                    value={draft.excerpt}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        excerpt: event.target.value,
                      }))
                    }
                    placeholder="Brief introduction displayed on the blog listing page..."
                    className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
                  />
                </label>

                <div>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground/90">
                      Detailed Story Content (Rich Text + Inline Images) *
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Use <strong>Add detail image</strong> in toolbar to embed
                      photos inside the article body
                    </span>
                  </div>
                  <RichTextEditor
                    value={draft.contentHtml}
                    onChange={(html) =>
                      setDraft((prev) => ({ ...prev, contentHtml: html }))
                    }
                    sessionKey={editorSessionKey}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={() => setDialog(null)}
                    className="border border-input bg-white px-5 py-2.5 text-xs font-medium text-muted-foreground hover:border-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-accent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-accent/90 disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : dialog === "edit"
                        ? "Save changes"
                        : "Publish story"}
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
