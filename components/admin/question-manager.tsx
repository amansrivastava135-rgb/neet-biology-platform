"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { Plus, Search, Trash2, Edit, Upload, Download, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SET_SIZE = 90;

const emptyForm = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A" as "A" | "B" | "C" | "D",
  explanation: "",
  chapterId: 1,
  source: "NCERT" as "PYQ" | "NCERT",
  year: "",
};

export function QuestionManager() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChapter, setFilterChapter] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [bulkUploadStatus, setBulkUploadStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [form, setForm] = useState({ ...emptyForm });
  const csvInputRef = useRef<HTMLInputElement>(null);
  const allChapters = [...class11Chapters, ...class12Chapters];

  useEffect(() => {
    fetchQuestions();
  }, [filterChapter, filterSource]);

  async function fetchQuestions() {
    setIsLoading(true);
    let query = supabase.from("questions").select("*").order("id", { ascending: false });
    if (filterChapter !== "all") query = query.eq("chapter_id", parseInt(filterChapter));
    if (filterSource !== "all") query = query.eq("source", filterSource);

    const { data, error } = await query.limit(50);
    if (!error && data) setQuestions(data);

    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true });
    setTotalCount(count || 0);
    setIsLoading(false);
  }

  const handleDownloadSample = () => {
    const headers = "question,optionA,optionB,optionC,optionD,correctAnswer,explanation,chapterName,source,year";
    const r1 = `"Which is the basic unit of life?","Cell","Tissue","Organ","Organism","A","Cell is the basic structural unit.","Cell – The Unit of Life","NCERT",""`;
    const r2 = `"Binomial nomenclature was introduced by?","Aristotle","Linnaeus","Theophrastus","Darwin","B","Carolus Linnaeus introduced it.","The Living World","PYQ","2020"`;
    const blob = new Blob([`${headers}\n${r1}\n${r2}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_questions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const results: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '"') { inQuotes = !inQuotes; }
        else if (line[j] === "," && !inQuotes) { fields.push(current.trim()); current = ""; }
        else { current += line[j]; }
      }
      fields.push(current.trim());

      if (fields.length < 9) continue;

      const [question, optionA, optionB, optionC, optionD, correctAnswer, explanation, chapterIdOrName, source, year = ""] = fields;

      // Pehle exact name se dhundo (case insensitive)
      const chapByName = allChapters.find((c) =>
        c.name.toLowerCase().trim() === chapterIdOrName.toLowerCase().trim()
      );
      // Nahi mila toh ID se dhundo
      const chapById = allChapters.find((c) => c.id === parseInt(chapterIdOrName));
      const chapter = chapByName || chapById;
      const chapId = chapter?.id || 1;

      results.push({
        question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: (correctAnswer?.toUpperCase() as string) || "A",
        explanation: explanation || "",
        chapter_id: chapId,
        chapter_name: chapter?.name || chapterIdOrName,
        source: source?.toUpperCase() === "PYQ" ? "PYQ" : "NCERT",
        year: year && !isNaN(parseInt(year)) ? parseInt(year) : null,
      });
    }
    return results;
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkUploadStatus("⏳ Uploading...");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const text = reader.result as string;
        const parsed = parseCSV(text);

        if (parsed.length === 0) {
          setBulkUploadStatus("❌ No valid questions found. Check CSV format!");
          return;
        }

        let inserted = 0;
        let skipped = 0;

        const byChapter: Record<number, any[]> = {};
        for (const q of parsed) {
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
            const { data: existingList } = await supabase
              .from("questions")
              .select("id")
              .eq("chapter_id", q.chapter_id)
              .eq("question", q.question)
              .limit(1);

            if (existingList && existingList.length > 0) { skipped++; continue; }

            const setNumber = Math.floor(currentCount / SET_SIZE) + 1;

            const { error } = await supabase.from("questions").insert({
              ...q,
              set_number: setNumber,
            });

            if (!error) { inserted++; currentCount++; }
          }
        }

        setBulkUploadStatus(`✅ ${inserted} questions uploaded, ${skipped} skipped (duplicates)`);
        fetchQuestions();
        setTimeout(() => setBulkUploadStatus(null), 6000);
      } catch (err) {
        setBulkUploadStatus("❌ Error parsing CSV. Please check the format!");
      }
      if (csvInputRef.current) csvInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const openAddDialog = () => {
    setEditingQuestion(null);
    setForm({ ...emptyForm });
    setIsDialogOpen(true);
  };

  const openEditDialog = (question: any) => {
    setEditingQuestion(question);
    setForm({
      question: question.question,
      optionA: question.option_a,
      optionB: question.option_b,
      optionC: question.option_c,
      optionD: question.option_d,
      correctAnswer: question.correct_answer as "A" | "B" | "C" | "D",
      explanation: question.explanation || "",
      chapterId: question.chapter_id,
      source: question.source as "PYQ" | "NCERT",
      year: question.year?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.question || !form.optionA || !form.optionB || !form.optionC || !form.optionD) {
      alert("Saare required fields fill karo!");
      return;
    }

    setIsSaving(true);
    const chapter = allChapters.find((c) => c.id === form.chapterId);

    if (editingQuestion) {
      const { error } = await supabase
        .from("questions")
        .update({
          question: form.question,
          option_a: form.optionA,
          option_b: form.optionB,
          option_c: form.optionC,
          option_d: form.optionD,
          correct_answer: form.correctAnswer,
          explanation: form.explanation,
          chapter_id: form.chapterId,
          chapter_name: chapter?.name || "",
          source: form.source,
          year: form.source === "PYQ" && form.year ? parseInt(form.year) : null,
        })
        .eq("id", editingQuestion.id);

      if (error) { alert("Error: " + error.message); }
    } else {
      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("chapter_id", form.chapterId);

      const setNumber = Math.floor((count || 0) / SET_SIZE) + 1;

      const { data: existingList } = await supabase
        .from("questions")
        .select("id")
        .eq("chapter_id", form.chapterId)
        .eq("question", form.question)
        .limit(1);

      if (existingList && existingList.length > 0) {
        alert("Ye question already exist karta hai is chapter mein!");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.from("questions").insert({
        question: form.question,
        option_a: form.optionA,
        option_b: form.optionB,
        option_c: form.optionC,
        option_d: form.optionD,
        correct_answer: form.correctAnswer,
        explanation: form.explanation,
        chapter_id: form.chapterId,
        chapter_name: chapter?.name || "",
        source: form.source,
        year: form.source === "PYQ" && form.year ? parseInt(form.year) : null,
        set_number: setNumber,
      });

      if (error) { alert("Error: " + error.message); }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    setForm({ ...emptyForm });
    setEditingQuestion(null);
    fetchQuestions();
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (!error) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setDeleteConfirmId(null);
      setTotalCount((prev) => prev - 1);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={filterChapter} onValueChange={(v) => { setFilterChapter(v); }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {allChapters.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={(v) => { setFilterSource(v); }}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="PYQ">PYQ</SelectItem>
              <SelectItem value="NCERT">NCERT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2" onClick={handleDownloadSample}>
            <Download className="h-4 w-4" />
            Sample CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => csvInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
          <Button className="gap-2" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {bulkUploadStatus && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          bulkUploadStatus.startsWith("✅") ? "bg-green-100 text-green-800" :
          bulkUploadStatus.startsWith("❌") ? "bg-red-100 text-red-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {bulkUploadStatus}
        </div>
      )}

      <Card className="border-border bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-medium mb-1">📋 CSV Format:</p>
          <p className="text-xs text-muted-foreground font-mono">
            question, optionA, optionB, optionC, optionD, correctAnswer, explanation, chapterName, source, year(optional)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            correctAnswer: A/B/C/D | source: NCERT/PYQ | chapterName: "Organisms and Populations" | year: 2020 (only for PYQ)
          </p>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? "Update question details" : "Add a new MCQ to Supabase"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question *</Label>
              <Textarea
                placeholder="Enter the question..."
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <div key={opt} className="space-y-2">
                  <Label>Option {opt} *</Label>
                  <Input
                    value={form[`option${opt}` as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [`option${opt}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Correct Answer *</Label>
                <Select value={form.correctAnswer} onValueChange={(v) => setForm({ ...form, correctAnswer: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chapter *</Label>
                <Select value={form.chapterId.toString()} onValueChange={(v) => setForm({ ...form, chapterId: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allChapters.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source *</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NCERT">NCERT</SelectItem>
                    <SelectItem value="PYQ">PYQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.source === "PYQ" && (
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  placeholder="2023"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea
                placeholder="Explanation (optional)"
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editingQuestion ? "Save Changes" : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">
            Questions ({isLoading ? "..." : `${filteredQuestions.length} shown / ${totalCount} total`})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No questions found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q: any) => (
                <div key={q.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-2 text-sm">{q.question}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{q.chapter_name}</Badge>
                        <Badge variant={q.source === "PYQ" ? "default" : "outline"} className="text-xs">
                          {q.source === "PYQ" ? `PYQ ${q.year || ""}` : "NCERT"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">✓ {q.correct_answer}</span>
                        <Badge variant="outline" className="text-xs">Set {q.set_number}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(q)}>
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      {deleteConfirmId === q.id ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="destructive" className="h-7 text-xs px-2"
                            onClick={() => handleDelete(q.id)}>Yes</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2"
                            onClick={() => setDeleteConfirmId(null)}>No</Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(q.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}