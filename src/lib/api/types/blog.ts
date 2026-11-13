import type { BlogPost, BlogPostInput, BlogPostStatus } from "@/src/lib/store/blog";

export type { BlogPost, BlogPostInput, BlogPostStatus };

export type BlogListQuery = {
  status?: BlogPostStatus | "all";
};

