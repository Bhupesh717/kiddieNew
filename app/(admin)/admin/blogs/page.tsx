import type { Metadata } from "next";
import { BlogManager } from "@/components/admin/blog-manager";
import { listBlogPosts } from "@/src/lib/server/blog-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Blogs",
};

export default function AdminBlogsPage() {
  const posts = listBlogPosts("all");
  return <BlogManager initialPosts={posts} />;
}

