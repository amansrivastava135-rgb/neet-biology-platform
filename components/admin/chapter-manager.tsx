"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { BookOpen, FileQuestion, Edit, Plus, Loader2, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ChapterStats = {
  chapterId: number;
  total: number;
  pyq: number;
  ncert: number;
};

type Question = {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  source: string;
  year?: number;
  set_number: number;
};

type ChapterData = {
  id: number;
  name: string;
  questionCount: number;
};

export function ChapterManager() {
  const [chapterStats, setChapterStats] = useState<ChapterStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPYQ, setTotalPYQ] = useState(0);
  const [editingChapter, setEditingChapter] = useState<ChapterData | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const { data, error } = await supabase
      .from("questions")
      .select("chapter_id, source");

    if (error || !data) {
      setIsLoading(false);
      return;
    }

    const statsMap: Record<number, ChapterStats> = {};
    data.forEach((q) => {
      if (!statsMap[q.chapter_id]) {
        statsMap[q.chapter_id] = { chapterId: q.chapter_id, total: 0, pyq: 0, ncert: 0 };
      }
      statsMap[q.chapter_id].total++;
      if (q.source === "PYQ") statsMap[q.chapter_id].pyq++;
      else statsMap[q.chapter_id].ncert++;
    });

    setChapterStats(Object.values(statsMap));
    setTotalQuestions(data.length);
    setTotalPYQ(data.filter((q) => q.source === "PYQ").length);
    setIsLoading(false);
  }

  const getStats = (chapterId: number): ChapterStats =>
    chapterStats.find((s) => s.chapterId === chapterId) || {
      chapterId, total: 0, pyq: 0, ncert: 0,
    };

  return (
    <div className="space-y-6">
      {/* Chapter Edit Modal */}
      {editingChapter && (
        <ChapterEditModal
          chapter={editingChapter}
          onClose={() => {
            setEditingChapter(null);
            fetchStats(); // refresh stats after edit
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Chapter Management</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all chapters and their question counts
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading chapter data...</span>
        </div>
      ) : (
        <Tabs defaultValue="11">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="11">Class 11 ({class11Chapters.length})</TabsTrigger>
            <TabsTrigger value="12">Class 12 ({class12Chapters.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="11">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Class 11 Biology Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {class11Chapters.map((chapter, index) => (
                    <ChapterRow
                      key={chapter.id}
                      chapter={chapter}
                      index={index}
                      stats={getStats(chapter.id)}
                      onEdit={() => setEditingChapter(chapter)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="12">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Class 12 Biology Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {class12Chapters.map((chapter, index) => (
                    <ChapterRow
                      key={chapter.id}
                      chapter={chapter}
                      index={index}
                      stats={getStats(chapter.id)}
                      onEdit={() => setEditingChapter(chapter)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {class11Chapters.length + class12Chapters.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Chapters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : totalQuestions}
                </p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : totalPYQ}
                </p>
                <p className="text-sm text-muted-foreground">PYQs Included</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChapterRow({
  chapter, index, stats, onEdit,
}: {
  chapter: ChapterData;
  index: number;
  stats: ChapterStats;
  onEdit: () => void;
}) {
  const TARGET = 100;
  const completionPercentage = Math.min(100, Math.round((stats.total / TARGET) * 100));

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
      <div className="flex items-center gap-4 flex-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{chapter.name}</p>
          <div className="flex items-center gap-4 mt-1">
            <Badge variant="secondary" className="text-xs">{stats.total} MCQs</Badge>
            <span className="text-xs text-muted-foreground">
              {stats.pyq} PYQ | {stats.ncert} NCERT
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24 hidden sm:block">
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {completionPercentage}% complete
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============ CHAPTER EDIT MODAL ============
function ChapterEditModal({
  chapter,
  onClose,
}: {
  chapter: ChapterData;
  onClose: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add form state
  const [form, setForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    explanation: "",
    source: "NCERT",
    year: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("chapter_id", chapter.id)
      .order("id", { ascending: true });

    if (!error && data) setQuestions(data);
    setIsLoading(false);
  }

  async function handleDelete(id: number) {
    setIsDeleting(true);
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (!error) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setDeleteConfirmId(null);
    }
    setIsDeleting(false);
  }

  async function handleAdd() {
    setAddError("");
    setAddSuccess("");

    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setAddError("Saare fields fill karo!");
      return;
    }

    setIsAdding(true);

    // Duplicate check
    const { data: existing } = await supabase
      .from("questions")
      .select("id")
      .eq("chapter_id", chapter.id)
      .eq("question", form.question)
      .single();

    if (existing) {
      setAddError("Ye question already is chapter mein exist karta hai!");
      setIsAdding(false);
      return;
    }

    // Auto set number
    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("chapter_id", chapter.id);

    const setNumber = Math.floor((count || 0) / 90) + 1;

    const { data, error } = await supabase
      .from("questions")
      .insert({
        question: form.question,
        option_a: form.option_a,
        option_b: form.option_b,
        option_c: form.option_c,
        option_d: form.option_d,
        correct_answer: form.correct_answer,
        explanation: form.explanation,
        chapter_id: chapter.id,
        chapter_name: chapter.name,
        source: form.source,
        year: form.source === "PYQ" && form.year ? parseInt(form.year) : null,
        set_number: setNumber,
      })
      .select()
      .single();

    if (error) {
      setAddError("Error: " + error.message);
    } else {
      setQuestions((prev) => [...prev, data]);
      setAddSuccess("Question successfully add ho gaya! ✅");
      setForm({
        question: "", option_a: "", option_b: "", option_c: "", option_d: "",
        correct_answer: "A", explanation: "", source: "NCERT", year: "",
      });
      setShowAddForm(false);
    }
    setIsAdding(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-background border border-border rounded-xl w-full max-w-3xl my-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-foreground">{chapter.name}</h2>
            <p className="text-sm text-muted-foreground">{questions.length} questions total</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => { setShowAddForm(!showAddForm); setAddError(""); setAddSuccess(""); }}
              className="gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Add Form */}
          {showAddForm && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Naya Question Add Karo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {addError && (
                  <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{addError}</p>
                )}
                {addSuccess && (
                  <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{addSuccess}</p>
                )}

                <div>
                  <Label className="text-xs">Question *</Label>
                  <textarea
                    className="w-full mt-1 p-2 border border-border rounded-md text-sm bg-background resize-none"
                    rows={3}
                    placeholder="Question yahan likho..."
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <div key={opt}>
                      <Label className="text-xs">Option {opt} *</Label>
                      <Input
                        className="mt-1 text-sm"
                        placeholder={`Option ${opt}`}
                        value={form[`option_${opt.toLowerCase()}` as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [`option_${opt.toLowerCase()}`]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Correct Answer *</Label>
                    <select
                      className="w-full mt-1 p-2 border border-border rounded-md text-sm bg-background"
                      value={form.correct_answer}
                      onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
                    >
                      {["A", "B", "C", "D"].map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Source *</Label>
                    <select
                      className="w-full mt-1 p-2 border border-border rounded-md text-sm bg-background"
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: e.target.value })}
                    >
                      <option value="NCERT">NCERT</option>
                      <option value="PYQ">PYQ</option>
                    </select>
                  </div>
                  {form.source === "PYQ" && (
                    <div>
                      <Label className="text-xs">Year</Label>
                      <Input
                        className="mt-1 text-sm"
                        placeholder="2023"
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Explanation</Label>
                  <textarea
                    className="w-full mt-1 p-2 border border-border rounded-md text-sm bg-background resize-none"
                    rows={2}
                    placeholder="Explanation (optional)"
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAdd} disabled={isAdding}>
                    {isAdding ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Adding...</> : "Add Question"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading questions...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No questions yet.</p>
              <Button className="mt-3" size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((q, index) => (
                <div key={q.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Question Row */}
                  <div className="flex items-center justify-between p-3 hover:bg-muted/30">
                    <button
                      className="flex items-center gap-3 flex-1 text-left"
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-sm text-foreground line-clamp-1 flex-1">{q.question}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={q.source === "PYQ" ? "default" : "secondary"} className="text-xs">
                          {q.source === "PYQ" ? `PYQ ${q.year || ""}` : "NCERT"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">Set {q.set_number}</Badge>
                        {expandedId === q.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Delete Button */}
                    {deleteConfirmId === q.id ? (
                      <div className="flex items-center gap-2 ml-3">
                        <span className="text-xs text-red-500">Delete?</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 text-xs px-2"
                          onClick={() => handleDelete(q.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteConfirmId(q.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {expandedId === q.id && (
                    <div className="p-4 bg-muted/20 border-t border-border space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {(["A", "B", "C", "D"] as const).map((opt) => (
                          <div
                            key={opt}
                            className={`p-2 rounded text-sm ${
                              q.correct_answer === opt
                                ? "bg-green-100 text-green-800 font-medium border border-green-300"
                                : "bg-background border border-border"
                            }`}
                          >
                            <span className="font-medium">{opt}.</span>{" "}
                            {q[`option_${opt.toLowerCase()}` as keyof Question] as string}
                            {q.correct_answer === opt && " ✓"}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                          <span className="font-medium">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}