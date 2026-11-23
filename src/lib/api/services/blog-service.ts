import { getAuthHeaders } from "@/src/lib/api/auth-token";
import type { ApiEnvelope } from "@/src/lib/api/types/common";
import type { BlogPost, BlogPostInput, BlogPostStatus } from "@/src/lib/store/blog";

async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    const errorMsg =
      payload?.error?.message ??
      (response.status === 401
        ? "Unauthorized: Please log in as an administrator"
        : response.status === 403
        ? "Forbidden: Administrator privileges required"
        : "Unable to sync blog request with server");
    throw new Error(errorMsg);
  }
  return payload.data;
}

export const blogApiService = {
  /**
   * List blogs. If isAdmin is true, fetches from /api/admin/blogs; otherwise public /api/blogs.
   */
  async list(status: BlogPostStatus | "all" = "all", isAdmin = true): Promise<BlogPost[]> {
    const query = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
    const endpoint = isAdmin ? `/api/admin/blogs${query}` : `/api/blogs${query}`;
    const response = await fetch(endpoint, {
      headers: isAdmin ? getAuthHeaders(false) : { Accept: "application/json" },
      cache: "no-store",
    });
    return parseEnvelope<BlogPost[]>(response);
  },

  async bySlug(slug: string): Promise<BlogPost> {
    const response = await fetch(`/api/blogs/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    return parseEnvelope<BlogPost>(response);
  },

  async create(input: BlogPostInput): Promise<BlogPost> {
    const response = await fetch("/api/admin/blogs", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(input),
    });
    return parseEnvelope<BlogPost>(response);
  },

  async update(
    idOrSlug: string,
    patch: Partial<BlogPostInput>,
  ): Promise<BlogPost> {
    const response = await fetch(
      `/api/admin/blogs/${encodeURIComponent(idOrSlug)}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify(patch),
      },
    );
    return parseEnvelope<BlogPost>(response);
  },

  async remove(idOrSlug: string): Promise<BlogPost> {
    const response = await fetch(
      `/api/admin/blogs/${encodeURIComponent(idOrSlug)}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(false),
      },
    );
    return parseEnvelope<BlogPost>(response);
  },

  async reset(): Promise<BlogPost[]> {
    return this.list("all", true);
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const headers = getAuthHeaders(false) as Record<string, string>;
    delete headers["Content-Type"];

    const response = await fetch("/api/admin/blogs/upload", {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await parseEnvelope<{ url: string }>(response);
    return data.url;
  },
};
