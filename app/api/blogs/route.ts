import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  createBlogPost,
  listBlogPosts,
  resetBlogPostsToDefaults,
} from "@/src/lib/server/blog-store";

const createBlogSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  slug: z.string().trim().optional().default(""),
  excerpt: z.string().trim().min(5, "Excerpt is required"),
  category: z.string().trim().optional().default("Heritage Craft"),
  author: z.string().trim().optional().default("Aditi Rathore"),
  publishedAt: z.string().trim().optional().default(""),
  readTime: z.string().trim().optional().default(""),
  coverImage: z.string().trim().min(1, "Cover image is required"),
  coverImageAlt: z.string().trim().optional().default(""),
  contentHtml: z.string().trim().min(1, "Rich text content is required"),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export async function GET(request: NextRequest) {
  const statusParam = request.nextUrl.searchParams.get("status");
  const filter =
    statusParam === "active" || statusParam === "inactive" ? statusParam : "all";
  const posts = listBlogPosts(filter);

  return NextResponse.json({
    success: true,
    data: posts,
    meta: { total: posts.length },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (body?.action === "reset") {
      const defaults = resetBlogPostsToDefaults();
      revalidatePath("/blog");
      return NextResponse.json({
        success: true,
        data: defaults,
      });
    }

    const parsed = createBlogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid blog payload",
          },
        },
        { status: 400 },
      );
    }

    const created = createBlogPost(parsed.data);
    revalidatePath("/blog");
    revalidatePath(`/blog/${created.slug}`);

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Unable to parse request body",
        },
      },
      { status: 400 },
    );
  }
}

