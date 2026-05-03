"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Target, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/20" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Crack NEET Biology with <span className="text-primary">NCERT + PYQs</span> + Mock Tests
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Structured chapter-wise practice with 3800+ MCQs, Previous Year Questions (2010–2025), 
            full-length mock tests, and performance analytics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Button size="lg" asChild className="gap-2 w-full sm:w-auto">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="gap-2 w-full sm:w-auto">
                  <Link href="/signup">
                    Start Practicing Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/practice">Explore Chapters</Link>
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">38</p>
              <p className="text-sm text-muted-foreground">Chapters</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">3800+</p>
              <p className="text-sm text-muted-foreground">MCQs</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">15+</p>
              <p className="text-sm text-muted-foreground">Mock Tests</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">2010–2025</p>
              <p className="text-sm text-muted-foreground">PYQs Coverage</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
