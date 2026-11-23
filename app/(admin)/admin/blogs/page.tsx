import type { Metadata } from "next";
import { BlogManager } from "@/components/admin/blog-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Blogs",
};

export default function AdminBlogsPage() {
  return <BlogManager initialPosts={[]} />;
}
