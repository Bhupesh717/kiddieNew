import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  createBanner,
  listBanners,
  moveBannerOrder,
  resetBannersToDefaults,
} from "@/src/lib/server/banner-store";

const createBannerSchema = z.object({
  image: z.string().trim().min(1, "Banner image is required"),
  order: z.coerce.number().int().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

const reorderSchema = z.object({
  action: z.literal("reorder"),
  id: z.string().trim().min(1),
  direction: z.enum(["up", "down"]),
});

export async function GET(request: NextRequest) {
  const statusParam = request.nextUrl.searchParams.get("status");
  const filter =
    statusParam === "active" || statusParam === "inactive" ? statusParam : "all";
  const banners = listBanners(filter);

  return NextResponse.json({
    success: true,
    data: banners,
    meta: { total: banners.length },
  });
}

export async function POST(request: NextRequest) {
  try {
    const raw = (await request.json()) as Record<string, unknown>;
    if (raw?.action === "reset") {
      const defaults = resetBannersToDefaults();
      revalidatePath("/");
      revalidatePath("/admin/banners");
      return NextResponse.json({ success: true, data: defaults });
    }

    if (raw?.action === "reorder") {
      const parsedReorder = reorderSchema.safeParse(raw);
      if (!parsedReorder.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid reorder request",
            },
          },
          { status: 400 },
        );
      }

      const reordered = moveBannerOrder(
        parsedReorder.data.id,
        parsedReorder.data.direction,
      );
      if (!reordered) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Banner not found" },
          },
          { status: 404 },
        );
      }

      revalidatePath("/");
      revalidatePath("/admin/banners");
      return NextResponse.json({ success: true, data: reordered });
    }

    const parsed = createBannerSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              parsed.error.issues[0]?.message ?? "Please upload a banner image",
          },
        },
        { status: 400 },
      );
    }

    const created = createBanner(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin/banners");

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_JSON", message: "Unable to parse request body" },
      },
      { status: 400 },
    );
  }
}
