import fs from "node:fs";
import path from "node:path";
import {
  defaultBlogPosts,
  estimateReadTime,
  normalizeRichContentInput,
  slugifyBlogTitle,
  type BlogPost,
  type BlogPostInput,
  type BlogPostStatus,
} from "@/src/lib/store/blog";

const DATA_DIR = path.join(process.cwd(), ".data");
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json");

type BlogStoreGlobal = typeof globalThis & {
  __majisaveshBlogPosts?: BlogPost[];
};

const globalStore = globalThis as BlogStoreGlobal;

function cloneDefaults(): BlogPost[] {
  return defaultBlogPosts.map((post) => ({ ...post }));
}

function readPersistedPosts(): BlogPost[] {
  if (globalStore.__majisaveshBlogPosts) {
    return globalStore.__majisaveshBlogPosts;
  }

  try {
    if (fs.existsSync(BLOGS_FILE)) {
      const raw = fs.readFileSync(BLOGS_FILE, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalStore.__majisaveshBlogPosts = parsed as BlogPost[];
        return globalStore.__majisaveshBlogPosts;
      }
    }
  } catch {
    // Fall back to default seeded posts when disk storage is unavailable
  }

  globalStore.__majisaveshBlogPosts = cloneDefaults();
  return globalStore.__majisaveshBlogPosts;
}

function writePersistedPosts(posts: BlogPost[]): BlogPost[] {
  globalStore.__majisaveshBlogPosts = posts;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(posts, null, 2), "utf8");
  } catch {
    // In-memory store remains updated on read-only filesystems
  }
  return posts;
}

function ensureUniqueSlug(
  rawSlug: string,
  posts: BlogPost[],
  excludeId?: string,
): string {
  const base = slugifyBlogTitle(rawSlug);
  const existing = new Set(
    posts.filter((item) => item.id !== excludeId).map((item) => item.slug),
  );
  if (!existing.has(base)) return base;

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export function listBlogPosts(statusFilter: BlogPostStatus | "all" = "all"): BlogPost[] {
  const posts = readPersistedPosts();
  if (statusFilter === "all") return posts;
  return posts.filter((post) => post.status === statusFilter);
}

export function getActiveBlogPosts(): BlogPost[] {
  return listBlogPosts("active");
}

export function getBlogPostByIdOrSlug(
  idOrSlug: string,
  options?: { activeOnly?: boolean },
): BlogPost | undefined {
  const normalized = decodeURIComponent(idOrSlug).trim().toLowerCase();
  const post = readPersistedPosts().find(
    (item) =>
      item.id.toLowerCase() === normalized ||
      item.slug.toLowerCase() === normalized,
  );
  if (!post) return undefined;
  if (options?.activeOnly && post.status !== "active") return undefined;
  return post;
}

export function createBlogPost(input: BlogPostInput): BlogPost {
  const posts = readPersistedPosts();
  const contentHtml = normalizeRichContentInput(input.contentHtml);
  const id = input.id?.trim() || `blog-${Date.now()}`;
  const slug = ensureUniqueSlug(input.slug || input.title, posts, id);
  const nowIso = new Date().toISOString();

  const newPost: BlogPost = {
    id,
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    category: input.category.trim() || "Heritage Craft",
    author: input.author.trim() || "Aditi Rathore",
    publishedAt: input.publishedAt.trim() || nowIso.slice(0, 10),
    readTime: input.readTime.trim() || estimateReadTime(contentHtml),
    coverImage: input.coverImage.trim() || "/hero-ethnic-wear.png",
    coverImageAlt: input.coverImageAlt.trim() || input.title.trim(),
    contentHtml,
    status: input.status === "inactive" ? "inactive" : "active",
    updatedAt: nowIso,
  };

  writePersistedPosts([newPost, ...posts]);
  return newPost;
}

export function updateBlogPost(
  idOrSlug: string,
  patch: Partial<BlogPostInput>,
): { updated: BlogPost; previousSlug: string } | null {
  const posts = readPersistedPosts();
  const index = posts.findIndex(
    (item) => item.id === idOrSlug || item.slug === idOrSlug,
  );
  if (index === -1) return null;

  const current = posts[index];
  const nextContent =
    patch.contentHtml !== undefined
      ? normalizeRichContentInput(patch.contentHtml)
      : current.contentHtml;
  const nextTitle =
    patch.title !== undefined ? patch.title.trim() : current.title;
  const nextSlug =
    patch.slug !== undefined
      ? ensureUniqueSlug(patch.slug || nextTitle, posts, current.id)
      : current.slug;

  const updated: BlogPost = {
    ...current,
    title: nextTitle || current.title,
    slug: nextSlug,
    excerpt:
      patch.excerpt !== undefined ? patch.excerpt.trim() : current.excerpt,
    category:
      patch.category !== undefined
        ? patch.category.trim() || current.category
        : current.category,
    author:
      patch.author !== undefined
        ? patch.author.trim() || current.author
        : current.author,
    publishedAt:
      patch.publishedAt !== undefined
        ? patch.publishedAt.trim() || current.publishedAt
        : current.publishedAt,
    readTime:
      patch.readTime !== undefined
        ? patch.readTime.trim() || estimateReadTime(nextContent)
        : patch.contentHtml !== undefined
          ? estimateReadTime(nextContent)
          : current.readTime,
    coverImage:
      patch.coverImage !== undefined
        ? patch.coverImage.trim() || current.coverImage
        : current.coverImage,
    coverImageAlt:
      patch.coverImageAlt !== undefined
        ? patch.coverImageAlt.trim() || nextTitle
        : current.coverImageAlt,
    contentHtml: nextContent,
    status:
      patch.status === "active" || patch.status === "inactive"
        ? patch.status
        : current.status,
    updatedAt: new Date().toISOString(),
  };

  const nextPosts = [...posts];
  nextPosts[index] = updated;
  writePersistedPosts(nextPosts);
  return { updated, previousSlug: current.slug };
}

export function deleteBlogPost(idOrSlug: string): BlogPost | null {
  const posts = readPersistedPosts();
  const target = posts.find(
    (item) => item.id === idOrSlug || item.slug === idOrSlug,
  );
  if (!target) return null;

  const nextPosts = posts.filter((item) => item.id !== target.id);
  writePersistedPosts(nextPosts);
  return target;
}

export function resetBlogPostsToDefaults(): BlogPost[] {
  const defaults = cloneDefaults();
  writePersistedPosts(defaults);
  return defaults;
}

