import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

const BUCKET = "chapter-resources";

// GET /api/resources/pdf?id=resourceId&chapterId=N
// Proxies the PDF from Supabase Storage — avoids CORS/iframe issues
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isPaid =
      user.isPaid &&
      (!user.subscriptionEnd || new Date(user.subscriptionEnd) > new Date());

    if (!isPaid) {
      return new NextResponse("Premium required", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("id");
    const chapterId = searchParams.get("chapterId");

    if (!resourceId || !chapterId) {
      return new NextResponse("Missing params", { status: 400 });
    }

    // Fetch resource record to get storage_path
    const { data: resource, error } = await supabaseAdmin
      .from("chapter_resources")
      .select("storage_path, title")
      .eq("id", resourceId)
      .eq("chapter_id", parseInt(chapterId))
      .eq("is_active", true)
      .single();

    if (error || !resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    // Download file from Supabase Storage server-side
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(resource.storage_path);

    if (downloadError || !fileData) {
      console.error("Storage download error:", downloadError);
      return new NextResponse("Failed to load PDF", { status: 500 });
    }

    const arrayBuffer = await fileData.arrayBuffer();

    // Strip non-ASCII chars (em dash, etc.) from filename — headers only allow ASCII
    const safeFilename = resource.title
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/\s+/g, "_")
      .trim() || "resource";

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"" + safeFilename + ".pdf\"",
        "X-Frame-Options": "SAMEORIGIN",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("PDF proxy error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
