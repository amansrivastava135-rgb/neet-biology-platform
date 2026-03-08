"use client";

import { useState } from "react";
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
import { Search, Users, Crown, UserCircle } from "lucide-react";

// Mock student data
const mockStudents = [
  { id: 1, name: "Rahul Kumar", email: "rahul@example.com", isPaid: true, questionsAttempted: 450, accuracy: 78, joinedAt: "2024-01-15" },
  { id: 2, name: "Priya Singh", email: "priya@example.com", isPaid: true, questionsAttempted: 380, accuracy: 82, joinedAt: "2024-01-20" },
  { id: 3, name: "Amit Sharma", email: "amit@example.com", isPaid: false, questionsAttempted: 120, accuracy: 65, joinedAt: "2024-02-01" },
  { id: 4, name: "Neha Gupta", email: "neha@example.com", isPaid: true, questionsAttempted: 520, accuracy: 85, joinedAt: "2024-02-10" },
  { id: 5, name: "Vikram Patel", email: "vikram@example.com", isPaid: false, questionsAttempted: 80, accuracy: 60, joinedAt: "2024-02-15" },
  { id: 6, name: "Anjali Verma", email: "anjali@example.com", isPaid: true, questionsAttempted: 310, accuracy: 75, joinedAt: "2024-02-20" },
  { id: 7, name: "Rohit Jain", email: "rohit@example.com", isPaid: false, questionsAttempted: 50, accuracy: 70, joinedAt: "2024-03-01" },
  { id: 8, name: "Sneha Reddy", email: "sneha@example.com", isPaid: true, questionsAttempted: 420, accuracy: 88, joinedAt: "2024-03-05" },
];

export function StudentManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "paid" && student.isPaid) ||
      (filterStatus === "free" && !student.isPaid);
    return matchesSearch && matchesStatus;
  });

  const paidCount = mockStudents.filter(s => s.isPaid).length;
  const freeCount = mockStudents.filter(s => !s.isPaid).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockStudents.length}</p>
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

      {/* Filters */}
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
      </div>

      {/* Students Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">
            Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Questions</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                  <TableHead></TableHead>
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
                    <TableCell className="text-right">{student.questionsAttempted}</TableCell>
                    <TableCell className="text-right">
                      <span className={student.accuracy >= 70 ? "text-green-600" : "text-amber-600"}>
                        {student.accuracy}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(student.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
