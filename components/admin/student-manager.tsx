"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users, Crown, UserCircle, RefreshCw, Map } from "lucide-react";
import { PRICING } from "@/lib/pricing-config";

type StudentData = {
  id: string;
  name: string;
  email: string;
  isPaid: boolean;
  joinedAt: string;
  subscriptionEnd?: string;
  subscriptionPlan?: string;
  track?: "class11" | "class12" | "dropper" | null;
};

const TRACK_LABELS: Record<string, string> = {
  class11: "Class 11",
  class12: "Class 12",
  dropper: "Dropper",
};

export function StudentManager() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [grantPlanId, setGrantPlanId] = useState<Record<string, string>>({});
  const [grantTrack, setGrantTrack] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadStudents = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/students", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.students) setStudents(data.students);
      } else {
        const data = await res.json();
        setFetchError(data.error || "Failed to load students");
      }
    } catch {
      setFetchError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const handleGivePremium = async (email: string) => {
    const planId = grantPlanId[email] || "premium";
    const plan = PRICING[planId as keyof typeof PRICING];
    const track = grantTrack[email] || null;

    // Guided plan requires a track to be selected
    if (planId === "guided" && !track) {
      alert("⚠️ Please select a track (Class 11 / Class 12 / Dropper) for the Guided Plan.");
      return;
    }

    setLoadingEmail(email);
    try {
      const res = await fetch("/api/admin/grant-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, action: "grant", planId, track }),
      });

      const data = await res.json();
      if (data.success) {
        await loadStudents();
        alert(`✅ ${plan.id} activated for ${email}! (${plan.durationDays} days)`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch {
      alert("❌ Network error. Please try again.");
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleRevokePremium = async (email: string) => {
    setLoadingEmail(email);
    try {
      const res = await fetch("/api/admin/grant-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, action: "revoke" }),
      });

      const data = await res.json();
      if (data.success) {
        await loadStudents();
        alert(`✅ Premium revoked for ${email}!`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch {
      alert("❌ Network error. Please try again.");
    } finally {
      setLoadingEmail(null);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "paid" && student.isPaid) ||
      (filterStatus === "free" && !student.isPaid) ||
      (filterStatus === "guided" && student.subscriptionPlan === "guided");
    return matchesSearch && matchesStatus;
  });

  const paidCount = students.filter((s) => s.isPaid).length;
  const freeCount = students.filter((s) => !s.isPaid).length;
  const guidedCount = students.filter((s) => s.subscriptionPlan === "guided").length;

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{paidCount}</p>
                <p className="text-sm text-muted-foreground">Premium Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Map className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{guidedCount}</p>
                <p className="text-sm text-muted-foreground">Guided Plan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{freeCount}</p>
                <p className="text-sm text-muted-foreground">Free Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="paid">Premium Only</SelectItem>
            <SelectItem value="guided">Guided Only</SelectItem>
            <SelectItem value="free">Free Only</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadStudents} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">
            Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{fetchError}</p>
              <Button variant="outline" onClick={loadStudents}>Try Again</Button>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No students registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const selectedPlan = grantPlanId[student.email] || "premium";
                    const isGuidedSelected = selectedPlan === "guided";

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{student.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={student.isPaid ? "default" : "secondary"}
                            className={student.subscriptionPlan === "guided"
                              ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                              : ""}
                          >
                            {student.subscriptionPlan === "guided"
                              ? "🗺️ Guided"
                              : student.isPaid ? "Premium" : "Free"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {student.subscriptionPlan || "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {student.track ? (
                            <Badge variant="outline" className="text-xs">
                              {TRACK_LABELS[student.track] ?? student.track}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {student.joinedAt}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {student.subscriptionEnd
                            ? new Date(student.subscriptionEnd).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {student.isPaid ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokePremium(student.email)}
                              disabled={loadingEmail === student.email}
                            >
                              {loadingEmail === student.email ? "Revoking..." : "Revoke"}
                            </Button>
                          ) : (
                            <div className="flex flex-col gap-1.5 min-w-[200px]">
                              {/* Plan selector */}
                              <div className="flex items-center gap-2">
                                <Select
                                  value={selectedPlan}
                                  onValueChange={(val) =>
                                    setGrantPlanId((prev) => ({ ...prev, [student.email]: val }))
                                  }
                                >
                                  <SelectTrigger className="h-8 w-32 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monthly">Monthly (30d)</SelectItem>
                                    <SelectItem value="sixMonth">6 Month</SelectItem>
                                    <SelectItem value="premium">Yearly</SelectItem>
                                    <SelectItem value="guided">🗺️ Guided (1yr)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleGivePremium(student.email)}
                                  disabled={loadingEmail === student.email}
                                  className="gap-1"
                                >
                                  <Crown className="h-3 w-3" />
                                  {loadingEmail === student.email ? "Granting..." : "Grant"}
                                </Button>
                              </div>

                              {/* Track selector — only visible when Guided is selected */}
                              {isGuidedSelected && (
                                <Select
                                  value={grantTrack[student.email] || ""}
                                  onValueChange={(val) =>
                                    setGrantTrack((prev) => ({ ...prev, [student.email]: val }))
                                  }
                                >
                                  <SelectTrigger className="h-8 w-full text-xs border-indigo-300">
                                    <SelectValue placeholder="Select track…" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="class11">📘 Class 11</SelectItem>
                                    <SelectItem value="class12">📗 Class 12</SelectItem>
                                    <SelectItem value="dropper">🎯 Dropper</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
