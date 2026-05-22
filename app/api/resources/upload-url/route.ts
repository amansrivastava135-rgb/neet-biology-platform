import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

const BUCKET = "chapter-resources";

// POST /api/resources/upload-url
// Body: { fileName, chapterId, resourceType }
// Returns a signed upload URL so the browser uploads directly to Supabase Storage
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { fileName, chapterId, resourceType } = body;

    if (!fileName || !chapterId || !resourceType) {
      return NextResponse.json(
        { error: "fileName, chapterId, resourceType required" },
        { status: 400 }
      );
    }

    // Sanitize filename — no path traversal
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    // Storage path: chapter-N/resourceType/filename.pdf
    const storagePath = `chapter-${chapterId}/${resourceType}/${Date.now()}_${safeName}`;

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