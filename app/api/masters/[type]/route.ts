import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  createMasterItem,
  listMasterItems,
  resetMasterItems,
} from "@/src/lib/server/master-store";
import { isMasterType } from "@/src/lib/store/masters";

const createMasterSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> },
) {
  const { type } = await context.params;
  if (!isMasterType(type)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_MASTER_TYPE", message: "Unsupported master type" },
      },
      { status: 400 },
    );
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const filter =
    statusParam === "active" || statusParam === "inactive" ? statusParam : "all";
  const items = listMasterItems(type, filter);

  return NextResponse.json({
    success: true,
    data: items,
    meta: { total: items.length },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ type: string }> },
) {
  const { type } = await context.params;
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
    const raw = (await request.json()) as Record<string, unknown>;
    if (raw?.action === "reset") {
      const defaults = resetMasterItems(type);
      revalidatePath("/admin/master");
      revalidatePath(`/admin/master/${type}`);
      return NextResponse.json({ success: true, data: defaults });
    }

    const parsed = createMasterSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid master payload",
          },
        },
        { status: 400 },
      );
    }

    const created = createMasterItem(type, parsed.data);
    revalidatePath("/admin/master");
    revalidatePath(`/admin/master/${type}`);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
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

