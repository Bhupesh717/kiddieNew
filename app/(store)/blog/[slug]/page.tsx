import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { BlogDetail } from "@/components/storefront/blog-detail";
import {
  getActiveBlogPosts,
  getBlogPostByIdOrSlug,
} from "@/src/lib/server/blog-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostByIdOrSlug(slug, { activeOnly: true });
  if (!post) {
    return { title: "Story not found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | Majisavesh`,
      description: post.excerpt,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostByIdOrSlug(slug, { activeOnly: true });
  if (!post) notFound();

  const relatedPosts = getActiveBlogPosts()
    .filter((item) => item.id !== post.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <SiteHeader />
      <BlogDetail post={post} relatedPosts={relatedPosts} />
      <SiteFooter />
    </main>
  );
}

