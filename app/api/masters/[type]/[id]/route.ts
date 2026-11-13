import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  deleteMasterItem,
  updateMasterItem,
} from "@/src/lib/server/master-store";
import { isMasterType } from "@/src/lib/store/masters";

const patchMasterSchema = z.object({
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await context.params;
  if (!isMasterType(type)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_MASTER_TYPE", message: "Unsupported master type" },
      },
      { status: 400 },
    );
  }

  try {
    const raw = await request.json();
    const parsed = patchMasterSchema.safeParse(raw);
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

    const updated = updateMasterItem(type, decodeURIComponent(id), parsed.data);
    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Master record not found" },
        },
        { status: 404 },
      );
    }

    revalidatePath("/admin/master");
    revalidatePath(`/admin/master/${type}`);

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
  context: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await context.params;
  if (!isMasterType(type)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_MASTER_TYPE", message: "Unsupported master type" },
      },
      { status: 400 },
    );
  }

  const deleted = deleteMasterItem(type, decodeURIComponent(id));
  if (!deleted) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Master record not found" },
      },
      { status: 404 },
    );
  }

  revalidatePath("/admin/master");
  revalidatePath(`/admin/master/${type}`);

  return NextResponse.json({ success: true, data: deleted });
}

