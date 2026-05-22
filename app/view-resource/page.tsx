"use client";

import { useEffect, useState } from "react";
import { isPremium } from "@/lib/checkPremium";
import { Loader2, ArrowLeft, FileText, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ViewResourcePage() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<{
    resourceId: string;
    chapterId: string;
    chapterName: string;
    resourceTitle: string;
  } | null>(null);

  useEffect(() => {
    // Read params from URL directly — avoids SSR/Suspense hydration issues
    const search = new URLSearchParams(window.location.search);
    const resourceId = search.get("id") ?? "";
    const chapterId = search.get("chapterId") ?? "";
    const chapterName = search.get("chapter") ?? "Chapter";
    const resourceTitle = search.get("title") ?? "Resource";

    setParams({ resourceId, chapterId, chapterName, resourceTitle });

    if (!resourceId || !chapterId) {
      setError("Invalid resource link.");
      return;
    }

    try {
      const stored = localStorage.getItem("neet_user");
      if (!stored) {
        window.location.href = "/login";
        return;
      }
      const user = JSON.parse(stored);
      if (!isPremium(user)) {
        window.location.href = "/pricing";
        return;
      }
      setReady(true);
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const handleBack = () => {
    window.location.href = "/practice";
  };

  const handleOpenPDF = () => {
    if (!params) return;
    window.open(`/api/resources/pdf?id=${params.resourceId}&chapterId=${params.chapterId}`, "_blank");
  };

  if (!ready && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Unable to load resource</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Branded header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {params?.resourceTitle}
                </p>
                <p className="text-xs text-muted-foreground truncate leading-tight">
                  {params?.chapterName}
                </p>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold tracking-widest text-primary shrink-0 select-none">
            MASTER360
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {params?.resourceTitle}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {params?.chapterName}
          </p>
          <Button
            className="w-full gap-2 h-12 text-base"
            onClick={handleOpenPDF}
          >
            <ExternalLink className="h-4 w-4" />
            Open PDF
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Use your browser's back button to return
          </p>
        </div>
      </div>
    </div>
  );
}