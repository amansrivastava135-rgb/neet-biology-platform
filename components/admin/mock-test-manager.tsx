"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Eye, Upload, Download, FileText, Loader2, Edit, X } from "lucide-react";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SET_SIZE = 90;

type MockTest = {
  id: string;
  name: string;
  question_ids: number[];
  class11_count: number;
  class12_count: number;
  created_at: string;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function MockTestManager() {
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [newTestName, setNewTestName] = useState("");
  const [csvStatus, setCsvStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editName, setEditName] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMockTests();
  }, []);

  async function fetchMockTests() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("mock_tests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setMockTests(data);
    setIsLoading(false);
  }

  // Auto generate — Supabase se 50% Class 11 + 50% Class 12
  const handleCreateAutoTest = async () => {
    if (!newTestName.trim()) {
      alert("Test name daalo!");
      return;
    }
    setIsGenerating(true);

    const class11Ids = class11Chapters.map((c) => c.id);
    const class12Ids = class12Chapters.map((c) => c.id);

    // Class 11 questions
    const { data: class11Data } = await supabase
      .from("questions")
      .select("id, chapter_id")
      .in("chapter_id", class11Ids);

    // Class 12 questions
    const { data: class12Data } = await supabase
      .from("questions")
      .select("id, chapter_id")
      .in("chapter_id", class12Ids);

    const class11Questions = class11Data || [];
    const class12Questions = class12Data || [];

    // 45 from Class 11 — balanced
    const selected11: any[] = [];
    const perChapter11 = Math.ceil(45 / class11Ids.length);
    class11Ids.forEach((id) => {
      const qs = shuffleArray(class11Questions.filter((q) => q.chapter_id === id));
      selected11.push(...qs.slice(0, perChapter11));
    });

    // 45 from Class 12 — balanced
    const selected12: any[] = [];
    const perChapter12 = Math.ceil(45 / class12Ids.length);
    class12Ids.forEach((id) => {
      const qs = shuffleArray(class12Questions.filter((q) => q.chapter_id === id));
      selected12.push(...qs.slice(0, perChapter12));
    });

    const final11 = shuffleArray(selected11).slice(0, 45);
    const final12 = shuffleArray(selected12).slice(0, 45);
    const finalQuestions = shuffleArray([...final11, ...final12]);

    const questionIds = finalQuestions.map((q) => q.id);

    const { error } = await supabase.from("mock_tests").insert({
      id: Date.now().toString(),
      name: newTestName,
      question_ids: questionIds,
      class11_count: final11.length,
      class12_count: final12.length,
    });

    if (!error) {
      await fetchMockTests();
      setIsCreateDialogOpen(false);
      setNewTestName("");
    } else {
      alert("Error: " + error.message);
    }
    setIsGenerating(false);
  };

  // CSV Upload — questions Supabase mein + mock test bhi
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvStatus("⏳ Uploading...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const text = reader.result as string;
        const lines = text.trim().split("\n");
        if (lines.length < 2) {
          setCsvStatus("❌ No questions found!");
          return;
        }

        const allChapters = [...class11Chapters, ...class12Chapters];
        const parsedQuestions: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const fields: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let j = 0; j < line.length; j++) {
            if (line[j] === '"') inQuotes = !inQuotes;
            else if (line[j] === "," && !inQuotes) {
              fields.push(current.trim()); current = "";
            } else { current += line[j]; }
          }
          fields.push(current.trim());
          if (fields.length < 8) continue;

          const [question, optionA, optionB, optionC, optionD, correctAnswer, explanation, chapterId, source, year] = fields;
          const chapId = parseInt(chapterId) || 1;
          const chapter = allChapters.find((c) => c.id === chapId);

          parsedQuestions.push({
            question,
            option_a: optionA,
            option_b: optionB,
            option_c: optionC,
            option_d: optionD,
            correct_answer: correctAnswer?.toUpperCase() || "A",
            explanation: explanation || "",
            chapter_id: chapId,
            chapter_name: chapter?.name || "",
            source: source?.toUpperCase() === "PYQ" ? "PYQ" : "NCERT",
            year: year && !isNaN(parseInt(year)) ? parseInt(year) : null,
          });
        }

        if (parsedQuestions.length === 0) {
          setCsvStatus("❌ No valid questions!");
          return;
        }

        // Supabase mein questions add karo
        let inserted = 0;
        let skipped = 0;
        const insertedIds: number[] = [];

        const byChapter: Record<number, any[]> = {};
        for (const q of parsedQuestions) {
          if (!byChapter[q.chapter_id]) byChapter[q.chapter_id] = [];
          byChapter[q.chapter_id].push(q);
        }

        for (const [chapId, qs] of Object.entries(byChapter)) {
          const { count } = await supabase
            .from("questions")
            .select("*", { count: "exact", head: true })
            .eq("chapter_id", parseInt(chapId));

          let currentCount = count || 0;

          for (const q of qs) {
            const { data: existing } = await supabase
              .from("questions")
              .select("id")
              .eq("chapter_id", q.chapter_id)
              .eq("question", q.question)
              .single();

            if (existing) { skipped++; continue; }

            const setNumber = Math.floor(currentCount / SET_SIZE) + 1;
            const { data: inserted_q, error } = await supabase
              .from("questions")
              .insert({ ...q, set_number: setNumber })
              .select("id")
              .single();

            if (!error && inserted_q) {
              insertedIds.push(inserted_q.id);
              inserted++;
              currentCount++;
            }
          }
        }

        // Mock test bhi Supabase mein save karo
        const testName = file.name.replace(".csv", "");
        const class11Ids = class11Chapters.map((c) => c.id);

        // Jo questions insert hue + existing questions for this mock test
        const allQIds = insertedIds;
        const class11Count = parsedQuestions
          .filter((q) => class11Ids.includes(q.chapter_id))
          .length;
        const class12Count = parsedQuestions.length - class11Count;

        if (allQIds.length > 0) {
          await supabase.from("mock_tests").insert({
            id: Date.now().toString(),
            name: testName,
            question_ids: allQIds.slice(0, 90),
            class11_count: class11Count,
            class12_count: class12Count,
          });
        }

        await fetchMockTests();
        setCsvStatus(
          `✅ ${inserted} questions added to Supabase, ${skipped} skipped. Mock test "${testName}" created!`
        );
        setTimeout(() => setCsvStatus(null), 7000);
      } catch (err) {
        console.error(err);
        setCsvStatus("❌ Error processing CSV!");
      }
      if (csvInputRef.current) csvInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  // Preview — questions fetch karo
  const handlePreview = async (test: MockTest) => {
    setSelectedTest(test);
    const { data } = await supabase
      .from("questions")
      .select("*")
      .in("id", test.question_ids.slice(0, 10));
    setPreviewQuestions(data || []);
    setIsPreviewOpen(true);
  };

  // Edit — name update karo
  const handleEdit = (test: MockTest) => {
    setSelectedTest(test);
    setEditName(test.name);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTest || !editName.trim()) return;
    const { error } = await supabase
      .from("mock_tests")
      .update({ name: editName })
      .eq("id", selectedTest.id);

    if (!error) {
      await fetchMockTests();
      setIsEditOpen(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("mock_tests").delete().eq("id", id);
    if (!error) setMockTests((prev) => prev.filter((t) => t.id !== id));
  };

  // Sample CSV download
  const handleDownloadSample = () => {
    const headers = "question,optionA,optionB,optionC,optionD,correctAnswer,explanation,chapterId,source,year";
    const r1 = `"Which is the basic unit of life?","Cell","Tissue","Organ","Organism","A","Cell is the basic unit.",8,"NCERT",""`;
    const r2 = `"Binomial nomenclature was introduced by?","Aristotle","Linnaeus","Theophrastus","Darwin","B","Linnaeus introduced it.",1,"PYQ","2020"`;
    const blob = new Blob([`${headers}\n${r1}\n${r2}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_mock_test.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Mock Test Manager</h2>
          <p className="text-sm text-muted-foreground">Create and manage mock tests — stored in Supabase</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={handleDownloadSample}>
            <Download className="h-4 w-4" />
            Sample CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => csvInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Upload CSV
          </Button>
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Auto Generate
          </Button>
        </div>
      </div>

      {/* CSV Status */}
      {csvStatus && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          csvStatus.startsWith("✅") ? "bg-green-100 text-green-800" :
          csvStatus.startsWith("❌") ? "bg-red-100 text-red-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {csvStatus}
        </div>
      )}

      {/* Info */}
      <Card className="border-border bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-medium mb-1">📋 Auto Generate:</p>
          <p className="text-xs text-muted-foreground">
            45 questions Class 11 + 45 questions Class 12 — balanced across all chapters from Supabase
          </p>
          <p className="text-sm font-medium mt-3 mb-1">📤 Upload CSV:</p>
          <p className="text-xs text-muted-foreground">
            Questions Supabase mein add honge (no duplicates) + mock test bhi save hoga
          </p>
        </CardContent>
      </Card>

      {/* Mock Tests List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">
            Mock Tests ({isLoading ? "..." : mockTests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
          ) : mockTests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No mock tests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockTests.map((test) => (
                <div key={test.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-2">{test.name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="default">{test.question_ids.length} Questions</Badge>
                        <Badge variant="secondary">Class 11: {test.class11_count}</Badge>
                        <Badge variant="secondary">Class 12: {test.class12_count}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(test.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handlePreview(test)}>
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(test)}>
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto Generate Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto Generate Mock Test</DialogTitle>
            <DialogDescription>
              45 Class 11 + 45 Class 12 questions from Supabase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Test Name *</Label>
              <Input
                placeholder="e.g. Mock Test 4"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAutoTest} disabled={isGenerating}>
              {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</> : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mock Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Test Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTest?.name}</DialogTitle>
            <DialogDescription>
              {selectedTest?.question_ids.length} questions total — showing first 10
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {previewQuestions.map((q, i) => (
              <div key={q.id} className="p-3 border border-border rounded-lg">
                <p className="text-sm font-medium">Q{i + 1}. {q.question}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{q.chapter_name}</Badge>
                  <Badge variant="outline" className="text-xs">{q.source}</Badge>
                  <span className="text-xs text-muted-foreground">Ans: {q.correct_answer}</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}