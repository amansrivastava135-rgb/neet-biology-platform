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
import { Search, Users, Crown, UserCircle, RefreshCw } from "lucide-react";

type StudentData = {
  id: string;
  name: string;
  email: string;
  isPaid: boolean;
  joinedAt: string;
  subscriptionEnd?: string;
};

export function StudentManager() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadStudents = () => {
    const registeredUsers = JSON.parse(
      localStorage.getItem("neet_registered_users") || "{}"
    );
    const studentList: StudentData[] = Object.values(registeredUsers).map(
      (entry: any) => ({
        id: entry.user.id,
        name: entry.user.name,
        email: entry.user.email,
        isPaid: entry.user.isPaid || false,
        joinedAt: entry.user.id
          ? new Date(parseInt(entry.user.id)).toLocaleDateString()
          : "N/A",
        subscriptionEnd: entry.user.subscriptionEnd,
      })
    );
    setStudents(studentList);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleGivePremium = (email: string) => {
    const registeredUsers = JSON.parse(
      localStorage.getItem("neet_registered_users") || "{}"
    );
    if (registeredUsers[email]) {
      const now = new Date();
      const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      registeredUsers[email].user = {
        ...registeredUsers[email].user,
        isPaid: true,
        subscriptionPlan: "premium",
        subscription: "active",
        subscriptionStart: now.toISOString(),
        subscriptionEnd: expiry.toISOString(),
        plan: "premium",
      };
      localStorage.setItem("neet_registered_users", JSON.stringify(registeredUsers));
      loadStudents();
      alert(`✅ Premium activated for ${email}!`);
    }
  };

  const handleRevokePremium = (email: string) => {
    const registeredUsers = JSON.parse(
      localStorage.getItem("neet_registered_users") || "{}"
    );
    if (registeredUsers[email]) {
      registeredUsers[email].user = {
        ...registeredUsers[email].user,
        isPaid: false,
        subscriptionPlan: "free",
        subscription: "free",
        subscriptionEnd: undefined,
      };
      localStorage.setItem("neet_registered_users", JSON.stringify(registeredUsers));
      loadStudents();
      alert(`❌ Premium revoked for ${email}!`);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "paid" && student.isPaid) ||
      (filterStatus === "free" && !student.isPaid);
    return matchesSearch && matchesStatus;
  });

  const paidCount = students.filter((s) => s.isPaid).length;
  const freeCount = students.filter((s) => !s.isPaid).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="paid">Premium Only</SelectItem>
            <SelectItem value="free">Free Only</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadStudents} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">
            Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
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
                    <TableHead>Joined</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell>
                        <Badge variant={student.isPaid ? "default" : "secondary"}>
                          {student.isPaid ? "Premium" : "Free"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.joinedAt}</TableCell>
                      <TableCell className="text-muted-foreground">
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
                          >
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleGivePremium(student.email)}
                            className="gap-1"
                          >
                            <Crown className="h-3 w-3" />
                            Give Premium
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}