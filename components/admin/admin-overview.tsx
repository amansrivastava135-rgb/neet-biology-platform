 "use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileQuestion, BookOpen, CreditCard, TrendingUp, IndianRupee } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { class11Chapters, class12Chapters } from "@/lib/data";

type StudentData = {
  id: string;
  name: string;
  email: string;
  isPaid: boolean;
  subscriptionEnd?: string;
};

export function AdminOverview() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [premiumCount, setPremiumCount] = useState(0);

  useEffect(() => {
    // Load real students from localStorage
    const registeredUsers = JSON.parse(
      window.localStorage.getItem("neet_registered_users") || "{}"
    );
    const studentList: StudentData[] = Object.values(registeredUsers).map(
      (entry: any) => ({
        id: entry.user.id,
        name: entry.user.name,
        email: entry.user.email,
        isPaid: entry.user.isPaid || false,
        subscriptionEnd: entry.user.subscriptionEnd,
      })
    );
    setStudents(studentList);
    setPremiumCount(studentList.filter((s) => s.isPaid).length);

    // Load real questions count
    const savedQuestions = JSON.parse(
      window.localStorage.getItem("neet_admin_questions") || "[]"
    );
    setTotalQuestions(savedQuestions.length);
  }, []);

  const totalChapters = class11Chapters.length + class12Chapters.length;
  const revenue = premiumCount * 499;

  const stats = [
    {
      title: "Total Students",
      value: students.length.toString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Questions",
      value: totalQuestions.toString(),
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
      value: `₹${revenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  // Recent premium students
  const recentPremium = students
    .filter((s) => s.isPaid)
    .slice(0, 5);

  return (
    <div className="space-y-6">
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
        {/* Premium vs Free Chart */}
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
                <LineChart
                  data={[
                    { label: "Free", count: students.length - premiumCount },
                    { label: "Premium", count: premiumCount },
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
                            <p className="font-medium text-foreground">
                              {payload[0].payload.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Students: {payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Premium Students */}
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
                <p className="text-muted-foreground text-sm">
                  No premium students yet.
                </p>
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
                      <p className="text-sm font-medium text-foreground">Premium</p>
                      <p className="text-xs text-muted-foreground">
                        {student.subscriptionEnd
                          ? `Expires: ${new Date(student.subscriptionEnd).toLocaleDateString()}`
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