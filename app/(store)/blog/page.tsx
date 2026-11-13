import type { Metadata } from "next";
import { PageIntro, SiteFooter, SiteHeader } from "@/components/site-shell";
import { BlogListing } from "@/components/storefront/blog-listing";
import { getActiveBlogPosts } from "@/src/lib/server/blog-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & Journal",
  description:
    "Stories from the Majisavesh Jaipur atelier — heritage crafts, Rajputi poshak guides, bridal styling notes, and heirloom textile care.",
};

export default function BlogPage() {
  const activePosts = getActiveBlogPosts();

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#33251f]">
      <SiteHeader />
      <PageIntro
        eyebrow="The Majisavesh Journal"
        title="Stories from the atelier"
        copy="Heritage craft essays, poshak draping notes, and thoughtful textile care from our karigar studio in Jaipur."
      />
      <BlogListing posts={activePosts} />
      <SiteFooter />
    </main>
  );
}

