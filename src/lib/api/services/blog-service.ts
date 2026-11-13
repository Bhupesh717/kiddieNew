import type { ApiEnvelope } from "@/src/lib/api/types/common";
import type { BlogPost, BlogPostInput, BlogPostStatus } from "@/src/lib/store/blog";

async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message ?? "Unable to sync blog request with server",
    );
  }
  return payload.data;
}

export const blogApiService = {
  async list(status: BlogPostStatus | "all" = "all"): Promise<BlogPost[]> {
    const query = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
    const response = await fetch(`/api/blogs${query}`, { cache: "no-store" });
    return parseEnvelope<BlogPost[]>(response);
  },

  async create(input: BlogPostInput): Promise<BlogPost> {
    const response = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseEnvelope<BlogPost>(response);
  },

  async update(
    idOrSlug: string,
    patch: Partial<BlogPostInput>,
  ): Promise<BlogPost> {
    const response = await fetch(
      `/api/blogs/${encodeURIComponent(idOrSlug)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      },
    );
    return parseEnvelope<BlogPost>(response);
  },

  async remove(idOrSlug: string): Promise<BlogPost> {
    const response = await fetch(
      `/api/blogs/${encodeURIComponent(idOrSlug)}`,
      {
        method: "DELETE",
      },
    );
    return parseEnvelope<BlogPost>(response);
  },

  async reset(): Promise<BlogPost[]> {
    const response = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    return parseEnvelope<BlogPost[]>(response);
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/blogs/upload", {
      method: "POST",
      body: formData,
    });
    const data = await parseEnvelope<{ url: string }>(response);
    return data.url;
  },
};

