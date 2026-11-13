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

export const BLOG_STORAGE_KEY = "majisavesh_blogs_v1";

export const BLOG_CATEGORIES = [
  "Heritage Craft",
  "Bridal Guide",
  "Style Notes",
  "Textile Archive",
  "Atelier Stories",
] as const;

export const AVAILABLE_BLOG_IMAGES = [
  { label: "Heritage Maroon Poshak", value: "/hero-ethnic-wear.png" },
  { label: "Teal Velvet Poshak", value: "/products/teal-poshak.png" },
  { label: "Mustard Zari Suit", value: "/products/mustard-poshak.png" },
  { label: "Mogra Rose Silk", value: "/products/rose-silk.png" },
  { label: "Kundan Rani Haar", value: "/products/kundan-haar.png" },
  { label: "Majisavesh Royal Banner", value: "/Majisavesh_Banner.png" },
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

export const defaultBlogPosts: BlogPost[] = [
  {
    id: "blog-001",
    slug: "art-of-rajputi-poshak",
    title: "The Art of Rajputi Poshak: Craft, Gota Patti & Royal Silhouette",
    excerpt:
      "Inside the four-piece drape that defines ceremonial dressing in Rajasthan — and how our Jaipur karigars preserve hand-stitched zari borders for modern celebrations.",
    category: "Heritage Craft",
    author: "Aditi Rathore",
    publishedAt: "2026-10-18",
    readTime: "4 min read",
    coverImage: "/hero-ethnic-wear.png",
    coverImageAlt: "Bride wearing deep maroon Rajputi Poshak with hand-embroidered gold zari under sandstone palace arches",
    status: "active",
    updatedAt: "2026-10-18T10:30:00.000Z",
    contentHtml: `<p>Every heirloom <strong>Rajputi Poshak</strong> begins long before a single stitch meets silk. In the courtyards of Jaipur and Bikaner, master pattern-makers measure drape movement first — ensuring the <em>ghagra</em> swirls effortlessly while the <em>odhni</em> frames the face with quiet grace.</p>
<h2>Anatomy of the Four-Piece Ensemble</h2>
<p>Unlike conventional lehengas, a traditional poshak is composed of four balanced layers that create an unmistakable regal silhouette:</p>
<ul>
<li><strong>Kanchali &amp; Kurti:</strong> A tailored cropped bodice layered beneath a sheer or embroidered hip-length tunic with crisp side slits.</li>
<li><strong>Kalidar Ghagra:</strong> Twenty or more panelled pleats sewn to drape vertically without unnecessary bulk.</li>
<li><strong>Odhni:</strong> A hand-finished veil weighted along the borders with pure <em>zari</em> and <em>gota patti</em> motifs so it rests effortlessly over the head and shoulder.</li>
</ul>
<figure><img src="/products/mustard-poshak.png" alt="Mustard zari embroidered suit photographed in a Rajasthan heritage courtyard" /><figcaption>Fine gold danka and kasab embroidery catching late-afternoon light in our Jaipur atelier.</figcaption></figure>
<blockquote>“When gold thread is beaten patiently by hand, it does not shout in candlelight — it glows like old sandstone at dusk.”</blockquote>
<h3>Choosing Pure vs. Semi-Pure Fabrics</h3>
<p>Pure georgette and silk satin fall with liquid weight and accept denser <em>kardhana</em> or antique zari handwork, making them ideal for pheras and reception evenings. Semi-pure weaves keep the silhouette crisp while offering lighter day-long comfort for sangeet mornings and intimate pujas.</p>`,
  },
  {
    id: "blog-002",
    slug: "jaipur-winter-wedding-layering",
    title: "Dressing for Jaipur Winter Weddings: Velvet, Silk & Kundan Notes",
    excerpt:
      "How to pair jewel-toned velvet kurti sets with heirloom Kundan jewellery and organza odhnis for crisp desert evenings.",
    category: "Bridal Guide",
    author: "Meera Shekhawat",
    publishedAt: "2026-10-12",
    readTime: "3 min read",
    coverImage: "/products/teal-poshak.png",
    coverImageAlt: "Emerald teal velvet kurti set with gold gota borders under carved palace arch",
    status: "active",
    updatedAt: "2026-10-12T09:15:00.000Z",
    contentHtml: `<p>Once November settles over Rajasthan, sunlit palace lawns cool rapidly after sunset. Deep-pile micro-velvets in emerald teal, sindoor maroon, and burnished ochre become the season&apos;s most practical luxury.</p>
<h2>Balancing Texture and Jewellery</h2>
<p>Velvet carries natural warmth and visual richness, so restrained ornamentation always looks more poised than heavy embellishment across every inch.</p>
<figure><img src="/products/kundan-haar.png" alt="Handcrafted Kundan Rani Haar with ruby beads and pearls on raw silk cloth" /><figcaption>A Polki-inspired Kundan haar layered with freshwater pearls completes open velvet necklines.</figcaption></figure>
<h3>Three Styling Rules for Evening Phere</h3>
<ol>
<li>Pair matte velvet tunics with sheer organza or pure tissue odhnis to keep the upper frame luminous.</li>
<li>Anchor the neckline with one statement <strong>Kundan rani haar</strong> and matching borla instead of crowding multiple chokers.</li>
<li>Choose hand-embroidered leather juttis in muted champagne gold for comfort across stone courtyards.</li>
</ol>`,
  },
  {
    id: "blog-003",
    slug: "care-for-handloom-silk-zari",
    title: "Heirloom Care: Preserving Handloom Silk & Antique Zari Across Generations",
    excerpt:
      "Simple muslin folding rituals, natural neem storage, and moisture rules that keep pure silk poshaks vibrant for decades.",
    category: "Textile Archive",
    author: "Aditi Rathore",
    publishedAt: "2026-10-04",
    readTime: "3 min read",
    coverImage: "/products/rose-silk.png",
    coverImageAlt: "Draped rose silk textile with woven gold zari border",
    status: "active",
    updatedAt: "2026-10-04T14:20:00.000Z",
    contentHtml: `<p>Authentic silk and metallic zari are living materials. With attentive storage, a ceremonial weave doesn&apos;t age out — it softens and gains character with every family milestone.</p>
<h2>The Muslin Folding Ritual</h2>
<p>Avoid plastic garment covers, which trap humidity and gradually dull real silver-gold threads. Wrap each ensemble separately in unbleached breathable cotton <em>malmal</em>.</p>
<ul>
<li>Refold silk garments every four months along fresh creases to prevent permanent stress lines along zari borders.</li>
<li>Air garments briefly in indirect shade after celebrations before packing away.</li>
<li>Never spray perfume directly onto silk fibres or metallic embroidery.</li>
</ul>
<p>Need restoration or custom finishing on a Majisavesh piece? Our Jaipur studio welcomes care consultations year-round.</p>`,
  },
  {
    id: "blog-004",
    slug: "upcoming-festive-loom-preview",
    title: "Behind the Festive Looms: Preview of Our Winter Bridal Edit",
    excerpt:
      "An early archive draft featuring natural madder-dyed silks, antique gota trims, and upcoming bespoke bridal appointments.",
    category: "Atelier Stories",
    author: "Rohan Kachhawaha",
    publishedAt: "2026-10-20",
    readTime: "2 min read",
    coverImage: "/Majisavesh_Banner.png",
    coverImageAlt: "Majisavesh winter bridal showcase preview",
    status: "inactive",
    updatedAt: "2026-10-20T16:00:00.000Z",
    contentHtml: `<p>This preview note is currently queued in draft inside Atelier Admin while final photography from the Pushkar looms arrives.</p>
<h2>What Awaits in the Edit</h2>
<p>Expect rich sindoor reds, gossamer pure odhnis, and hand-worked zardozi motifs inspired by 19th-century palace frescoes.</p>`,
  },
];

