"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Eye, Upload, Download, FileText } from "lucide-react";
import { sampleQuestions, class11Chapters, class12Chapters, type Question } from "@/lib/data";

const STORAGE_KEY = "neet_manual_mock_tests";

type ManualMockTest = {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  createdAt: string;
  class11Count: number;
  class12Count: number;
};

function loadMockTests(): ManualMockTest[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMockTests(tests: ManualMockTest[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  } catch {}
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateBalancedMockTest(): Question[] {
  let adminQuestions: Question[] = [];
  try {
    const stored = window.localStorage.getItem("neet_admin_questions");
    if (stored) adminQuestions = JSON.parse(stored);
  } catch {}

  const allQuestions = [...adminQuestions, ...sampleQuestions];
  const class11Ids = class11Chapters.map((c) => c.id);
  const class12Ids = class12Chapters.map((c) => c.id);

  const class11Questions = allQuestions.filter((q) => class11Ids.includes(q.chapterId));
  const class12Questions = allQuestions.filter((q) => class12Ids.includes(q.chapterId));

  // 45 from Class 11
  const selected11: Question[] = [];
  const perChapter11 = Math.ceil(45 / class11Ids.length);
  class11Ids.forEach((id) => {
    const qs = shuffleArray(class11Questions.filter((q) => q.chapterId === id));
    selected11.push(...qs.slice(0, perChapter11));
  });

  // 45 from Class 12
  const selected12: Question[] = [];
  const perChapter12 = Math.ceil(45 / class12Ids.length);
  class12Ids.forEach((id) => {
    const qs = shuffleArray(class12Questions.filter((q) => q.chapterId === id));
    selected12.push(...qs.slice(0, perChapter12));
  });

  const final11 = shuffleArray(selected11).slice(0, 45);
  const final12 = shuffleArray(selected12).slice(0, 45);

  return shuffleArray([...final11, ...final12]);
}

export function MockTestManager() {
  const [mockTests, setMockTests] = useState<ManualMockTest[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ManualMockTest | null>(null);
  const [newTestName, setNewTestName] = useState("");
  const [newTestDesc, setNewTestDesc] = useState("");
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  useEffect(() => {
    setMockTests(loadMockTests());
  }, []);

  const handleCreateAutoTest = () => {
    if (!newTestName.trim()) {
      alert("Please enter a test name!");
      return;
    }

    const questions = generateBalancedMockTest();
    const class11Ids = class11Chapters.map((c) => c.id);
    const class11Count = questions.filter((q) => class11Ids.includes(q.chapterId)).length;
    const class12Count = questions.length - class11Count;

    const newTest: ManualMockTest = {
      id: Date.now().toString(),
      name: newTestName,
      description: newTestDesc || `Auto-generated mock test with ${questions.length} questions`,
      questions,
      createdAt: new Date().toISOString(),
      class11Count,
      class12Count,
    };

    const updated = [newTest, ...mockTests];
    setMockTests(updated);
    saveMockTests(updated);
    setIsCreateDialogOpen(false);
    setNewTestName("");
    setNewTestDesc("");
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvStatus("Uploading...");
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const text = reader.result as string;
        const lines = text.trim().split("\n");
        if (lines.length < 2) {
          setCsvStatus("❌ No questions found in CSV!");
          return;
        }

        const allChapters = [...class11Chapters, ...class12Chapters];
        const questions: Question[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const fields: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let j = 0; j < line.length; j++) {
            if (line[j] === '"') inQuotes = !inQuotes;
            else if (line[j] === "," && !inQuotes) {
              fields.push(current.trim());
              current = "";
            } else {
              current += line[j];
            }
          }
          fields.push(current.trim());

          if (fields.length < 8) continue;

          const [question, optionA, optionB, optionC, optionD, correctAnswer, explanation, chapterId, source] = fields;
          const chapId = parseInt(chapterId) || 1;
          const chapter = allChapters.find((c) => c.id === chapId);

          questions.push({
            id: Date.now() + i,
            question,
            options: { A: optionA, B: optionB, C: optionC, D: optionD },
            correctAnswer: (correctAnswer?.toUpperCase() as "A" | "B" | "C" | "D") || "A",
            explanation: explanation || "",
            chapterId: chapId,
            chapterName: chapter?.name || "",
            source: (source?.toUpperCase() === "PYQ" ? "PYQ" : "NCERT") as "PYQ" | "NCERT",
          });
        }

        if (questions.length === 0) {
          setCsvStatus("❌ No valid questions found!");
          return;
        }

        const class11Ids = class11Chapters.map((c) => c.id);
        const class11Count = questions.filter((q) => class11Ids.includes(q.chapterId)).length;
        const class12Count = questions.length - class11Count;

        const testName = file.name.replace(".csv", "");
        const newTest: ManualMockTest = {
          id: Date.now().toString(),
          name: testName,
          description: `Uploaded from CSV with ${questions.length} questions`,
          questions: questions.slice(0, 90),
          createdAt: new Date().toISOString(),
          class11Count,
          class12Count,
        };

        const updated = [newTest, ...mockTests];
        setMockTests(updated);
        saveMockTests(updated);
        setCsvStatus(`✅ Mock test "${testName}" created with ${Math.min(questions.length, 90)} questions!`);
        setTimeout(() => setCsvStatus(null), 5000);
      } catch {
        setCsvStatus("❌ Error parsing CSV!");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleDelete = (id: string) => {
    const updated = mockTests.filter((t) => t.id !== id);
    setMockTests(updated);
    saveMockTests(updated);
  };

  const handleDownloadSample = () => {
    const headers = "question,optionA,optionB,optionC,optionD,correctAnswer,explanation,chapterId,source";
    const rows = [
      `"Which is the basic unit of life?","Cell","Tissue","Organ","Organism","A","Cell is the basic unit of life.",8,"NCERT"`,
      `"Binomial nomenclature was introduced by?","Aristotle","Linnaeus","Theophrastus","Darwin","B","Linnaeus introduced binomial nomenclature.",1,"PYQ"`,
    ];
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv" });
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
          <p className="text-sm text-muted-foreground">
            Create and manage custom mock tests for students
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleDownloadSample}>
            <Download className="h-4 w-4" />
            Sample CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => document.getElementById("csv-upload")?.click()}>
            <Upload className="h-4 w-4" />
            Upload CSV
          </Button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
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

      {/* Info Card */}
      <Card className="border-border bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-medium text-foreground mb-1">📋 Auto Generate:</p>
          <p className="text-xs text-muted-foreground">
            Automatically creates a balanced 90-question mock test — 45 from Class 11 + 45 from Class 12
          </p>
          <p className="text-sm font-medium text-foreground mt-3 mb-1">📤 Upload CSV:</p>
          <p className="text-xs text-muted-foreground">
            Upload custom questions via CSV (max 90 questions). Same format as Question Manager.
          </p>
        </CardContent>
      </Card>

      {/* Mock Tests List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">
            Mock Tests ({mockTests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mockTests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No mock tests created yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Auto Generate" or "Upload CSV" to create one!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockTests.map((test) => (
                <div key={test.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{test.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="default">{test.questions.length} Questions</Badge>
                        <Badge variant="secondary">Class 11: {test.class11Count}</Badge>
                        <Badge variant="secondary">Class 12: {test.class12Count}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Created: {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTest(test);
                          setIsPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(test.id)}
                      >
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto Generate Mock Test</DialogTitle>
            <DialogDescription>
              Creates a balanced 90-question test — 45 from Class 11 + 45 from Class 12
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Test Name *</Label>
              <Input
                placeholder="e.g. Mock Test 1, Full Syllabus Test..."
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                placeholder="e.g. Full syllabus practice test..."
                value={newTestDesc}
                onChange={(e) => setNewTestDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAutoTest}>Generate Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTest?.name}</DialogTitle>
            <DialogDescription>{selectedTest?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {selectedTest?.questions.slice(0, 10).map((q, i) => (
              <div key={q.id} className="p-3 border border-border rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  Q{i + 1}. {q.question}
                </p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{q.chapterName}</Badge>
                  <Badge variant="outline" className="text-xs">{q.source}</Badge>
                  <span className="text-xs text-muted-foreground">Ans: {q.correctAnswer}</span>
                </div>
              </div>
            ))}
            {selectedTest && selectedTest.questions.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                ... and {selectedTest.questions.length - 10} more questions
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}