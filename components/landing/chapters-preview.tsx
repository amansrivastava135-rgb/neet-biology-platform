import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { class11Chapters, class12Chapters } from "@/lib/data";

export function ChaptersPreview() {
  // Show first 8 chapters from each class
  const previewClass11 = class11Chapters.slice(0, 8);
  const previewClass12 = class12Chapters.slice(0, 8);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Complete NCERT Biology Syllabus
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            All 38 chapters from Class 11 and 12 Biology with 100 MCQs each
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Class 11 */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Class 11 Biology</CardTitle>
                <Badge variant="secondary">22 Chapters</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {previewClass11.map((chapter, index) => (
                  <li key={chapter.id} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{chapter.name}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mb-4">
                + {class11Chapters.length - 8} more chapters...
              </p>
            </CardContent>
          </Card>

          {/* Class 12 */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Class 12 Biology</CardTitle>
                <Badge variant="secondary">16 Chapters</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {previewClass12.map((chapter, index) => (
                  <li key={chapter.id} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{chapter.name}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mb-4">
                + {class12Chapters.length - 8} more chapters...
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button size="lg" asChild className="gap-2">
            <Link href="/practice">
              View All Chapters
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
