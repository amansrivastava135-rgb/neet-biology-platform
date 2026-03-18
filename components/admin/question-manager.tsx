"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { class11Chapters, class12Chapters, type Question } from "@/lib/data";
import { Plus, Search, Trash2, ImagePlus, X, Edit } from "lucide-react";

const STORAGE_KEY = "neet_admin_questions";

function loadFromStorage(): Question[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(questions: Question[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {}
}

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
  imageUrl: "",
};

export function QuestionManager() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChapter, setFilterChapter] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const allChapters = [...class11Chapters, ...class12Chapters];

  useEffect(() => {
    setQuestions(loadFromStorage());
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setForm({ ...form, imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setForm({ ...form, imageUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddDialog = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (question: any) => {
    setEditingId(question.id);
    setForm({
      question: question.question,
      optionA: question.options.A,
      optionB: question.options.B,
      optionC: question.options.C,
      optionD: question.options.D,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      chapterId: question.chapterId,
      source: question.source,
      imageUrl: question.imageUrl || "",
    });
    setImagePreview(question.imageUrl || null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const chapter = allChapters.find((c) => c.id === form.chapterId);
    const questionData: any = {
      id: editingId ?? Date.now(),
      question: form.question,
      options: {
        A: form.optionA,
        B: form.optionB,
        C: form.optionC,
        D: form.optionD,
      },
      correctAnswer: form.correctAnswer,
      explanation: form.explanation,
      chapterId: form.chapterId,
      chapterName: chapter?.name || "",
      source: form.source,
    };
    if (form.imageUrl) questionData.imageUrl = form.imageUrl;

    let updated;
    if (editingId !== null) {
      // Edit existing
      updated = questions.map((q) => (q.id === editingId ? questionData : q));
    } else {
      // Add new
      updated = [questionData, ...questions];
    }

    setQuestions(updated);
    saveToStorage(updated);
    setIsDialogOpen(false);
    setImagePreview(null);
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleDeleteQuestion = (id: number) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    saveToStorage(updated);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChapter = filterChapter === "all" || q.chapterId.toString() === filterChapter;
    const matchesSource = filterSource === "all" || q.source === filterSource;
    return matchesSearch && matchesChapter && matchesSource;
  });

  const QuestionForm = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Question</Label>
        <Textarea
          placeholder="Enter the question..."
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Question Image (Optional)</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Question"
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Upload an image for this question</p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Choose Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        {(["A", "B", "C", "D"] as const).map((opt) => (
          <div key={opt} className="space-y-2">
            <Label>Option {opt}</Label>
            <Input
              value={form[`option${opt}` as keyof typeof form] as string}
              onChange={(e) => setForm({ ...form, [`option${opt}`]: e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Correct Answer</Label>
          <Select
            value={form.correctAnswer}
            onValueChange={(v) => setForm({ ...form, correctAnswer: v as "A" | "B" | "C" | "D" })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["A", "B", "C", "D"].map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Chapter</Label>
          <Select
            value={form.chapterId.toString()}
            onValueChange={(v) => setForm({ ...form, chapterId: parseInt(v) })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {allChapters.map((chapter) => (
                <SelectItem key={chapter.id} value={chapter.id.toString()}>
                  {chapter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Source</Label>
          <Select
            value={form.source}
            onValueChange={(v) => setForm({ ...form, source: v as "PYQ" | "NCERT" })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NCERT">NCERT</SelectItem>
              <SelectItem value="PYQ">PYQ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-2">
        <Label>Explanation</Label>
        <Textarea
          placeholder="Enter detailed explanation referencing NCERT concepts..."
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={filterChapter} onValueChange={setFilterChapter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {allChapters.map((chapter) => (
                <SelectItem key={chapter.id} value={chapter.id.toString()}>
                  {chapter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={setFilterSource}>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button className="gap-2 w-full sm:w-auto" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Question" : "Add New Question"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update the question details" : "Create a new MCQ for the question bank"}
              </DialogDescription>
            </DialogHeader>
            {QuestionForm}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingId ? "Save Changes" : "Add Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Questions ({filteredQuestions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No questions added yet. Click "Add Question" to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.slice(0, 20).map((question: any) => (
                <div key={question.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {question.imageUrl && (
                        <img
                          src={question.imageUrl}
                          alt="Question"
                          className="max-h-32 mb-2 rounded-lg object-contain"
                        />
                      )}
                      <p className="font-medium text-foreground mb-2">{question.question}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{question.chapterName}</Badge>
                        <Badge variant={question.source === "PYQ" ? "default" : "outline"}>
                          {question.source}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Correct: {question.correctAnswer}
                        </span>
                        {question.imageUrl && (
                          <Badge variant="outline" className="text-blue-600">📷 Has Image</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(question)}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(question.id)}
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
    </div>
  );
}