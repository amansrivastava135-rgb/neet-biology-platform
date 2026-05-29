import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

const BUCKET = "chapter-resources";
const SIGNED_URL_EXPIRES = 3600; // 1 hour

export const VALID_RESOURCE_TYPES = [
  // Chapter-specific types (existing)
  "roadmap",
  "intelligence",
  "revision",
  "pyq-analysis",
  // Combined/general types (new)
  "combined-notes",
  "revision-booklet",
  "pyq-compilation",
  "ncert-highlights",
  "handbook",
];

// GET /api/resources?chapterId=N  — chapter-specific resources
// GET /api/resources               — combined/general resources (chapterId=0)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPaid =
      user.isPaid &&
      (!user.subscriptionEnd || new Date(user.subscriptionEnd) > new Date());
    if (!isPaid) {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const chapterIdParam = searchParams.get("chapterId");

    // If no chapterId → fetch combined resources (chapter_id = 0)
    const chapterId = chapterIdParam !== null ? parseInt(chapterIdParam) : 0;

    const { data: resources, error } = await supabaseAdmin
      .from("chapter_resources")
      .select("id, chapter_id, resource_type, title, description, storage_path, is_active")
      .eq("chapter_id", chapterId)
      .eq("is_active", true)
      .order("resource_type");

    if (error) {
      console.error("Resources fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
    }

    if (!resources || resources.length === 0) {
      return NextResponse.json({ resources: [] });
    }

    // Generate signed URLs for each resource
    const resourcesWithUrls = await Promise.all(
      resources.map(async (resource) => {
        const { data: signedData, error: signedError } = await supabaseAdmin.storage
          .from(BUCKET)
          .createSignedUrl(resource.storage_path, SIGNED_URL_EXPIRES);

        if (signedError || !signedData) {
          console.error("Signed URL error for", resource.storage_path, signedError);
          return { ...resource, signedUrl: null };
        }

        return { ...resource, signedUrl: signedData.signedUrl };
      })
    );

    return NextResponse.json({ resources: resourcesWithUrls });
  } catch (err) {
    console.error("Resources GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/resources — admin only
// Body: { chapterId, resourceType, title, description, storagePath }
// chapterId = 0 for combined/general resources
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { chapterId, resourceType, title, description, storagePath } = body;

    if (chapterId === undefined || chapterId === null || !resourceType || !title || !storagePath) {
      return NextResponse.json(
        { error: "chapterId, resourceType, title, storagePath are required" },
        { status: 400 }
      );
    }

    if (!VALID_RESOURCE_TYPES.includes(resourceType)) {
      return NextResponse.json({ error: "Invalid resourceType" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("chapter_resources")
      .insert({
        chapter_id: parseInt(chapterId),
        resource_type: resourceType,
        title,
        description: description || null,
        storage_path: storagePath,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Resource insert error:", error);
      return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
    }

    return NextResponse.json({ resource: data });
  } catch (err) {
    console.error("Resources POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/resources?id=uuid — admin only, soft delete
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("chapter_resources")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Resource delete error:", error);
      return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resources DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}