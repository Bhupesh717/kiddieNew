import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { BlogDetail } from "@/components/storefront/blog-detail";
import type { BlogPost } from "@/src/lib/store/blog";
import { getServerApiUrl } from "@/src/lib/api/config";

export const dynamic = "force-dynamic";

async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      getServerApiUrl(`/api/blogs/${encodeURIComponent(slug)}`),
      {
        cache: "no-store",
      },
    );
    const payload = await res.json().catch(() => null);
    if (payload?.success && payload.data) {
      return payload.data;
    }
  } catch {}
  return null;
}

async function fetchRelatedPosts(excludeId: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(getServerApiUrl("/api/blogs?status=active"), {
      cache: "no-store",
    });
    const payload = await res.json().catch(() => null);
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data
        .filter((item: BlogPost) => item.id !== excludeId)
        .slice(0, 3);
    }
  } catch {}
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) {
    return { title: "Story not found" };
  }
  return {
    title: `${post.title} · KiddieQuick`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = await fetchRelatedPosts(post.id);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <BlogDetail post={post} relatedPosts={related} />
      <SiteFooter />
    </main>
  );
}
