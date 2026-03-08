import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Award, Users, BookOpen } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-6">
              About Your Instructor
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <span className="font-semibold text-foreground">Dr. Amankumar Srivastav</span> is 
                an experienced NEET Biology mentor with over a decade of teaching excellence. 
                His unique methodology focuses on building strong conceptual foundations through 
                NCERT-based learning.
              </p>
              <p>
                Having guided thousands of students to success in NEET, Dr. Srivastav understands 
                the importance of systematic practice and targeted preparation. This platform 
                embodies his teaching philosophy: master NCERT concepts, practice previous year 
                questions, and build exam temperament through mock tests.
              </p>
              <p>
                Every question on this platform is carefully curated to align with NEET exam 
                patterns and NCERT concepts, ensuring you get the most relevant preparation 
                material for your medical entrance journey.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border">
              <CardContent className="pt-6">
                <GraduationCap className="h-10 w-10 text-primary mb-4" />
                <p className="text-3xl font-bold text-foreground">5+</p>
                <p className="text-sm text-muted-foreground">Years of Experience</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <Users className="h-10 w-10 text-primary mb-4" />
                <p className="text-3xl font-bold text-foreground">NEET</p>
                <p className="text-sm text-muted-foreground">Specialized Coaching</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <BookOpen className="h-10 w-10 text-primary mb-4" />
                <p className="text-3xl font-bold text-foreground">100%</p>
                <p className="text-sm text-muted-foreground">NCERT Focused</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
