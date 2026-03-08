"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileQuestion, BookOpen, CreditCard, TrendingUp, IndianRupee } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Mock data for demonstration
const stats = [
  {
    title: "Total Students",
    value: "1,234",
    change: "+12%",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Total Questions",
    value: "3,800",
    change: "+5%",
    icon: FileQuestion,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Active Chapters",
    value: "38",
    change: "0%",
    icon: BookOpen,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Monthly Revenue",
    value: "₹48,510",
    change: "+18%",
    icon: IndianRupee,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

const revenueData = [
  { month: "Jan", revenue: 32000 },
  { month: "Feb", revenue: 35000 },
  { month: "Mar", revenue: 38000 },
  { month: "Apr", revenue: 42000 },
  { month: "May", revenue: 45000 },
  { month: "Jun", revenue: 48510 },
];

const recentSubscriptions = [
  { name: "Rahul Kumar", email: "rahul@example.com", plan: "Premium", date: "2 hours ago" },
  { name: "Priya Singh", email: "priya@example.com", plan: "Premium", date: "5 hours ago" },
  { name: "Amit Sharma", email: "amit@example.com", plan: "Premium", date: "1 day ago" },
  { name: "Neha Gupta", email: "neha@example.com", plan: "Premium", date: "1 day ago" },
  { name: "Vikram Patel", email: "vikram@example.com", plan: "Premium", date: "2 days ago" },
];

export function AdminOverview() {
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
                <span className={`text-sm font-medium ${
                  stat.change.startsWith("+") ? "text-green-600" : "text-muted-foreground"
                }`}>
                  {stat.change}
                </span>
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
        {/* Revenue Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium text-foreground">{payload[0].payload.month}</p>
                            <p className="text-sm text-muted-foreground">
                              Revenue: ₹{payload[0].value?.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Subscriptions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Recent Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubscriptions.map((sub, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{sub.name}</p>
                    <p className="text-sm text-muted-foreground">{sub.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{sub.plan}</p>
                    <p className="text-xs text-muted-foreground">{sub.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
