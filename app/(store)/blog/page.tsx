import type { Metadata } from "next";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import { BlogListing } from "@/components/storefront/blog-listing";
import type { BlogPost } from "@/src/lib/store/blog";
import { getServerApiUrl } from "@/src/lib/api/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & Journal",
  description:
    "Stories from KiddieQuick — kids fashion tips, Indian ethnic wear guides, modern western styling notes, and fabric care.",
};

async function getLiveBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(getServerApiUrl("/api/blogs?status=active"), {
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data;
    }
  } catch {}
  return [];
}

export default async function BlogPage() {
  const activePosts = await getLiveBlogs();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageIntro
        eyebrow="The KiddieQuick Journal"
        title="Stories & Styling Guides"
        copy="Practical kids fashion tips, festive ethnic wear guides, and thoughtful everyday textile care from KiddieQuick."
      />
      <BlogListing posts={activePosts} />
      <SiteFooter />
    </main>
  );
}
