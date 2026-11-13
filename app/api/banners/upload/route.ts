import type { NextRequest } from "next/server";
import { handleImageUploadRequest } from "@/src/lib/server/image-upload";

export async function POST(request: NextRequest) {
  return handleImageUploadRequest(request, "banners");
}

