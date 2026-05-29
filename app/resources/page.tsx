"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isPremium } from "@/lib/checkPremium";
import { Loader2, FileText, Download, ExternalLink, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Resource = {
  id: string;
  chapter_id: number;
  resource_type: string;
  title: string;
  description: string | null;
  storage_path: string;
  is_active: boolean;
  signedUrl: string | null;
};

// ─── Resource type display config ─────────────────────────────────────────────

const RESOURCE_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  "combined-notes":   { label: "Complete Notes",     icon: "📚", color: "bg-blue-50 border-blue-200 text-blue-800" },
  "revision-booklet": { label: "Revision Booklet",   icon: "📖", color: "bg-purple-50 border-purple-200 text-purple-800" },
  "pyq-compilation":  { label: "PYQ Compilation",    icon: "📝", color: "bg-amber-50 border-amber-200 text-amber-800" },
  "ncert-highlights": { label: "NCERT Highlights",   icon: "🔆", color: "bg-green-50 border-green-200 text-green-800" },
  "handbook":         { label: "Handbook",           icon: "📓", color: "bg-rose-50 border-rose-200 text-rose-800" },
  "roadmap":          { label: "Study Roadmap",      icon: "🗺️", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
  "intelligence":     { label: "Intelligence Module",icon: "🧠", color: "bg-cyan-50 border-cyan-200 text-cyan-800" },
  "revision":         { label: "Revision Notes",     icon: "✏️", color: "bg-orange-50 border-orange-200 text-orange-800" },
  "pyq-analysis":     { label: "PYQ Analysis",       icon: "📊", color: "bg-teal-50 border-teal-200 text-teal-800" },
};

function getTypeConfig(type: string) {
  return RESOURCE_TYPE_CONFIG[type] ?? { label: type, icon: "📄", color: "bg-muted border-border text-foreground" };
}

// ─── Resource Card ─────────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: Resource }) {
  const [opening, setOpening] = useState(false);
  const config = getTypeConfig(resource.resource_type);

  const handleOpen = () => {
    if (!resource.signedUrl) return;
    setOpening(true);
    window.open(resource.signedUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => setOpening(false), 1500);
  };

  return (
    <Card className="border-border hover:shadow-sm transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl leading-none mt-0.5 shrink-0">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug mb-1 truncate">
              {resource.title}
            </p>
            {resource.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {resource.description}
              </p>
            )}
            <Badge className={`text-xs border ${config.color} font-normal`}>
              {config.label}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpen}
            disabled={!resource.signedUrl || opening}
            className="shrink-0 gap-1.5"
          >
            {opening ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function ResourcesContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || !isPremium(user)) return;
    setFetchLoading(true);
    fetch("/api/resources", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setResources(data.resources ?? []))
      .catch(() => setResources([]))
      .finally(() => setFetchLoading(false));
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Non-premium users — upsell
  if (!isPremium(user)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Premium Access Required</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Study resources — complete notes, revision booklets, PYQ compilations, and more —
              are available for paid subscribers.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild><Link href="/pricing">View Plans</Link></Button>
              <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get unique resource types present in fetched data
  const presentTypes = [...new Set(resources.map((r) => r.resource_type))];
  const filters = [
    { value: "all", label: "All Resources" },
    ...presentTypes.map((t) => ({
      value: t,
      label: getTypeConfig(t).label,
    })),
  ];

  const filtered = activeFilter === "all"
    ? resources
    : resources.filter((r) => r.resource_type === activeFilter);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-3xl">

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Study Resources</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Complete notes, revision booklets, PYQ compilations, and more — all in one place.
            </p>
          </div>

          {fetchLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 border border-border rounded-xl bg-card">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-foreground font-medium mb-1">No resources yet</p>
              <p className="text-sm text-muted-foreground">
                Resources will appear here as they are uploaded.
              </p>
            </div>
          ) : (
            <>
              {/* Filter tabs */}
              {filters.length > 2 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {filters.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setActiveFilter(f.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        activeFilter === f.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {f.label}
                      {f.value !== "all" && (
                        <span className="ml-1 opacity-60">
                          ({resources.filter((r) => r.resource_type === f.value).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Resource grid */}
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No resources in this category yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filtered.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <AuthProvider>
      <ResourcesContent />
    </AuthProvider>
  );
}