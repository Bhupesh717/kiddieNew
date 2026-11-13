import fs from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";

const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function handleImageUploadRequest(
  request: NextRequest,
  folder: "blog" | "products" | "banners",
) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NO_FILE", message: "Please select an image file" },
        },
        { status: 400 },
      );
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TYPE",
            message: "Only PNG, JPG, WEBP, and AVIF images are supported",
          },
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "Image size must be 4 MB or smaller",
          },
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanBase =
      path
        .basename(file.name, path.extname(file.name))
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/(^-|-$)/g, "") || `${folder}-image`;
    const filename = `${Date.now()}-${cleanBase}.${extension}`;

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), buffer);

      return NextResponse.json({
        success: true,
        data: { url: `/uploads/${folder}/${filename}` },
      });
    } catch {
      const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        data: { url: dataUrl },
      });
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: "Could not process image upload",
        },
      },
      { status: 500 },
    );
  }
}

