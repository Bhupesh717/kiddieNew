import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  deleteBlogPost,
  getBlogPostByIdOrSlug,
  updateBlogPost,
} from "@/src/lib/server/blog-store";

const patchBlogSchema = z.object({
  title: z.string().trim().min(2).optional(),
  slug: z.string().trim().min(1).optional(),
  excerpt: z.string().trim().min(5).optional(),
  category: z.string().trim().min(1).optional(),
  author: z.string().trim().min(1).optional(),
  publishedAt: z.string().trim().optional(),
  readTime: z.string().trim().optional(),
  coverImage: z.string().trim().min(1).optional(),
  coverImageAlt: z.string().trim().optional(),
  contentHtml: z.string().trim().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const activeOnly = request.nextUrl.searchParams.get("activeOnly") === "1";
  const post = getBlogPostByIdOrSlug(id, { activeOnly });

  if (!post) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Blog post not found" },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: post,
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const raw = await request.json();
    const parsed = patchBlogSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid update payload",
          },
        },
        { status: 400 },
      );
    }

    const result = updateBlogPost(decodeURIComponent(id), parsed.data);
    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Blog post not found" },
        },
        { status: 404 },
      );
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${result.previousSlug}`);
    revalidatePath(`/blog/${result.updated.slug}`);

    return NextResponse.json({
      success: true,
      data: result.updated,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Unable to parse update payload",
        },
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deleted = deleteBlogPost(decodeURIComponent(id));

  if (!deleted) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Blog post not found" },
      },
      { status: 404 },
    );
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${deleted.slug}`);

  return NextResponse.json({
    success: true,
    data: deleted,
  });
}

