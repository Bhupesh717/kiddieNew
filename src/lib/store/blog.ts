export type BlogPostStatus = "active" | "inactive";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  coverImage: string;
  coverImageAlt: string;
  contentHtml: string;
  status: BlogPostStatus;
  updatedAt: string;
};

export type BlogPostInput = Omit<BlogPost, "id" | "updatedAt"> & {
  id?: string;
  updatedAt?: string;
};

export const BLOG_STORAGE_KEY = "kiddiequick_blogs_v1";

export const BLOG_CATEGORIES = [
  "Kids Fashion",
  "Festive Ethnic",
  "Western Style Notes",
  "Style Notes",
  "Textile Archive",
  "Studio Stories",
] as const;

export const AVAILABLE_BLOG_IMAGES = [
  { label: "Festive Maroon Ensemble", value: "/hero-ethnic-wear.png" },
  { label: "Teal Velvet Kurti Set", value: "/products/teal-poshak.png" },
  { label: "Mustard Zari Suit", value: "/products/mustard-poshak.png" },
  { label: "Mogra Rose Silk", value: "/products/rose-silk.png" },
  { label: "Kundan Rani Haar", value: "/products/kundan-haar.png" },
  { label: "KiddieQuick Banner", value: "/Majisavesh_Banner.png" },
] as const;

export function slugifyBlogTitle(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "") || `story-${Date.now()}`
  );
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatBlogDate(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (match) {
    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);
    const month = MONTH_NAMES[monthIndex];
    if (month && day >= 1 && day <= 31) {
      return `${String(day).padStart(2, "0")} ${month} ${year}`;
    }
  }
  return dateStr;
}

export function estimateReadTime(html: string): string {
  const plainText = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plainText) return "1 min read";
  const words = plainText.split(" ").length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

function isSafeHref(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return false;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("mailto:")
  ) {
    return true;
  }
  return false;
}

function isSafeImageSrc(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return false;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:image/")
  ) {
    return !trimmed.startsWith("data:image/svg+xml");
  }
  return false;
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "hr",
  "h2",
  "h3",
  "h4",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "figure",
  "figcaption",
  "img",
]);

function normalizeAttributeName(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrPattern =
    /([a-zA-Z0-9:-]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(raw)) !== null) {
    const name = match[1].toLowerCase();
    if (name.startsWith("on") || name === "style") continue;
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[name] = value;
  }
  return attrs;
}

/**
 * Sanitizes rich-text HTML delivered from the admin editor or backend API,
 * preserving editorial formatting and inline images while stripping executable markup.
 */
export function sanitizeBlogHtml(input: string): string {
  if (!input.trim()) return "";

  const withoutDangerousBlocks = input
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?\s*>/gi, "");

  return withoutDangerousBlocks.replace(
    /<(\/?)\s*([a-zA-Z0-9]+)([^>]*)>/g,
    (fullMatch, slash: string, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (tag === "h1") {
        return `<${slash}h2>`;
      }
      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }
      if (slash) {
        if (tag === "br" || tag === "hr" || tag === "img") return "";
        return `</${tag}>`;
      }

      if (tag === "br" || tag === "hr") {
        return `<${tag} />`;
      }

      const attrs = normalizeAttributeName(rawAttrs);

      if (tag === "a") {
        const href = attrs.href ?? "";
        if (!isSafeHref(href)) return "<a>";
        const isExternal = /^https?:\/\//i.test(href);
        const relAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${escapeAttribute(href)}"${relAttr}>`;
      }

      if (tag === "img") {
        const src = attrs.src ?? "";
        if (!isSafeImageSrc(src)) return "";
        const alt = escapeAttribute(attrs.alt ?? "");
        const title = attrs.title ? ` title="${escapeAttribute(attrs.title)}"` : "";
        return `<img src="${escapeAttribute(src)}" alt="${alt}"${title} loading="lazy" />`;
      }

      void fullMatch;
      return `<${tag}>`;
    },
  );
}

export function normalizeRichContentInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "<p></p>";
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(trimmed);
  if (hasHtmlTags) {
    return sanitizeBlogHtml(trimmed);
  }
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export const defaultBlogPosts: BlogPost[] = [];

