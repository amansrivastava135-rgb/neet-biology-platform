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
import { Plus, Trash2, Eye, Upload, Download, FileText, Loader2, Edit } from "lucide-react";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { supabase } from "@/lib/supabase";

const SET_SIZE = 90;
const TARGET_PER_CLASS = 45;

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

// Pick exactly `count` questions from pool, balanced across chapters
function pickBalanced(
  questions: any[],
  chapterIds: number[],
  count: number,
  usedIds: Set<number>
): any[] {
  // Filter out already used questions
  const available = questions.filter((q) => !usedIds.has(q.id));

  // Group by chapter
  const byChapter: Record<number, any[]> = {};
  chapterIds.forEach((id) => {
    byChapter[id] = shuffleArray(available.filter((q) => q.chapter_id === id));
  });

  const selected: any[] = [];
  let remaining = count;

  // Round-robin across chapters until we have enough
  let round = 0;
  while (selected.length < count) {
    let anyAdded = false;
    for (const chapId of chapterIds) {
      if (selected.length >= count) break;
      if (byChapter[chapId] && byChapter[chapId][round]) {
        selected.push(byChapter[chapId][round]);
        anyAdded = true;
      }
    }
    round++;
    // No more questions available
    if (!anyAdded) break;
  }

  return selected.slice(0, count);
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
  const [generateError, setGenerateError] = useState<string | null>(null);
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

  const handleCreateAutoTest = async () => {
    if (!newTestName.trim()) {
      setGenerateError("Please enter a test name.");
      return;
    }
    setGenerateError(null);
    setIsGenerating(true);

    try {
      const class11Ids = class11Chapters.map((c) => c.id);
      const class12Ids = class12Chapters.map((c) => c.id);

      // Fetch ALL questions from both classes
      const [{ data: class11Data }, { data: class12Data }] = await Promise.all([
        supabase.from("questions").select("id, chapter_id").in("chapter_id", class11Ids),
        supabase.from("questions").select("id, chapter_id").in("chapter_id", class12Ids),
      ]);

      const class11Questions = class11Data || [];
      const class12Questions = class12Data || [];

      if (class11Questions.length < TARGET_PER_CLASS) {
        setGenerateError(
          `Not enough Class 11 questions. Need ${TARGET_PER_CLASS}, found ${class11Questions.length}.`
        );
        setIsGenerating(false);
        return;
      }

      if (class12Questions.length < TARGET_PER_CLASS) {
        setGenerateError(
          `Not enough Class 12 questions. Need ${TARGET_PER_CLASS}, found ${class12Questions.length}.`
        );
        setIsGenerating(false);
        return;
      }

      // Get ALL question IDs already used in existing mock tests
      const usedIds = new Set<number>();
      mockTests.forEach((test) => {
        test.question_ids.forEach((id) => usedIds.add(id));
      });

      // Pick 45 unique questions from Class 11
      const selected11 = pickBalanced(class11Questions, class11Ids, TARGET_PER_CLASS, usedIds);

      // Add Class 11 picked IDs to used set
      selected11.forEach((q) => usedIds.add(q.id));

      // Pick 45 unique questions from Class 12
      const selected12 = pickBalanced(class12Questions, class12Ids, TARGET_PER_CLASS, usedIds);

      if (selected11.length < TARGET_PER_CLASS) {
        setGenerateError(
          `Not enough unique Class 11 questions remaining. Found ${selected11.length} unused questions. Please add more questions.`
        );
        setIsGenerating(false);
        return;
      }

      if (selected12.length < TARGET_PER_CLASS) {
        setGenerateError(
          `Not enough unique Class 12 questions remaining. Found ${selected12.length} unused questions. Please add more questions.`
        );
        setIsGenerating(false);
        return;
      }

      // Combine and shuffle final list
      const finalQuestions = shuffleArray([...selected11, ...selected12]);
      const questionIds = finalQuestions.map((q) => q.id);

      const { error } = await supabase.from("mock_tests").insert({
        id: Date.now().toString(),
        name: newTestName.trim(),
        question_ids: questionIds,
        class11_count: selected11.length,
        class12_count: selected12.length,
      });

      if (error) {
        setGenerateError("Database error: " + error.message);
      } else {
        await fetchMockTests();
        setIsCreateDialogOpen(false);
        setNewTestName("");
        setGenerateError(null);
      }
    } catch (err: any) {
      setGenerateError("Unexpected error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvStatus("Uploading...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const text = reader.result as string;
        const lines = text.trim().split("\n");
        if (lines.length < 2) {
          setCsvStatus("No questions found in CSV.");
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
          setCsvStatus("No valid questions found.");
          return;
        }

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
              .maybeSingle();

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

        // Create mock test from uploaded questions
        if (insertedIds.length > 0) {
          const class11Ids = class11Chapters.map((c) => c.id);
          const testName = file.name.replace(".csv", "");
          const class11Count = parsedQuestions
            .filter((q) => class11Ids.includes(q.chapter_id))
            .length;
          const class12Count = parsedQuestions.length - class11Count;

          await supabase.from("mock_tests").insert({
            id: Date.now().toString(),
            name: testName,
            question_ids: insertedIds.slice(0, 90),
            class11_count: Math.min(class11Count, 45),
            class12_count: Math.min(class12Count, 45),
          });
        }

        await fetchMockTests();
        setCsvStatus(
          `${inserted} questions added, ${skipped} skipped.${insertedIds.length > 0 ? ` Mock test created from CSV.` : ""}`
        );
        setTimeout(() => setCsvStatus(null), 7000);
      } catch (err) {
        console.error(err);
        setCsvStatus("Error processing CSV.");
      }
      if (csvInputRef.current) csvInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handlePreview = async (test: MockTest) => {
    setSelectedTest(test);
    const { data } = await supabase
      .from("questions")
      .select("*")
      .in("id", test.question_ids.slice(0, 10));
    setPreviewQuestions(data || []);
    setIsPreviewOpen(true);
  };

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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this mock test?")) return;
    const { error } = await supabase.from("mock_tests").delete().eq("id", id);
    if (!error) setMockTests((prev) => prev.filter((t) => t.id !== id));
  };

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

  // Stats for each test — used IDs overlap check
  const getAllUsedIds = () => {
    const counts: Record<number, number> = {};
    mockTests.forEach((test) => {
      test.question_ids.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  };

  const usedIdCounts = getAllUsedIds();
  const duplicateCount = Object.values(usedIdCounts).filter((c) => c > 1).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Mock Test Manager</h2>
          <p className="text-sm text-muted-foreground">
            Each test: 45 Class 11 + 45 Class 12 — unique questions across all tests
          </p>
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
          <Button className="gap-2" onClick={() => { setGenerateError(null); setIsCreateDialogOpen(true); }}>
            <Plus className="h-4 w-4" />
            Auto Generate
          </Button>
        </div>
      </div>

      {/* CSV Status */}
      {csvStatus && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          csvStatus.startsWith("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
        }`}>
          {csvStatus}
        </div>
      )}

      {/* Duplicate warning */}
      {duplicateCount > 0 && (
        <div className="p-3 rounded-lg text-sm bg-amber-100 text-amber-800">
          Warning: {duplicateCount} questions are shared across multiple tests. Consider regenerating.
        </div>
      )}

      {/* Info */}
      <Card className="border-border bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-medium mb-1">Auto Generate:</p>
          <p className="text-xs text-muted-foreground">
            Picks 45 unique Class 11 + 45 unique Class 12 questions — questions already used in other tests are excluded automatically.
          </p>
          <p className="text-sm font-medium mt-3 mb-1">Upload CSV:</p>
          <p className="text-xs text-muted-foreground">
            Questions are added to Supabase (no duplicates) and a mock test is created from them.
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
              {mockTests.map((test) => {
                const sharedCount = test.question_ids.filter(
                  (id) => usedIdCounts[id] > 1
                ).length;
                return (
                  <div key={test.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-2">{test.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="default">{test.question_ids.length} Questions</Badge>
                          <Badge variant="secondary">Class 11: {test.class11_count}</Badge>
                          <Badge variant="secondary">Class 12: {test.class12_count}</Badge>
                          {sharedCount > 0 && (
                            <Badge variant="destructive">{sharedCount} shared</Badge>
                          )}
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
                );
              })}
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
              45 unique Class 11 + 45 unique Class 12 questions — no repeats from previous tests
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Test Name *</Label>
              <Input
                placeholder="e.g. Mock Test 4"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateAutoTest()}
              />
            </div>
            {generateError && (
              <p className="text-sm text-red-600">{generateError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAutoTest} disabled={isGenerating}>
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mock Test Name</DialogTitle>
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
