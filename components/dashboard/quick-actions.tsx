"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText, Crown, TrendingUp } from "lucide-react";

type QuickActionsProps = {
  isPaid: boolean;
};

export function QuickActions({ isPaid }: QuickActionsProps) {
  const actions = [
    {
      title: "Chapter Practice",
      description: "Continue practicing from where you left off",
      icon: BookOpen,
      href: "/practice",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Mock Test",
      description: "Take a full-length NEET pattern test",
      icon: FileText,
      href: "/mock-test",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: isPaid ? "Premium Active" : "Upgrade Plan",
      description: isPaid ? "You have full access to all features" : "Get access to all chapters and tests",
      icon: Crown,
      href: "/pricing",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Analytics",
      description: "View detailed performance insights",
      icon: TrendingUp,
      href: "#analytics",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {actions.map((action) => (
        <Link key={action.title} href={action.href}>
          <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className={`h-10 w-10 rounded-lg ${action.bgColor} flex items-center justify-center mb-3`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <h3 className="font-medium text-foreground mb-1">{action.title}</h3>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
