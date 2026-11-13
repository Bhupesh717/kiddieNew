import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { deleteBanner, updateBanner } from "@/src/lib/server/banner-store";

const patchBannerSchema = z.object({
  image: z.string().trim().min(1).optional(),
  order: z.coerce.number().int().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const raw = await request.json();
    const parsed = patchBannerSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              parsed.error.issues[0]?.message ?? "Invalid banner update payload",
          },
        },
        { status: 400 },
      );
    }

    const updated = updateBanner(decodeURIComponent(id), parsed.data);
    if (!updated) {
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

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_JSON", message: "Unable to parse payload" },
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
  const deleted = deleteBanner(decodeURIComponent(id));

  if (!deleted) {
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

  return NextResponse.json({ success: true, data: deleted });
}
