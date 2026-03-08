import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileQuestion, Clock, BarChart3, CheckCircle, Zap } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Chapter-wise Practice",
    description: "38 chapters covering complete NCERT Biology syllabus for Class 11 and 12. Master one concept at a time.",
  },
  {
    icon: FileQuestion,
    title: "NEET PYQs Included",
    description: "Access previous year questions from 2010-2024 with detailed explanations referencing NCERT concepts.",
  },
  {
    icon: CheckCircle,
    title: "Instant Feedback",
    description: "Get immediate answer validation with comprehensive explanations after each question attempt.",
  },
  {
    icon: Clock,
    title: "Full Mock Tests",
    description: "NEET-pattern mock tests with 180 questions, 3-hour timer, and automatic score calculation.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your progress with detailed analytics showing accuracy, weak chapters, and improvement trends.",
  },
  {
    icon: Zap,
    title: "NCERT Focused",
    description: "Every question and explanation is directly linked to NCERT textbook concepts for authentic preparation.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Everything You Need to Crack NEET Biology
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete preparation platform designed specifically for NEET Biology aspirants
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
