import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { VALID_RESOURCE_TYPES } from "@/app/api/resources/route";

const BUCKET = "chapter-resources";

// POST /api/resources/upload-url
// Body: { fileName, chapterId, resourceType }
// chapterId = 0 for combined/general resources
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { fileName, chapterId, resourceType } = body;

    if (!fileName || chapterId === undefined || chapterId === null || !resourceType) {
      return NextResponse.json(
        { error: "fileName, chapterId, resourceType required" },
        { status: 400 }
      );
    }

    if (!VALID_RESOURCE_TYPES.includes(resourceType)) {
      return NextResponse.json({ error: "Invalid resourceType" }, { status: 400 });
    }

    // Sanitize filename — no path traversal
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Storage path:
    // chapter-specific: chapter-N/resourceType/timestamp_filename.pdf
    // combined: combined/resourceType/timestamp_filename.pdf
    const folderPrefix = parseInt(chapterId) === 0
      ? `combined/${resourceType}`
      : `chapter-${chapterId}/${resourceType}`;

    const storagePath = `${folderPrefix}/${Date.now()}_${safeName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("Upload URL error:", error);
      return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      storagePath,
      token: data.token,
    });
  } catch (err) {
    console.error("Upload URL error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
