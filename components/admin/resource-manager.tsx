"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { class11Chapters, class12Chapters } from "@/lib/data";
import {
  Upload,
  Trash2,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Plus,
} from "lucide-react";

const allChapters = [
  ...class11Chapters.map((c) => ({ ...c, class: 11 })),
  ...class12Chapters.map((c) => ({ ...c, class: 12 })),
];

const RESOURCE_TYPES = [
  { value: "roadmap", label: "Study Plan", description: "Roadmap PDF" },
  { value: "intelligence", label: "Intelligence Module", description: "RE-NEET intelligence PDF" },
  { value: "revision", label: "Revision Notes", description: "Quick revision PDF" },
  { value: "pyq-analysis", label: "PYQ Analysis", description: "PYQ pattern analysis PDF" },
];

type Resource = {
  id: string;
  chapter_id: number;
  resource_type: string;
  title: string;
  description: string | null;
  storage_path: string;
  is_active: boolean;
};

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

async function fetchResourcesForChapter(chapterId: number): Promise<Resource[]> {
  try {
    // Admin can use a direct supabase query via admin API — we reuse /api/resources
    // but need all resources including inactive for admin view
    // For now fetch active only — extend later with admin-specific endpoint if needed
    const res = await fetch(`/api/resources?chapterId=${chapterId}`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.resources || [];
  } catch {
    return [];
  }
}

async function deleteResource(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/resources?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function ResourceManager() {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [resourceType, setResourceType] = useState<string>("roadmap");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedChapter = allChapters.find((c) => c.id === selectedChapterId);

  // Load resources whenever chapter changes
  useEffect(() => {
    setResourcesLoading(true);
    fetchResourcesForChapter(selectedChapterId).then((r) => {
      setResources(r);
      setResourcesLoading(false);
    });
  }, [selectedChapterId]);

  // Auto-fill title based on chapter + type
  useEffect(() => {
    if (!selectedChapter) return;
    const typeLabel = RESOURCE_TYPES.find((t) => t.value === resourceType)?.label ?? "";
    setTitle(`${selectedChapter.name} — ${typeLabel}`);
  }, [selectedChapterId, resourceType, selectedChapter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setUploadState({ status: "error", message: "Only PDF files are allowed." });
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setUploadState({ status: "error", message: "File must be under 20 MB." });
      return;
    }
    setFile(f);
    setUploadState({ status: "idle" });
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setUploadState({ status: "error", message: "File and title are required." });
      return;
    }

    setUploadState({ status: "uploading", progress: 0 });

    try {
      // Step 1: Get signed upload URL from our API
      const urlRes = await fetch("/api/resources/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fileName: file.name,
          chapterId: selectedChapterId,
          resourceType,
        }),
      });

      if (!urlRes.ok) {
        const err = await urlRes.json();
        setUploadState({ status: "error", message: err.error || "Failed to get upload URL." });
        return;
      }

      const { uploadUrl, storagePath } = await urlRes.json();

      setUploadState({ status: "uploading", progress: 30 });

      // Step 2: Upload file directly to Supabase Storage
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });

      if (!uploadRes.ok) {
        setUploadState({ status: "error", message: "File upload to storage failed." });
        return;
      }

      setUploadState({ status: "uploading", progress: 70 });

      // Step 3: Create resource record in DB
      const recordRes = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          chapterId: selectedChapterId,
          resourceType,
          title: title.trim(),
          description: description.trim() || null,
          storagePath,
        }),
      });

      if (!recordRes.ok) {
        const err = await recordRes.json();
        setUploadState({ status: "error", message: err.error || "Failed to save resource record." });
        return;
      }

      setUploadState({ status: "success", message: `"${title}" uploaded successfully.` });

      // Reset form
      setFile(null);
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Reload resources list
      setResourcesLoading(true);
      fetchResourcesForChapter(selectedChapterId).then((r) => {
        setResources(r);
        setResourcesLoading(false);
      });
    } catch (err) {
      console.error("Upload error:", err);
      setUploadState({ status: "error", message: "Unexpected error during upload." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this resource? This will hide it from students.")) return;
    setDeletingId(id);
    const ok = await deleteResource(id);
    if (ok) {
      setResources((prev) => prev.filter((r) => r.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Upload Chapter Resource
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Chapter selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Chapter
            </label>
            <div className="relative">
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(parseInt(e.target.value))}
                className="w-full appearance-none border border-border rounded-lg px-3 py-2.5
                  text-sm bg-background text-foreground pr-8 focus:outline-none focus:ring-2
                  focus:ring-primary/30 focus:border-primary"
              >
                <optgroup label="Class 11">
                  {class11Chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      Ch {c.id} — {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Class 12">
                  {class12Chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      Ch {c.id} — {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4
                text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Resource type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Resource Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RESOURCE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setResourceType(type.value)}
                  className={`px-3 py-2.5 text-left rounded-lg border text-sm transition-all ${
                    resourceType === type.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <p className="font-medium leading-tight">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource title shown to students"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm
                bg-background text-foreground focus:outline-none focus:ring-2
                focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description shown under the title"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm
                bg-background text-foreground focus:outline-none focus:ring-2
                focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* File picker */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              PDF File <span className="text-muted-foreground font-normal">(max 20 MB)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                transition-colors ${
                  file
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <FileText className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click to select PDF</p>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          {uploadState.status === "error" && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {uploadState.message}
            </div>
          )}
          {uploadState.status === "success" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {uploadState.message}
            </div>
          )}

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={!file || !title.trim() || uploadState.status === "uploading"}
            className="w-full"
          >
            {uploadState.status === "uploading" ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {(uploadState as any).progress < 70 ? "Uploading file…" : "Saving record…"}
              </>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />Upload Resource</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Resources for selected chapter */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Resources — Ch {selectedChapterId}: {selectedChapter?.name}
            </CardTitle>
            {resourcesLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent>
          {resourcesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No resources uploaded for this chapter yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => {
                const typeLabel =
                  RESOURCE_TYPES.find((t) => t.value === resource.resource_type)?.label ??
                  resource.resource_type;

                return (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between gap-3 p-3
                      border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {resource.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs">
                            {typeLabel}
                          </Badge>
                          {resource.description && (
                            <span className="text-xs text-muted-foreground truncate">
                              {resource.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(resource.id)}
                      disabled={deletingId === resource.id}
                    >
                      {deletingId === resource.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}