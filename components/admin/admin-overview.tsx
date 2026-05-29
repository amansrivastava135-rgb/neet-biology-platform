"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileQuestion, BookOpen, CreditCard, TrendingUp, IndianRupee, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function AdminOverview() {
  const [students, setStudents] = useState<any[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [premiumCount, setPremiumCount] = useState(0);
  const [estimatedRevenue, setEstimatedRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const { data: usersData } = await supabase
      .from("users")
      .select("id, name, email, is_paid, subscription_end, subscription_plan");

    if (usersData) {
      setStudents(usersData);
      setPremiumCount(usersData.filter((u) => u.is_paid).length);

      // Revenue based on actual plan
      const planPrices: Record<string, number> = {
        crash: 299,
        sixMonth: 599,
        premium: 999,
      };
      const rev = usersData
        .filter((u) => u.is_paid)
        .reduce((sum: number, u: any) => {
          return sum + (planPrices[u.subscription_plan] || 999);
        }, 0);
      setEstimatedRevenue(rev);
    }

    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true });

    setTotalQuestions(count || 0);
    setLastUpdated(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalChapters = class11Chapters.length + class12Chapters.length;

  const stats = [
    {
      title: "Total Students",
      value: isLoading ? "..." : students.length.toString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Questions",
      value: isLoading ? "..." : totalQuestions.toString(),
      icon: FileQuestion,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Active Chapters",
      value: totalChapters.toString(),
      icon: BookOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Est. Revenue",
      value: isLoading ? "..." : `₹${estimatedRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  const recentPremium = students.filter((s) => s.is_paid).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Refresh */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Students Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { label: "Free", count: students.length - premiumCount },
                    { label: "Crash", count: students.filter((s) => s.subscription_plan === "crash").length },
                    { label: "6 Month", count: students.filter((s) => s.subscription_plan === "sixMonth").length },
                    { label: "Yearly", count: students.filter((s) => s.subscription_plan === "premium").length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium text-foreground">{payload[0].payload.label}</p>
                            <p className="text-sm text-muted-foreground">Students: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Premium */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Recent Premium Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPremium.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No premium students yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPremium.map((student) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-500">
                        {student.subscription_plan === "crash"
                          ? "Crash Pack"
                          : student.subscription_plan === "sixMonth"
                          ? "6 Month"
                          : "Yearly"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.subscription_end
                          ? `Expires: ${new Date(student.subscription_end).toLocaleDateString()}`
                          : "Active"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
