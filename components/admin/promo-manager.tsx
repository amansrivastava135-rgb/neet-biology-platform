"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Tag, Plus, RefreshCw, Users, IndianRupee, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PromoCode = {
  id: string;
  code: string;
  type: "percent" | "flat";
  discount_amount: number;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  applicable_plans: string[];
  expires_at: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
};

type PromoUse = {
  code: string;
  user_email: string;
  plan_id: string;
  discount_applied: number;
  used_at: string;
};

const PLAN_OPTIONS = ["monthly", "sixMonth", "premium", "guided"];

export function PromoManager() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [uses, setUses] = useState<PromoUse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"codes" | "analytics">("codes");

  // New code form state
  const [form, setForm] = useState({
    code: "",
    type: "percent" as "percent" | "flat",
    discount_percent: "",
    discount_amount: "",
    max_uses: "100",
    applicable_plans: ["monthly", "sixMonth", "premium", "guided"],
    expires_at: "",
    created_by: "",
    commission_percent: "",
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const { data: codesData } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: usesData } = await supabase
      .from("promo_code_uses")
      .select("*")
      .order("used_at", { ascending: false });

    if (codesData) setCodes(codesData);
    if (usesData) setUses(usesData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    setFormError(null);
    setFormSuccess(null);

    if (!form.code.trim()) {
      setFormError("Code is required");
      return;
    }
    if (form.type === "percent" && !form.discount_percent) {
      setFormError("Discount percent is required");
      return;
    }
    if (form.type === "flat" && !form.discount_amount) {
      setFormError("Discount amount is required");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("promo_codes").insert({
        code: form.code.toUpperCase().trim(),
        type: form.type,
        discount_percent: form.type === "percent" ? parseInt(form.discount_percent) : 0,
        discount_amount: form.type === "flat" ? parseInt(form.discount_amount) : 0,
        max_uses: parseInt(form.max_uses) || 100,
        applicable_plans: form.applicable_plans,
        expires_at: form.expires_at || null,
        created_by: form.created_by || "admin",
        is_active: true,
        used_count: 0,
      });

      if (error) {
        setFormError(error.message);
      } else {
        setFormSuccess(`Code "${form.code.toUpperCase()}" created successfully!`);
        setForm({
          code: "",
          type: "percent",
          discount_percent: "",
          discount_amount: "",
          max_uses: "100",
          applicable_plans: ["monthly", "sixMonth", "premium", "guided"],
          expires_at: "",
          created_by: "",
          commission_percent: "",
        });
        await fetchData();
      }
    } catch (err) {
      setFormError("Failed to create promo code");
    } finally {
      setCreating(false);
    }
  };

  const toggleCode = async (code: PromoCode) => {
    await supabase
      .from("promo_codes")
      .update({ is_active: !code.is_active })
      .eq("id", code.id);
    await fetchData();
  };

  const deleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this code?")) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    await fetchData();
  };

  const togglePlan = (plan: string) => {
    setForm((f) => ({
      ...f,
      applicable_plans: f.applicable_plans.includes(plan)
        ? f.applicable_plans.filter((p) => p !== plan)
        : [...f.applicable_plans, plan],
    }));
  };

  // Analytics per code
  const getCodeStats = (code: string) => {
    const codeUses = uses.filter((u) => u.code === code);
    const totalDiscount = codeUses.reduce((sum, u) => sum + u.discount_applied, 0);
    return { count: codeUses.length, totalDiscount };
  };

  // Unique referrers for commission tracking
  const referrers = codes
    .filter((c) => c.created_by !== "admin" && c.created_by !== "")
    .map((c) => c.created_by)
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="space-y-6">

      {/* Tab Switch */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "codes" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("codes")}
        >
          <Tag className="h-4 w-4 mr-2" />
          Promo Codes
        </Button>
        <Button
          variant={activeTab === "analytics" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("analytics")}
        >
          <Users className="h-4 w-4 mr-2" />
          Commission Tracker
        </Button>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading} className="ml-auto gap-2">
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {activeTab === "codes" && (
        <>
          {/* Create New Code */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create New Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Code */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Code *
                  </label>
                  <Input
                    placeholder="e.g. ALLEN20"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="uppercase"
                  />
                </div>

                {/* Created By (Referrer) */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Referrer Name (for commission tracking)
                  </label>
                  <Input
                    placeholder="e.g. Allen Coaching, Rahul Sir"
                    value={form.created_by}
                    onChange={(e) => setForm((f) => ({ ...f, created_by: e.target.value }))}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Discount Type *
                  </label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((f) => ({ ...f, type: v as "percent" | "flat" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (e.g. 20%)</SelectItem>
                      <SelectItem value="flat">Flat Amount (e.g. ₹100)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    {form.type === "percent" ? "Discount Percent *" : "Discount Amount (₹) *"}
                  </label>
                  {form.type === "percent" ? (
                    <Input
                      type="number"
                      placeholder="e.g. 20"
                      min="1"
                      max="100"
                      value={form.discount_percent}
                      onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))}
                    />
                  ) : (
                    <Input
                      type="number"
                      placeholder="e.g. 100"
                      min="1"
                      value={form.discount_amount}
                      onChange={(e) => setForm((f) => ({ ...f, discount_amount: e.target.value }))}
                    />
                  )}
                </div>

                {/* Max Uses */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Max Uses
                  </label>
                  <Input
                    type="number"
                    placeholder="100"
                    min="1"
                    value={form.max_uses}
                    onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                  />
                </div>

                {/* Expiry */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Expiry Date (optional)
                  </label>
                  <Input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  />
                </div>
              </div>

              {/* Applicable Plans */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Applicable Plans
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PLAN_OPTIONS.map((plan) => (
                    <button
                      key={plan}
                      onClick={() => togglePlan(plan)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        form.applicable_plans.includes(plan)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      {plan === "monthly" ? "Monthly" : plan === "sixMonth" ? "6 Month" : plan === "premium" ? "Yearly" : "Guided Plan"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error / Success */}
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              {formSuccess && (
                <p className="text-sm text-green-600">{formSuccess}</p>
              )}

              <Button onClick={handleCreate} disabled={creating} className="gap-2">
                <Plus className="h-4 w-4" />
                {creating ? "Creating..." : "Create Code"}
              </Button>
            </CardContent>
          </Card>

          {/* Codes Table */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">All Promo Codes ({codes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : codes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No promo codes yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Referrer</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codes.map((code) => {
                        const stats = getCodeStats(code.code);
                        return (
                          <TableRow key={code.id}>
                            <TableCell>
                              <span className="font-mono font-bold text-foreground">
                                {code.code}
                              </span>
                            </TableCell>
                            <TableCell>
                              {code.type === "percent"
                                ? `${code.discount_percent}% off`
                                : `₹${code.discount_amount} off`}
                            </TableCell>
                            <TableCell>
                              <span className="text-foreground font-medium">{stats.count}</span>
                              <span className="text-muted-foreground"> / {code.max_uses}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {code.created_by || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {code.expires_at
                                ? new Date(code.expires_at).toLocaleDateString()
                                : "No expiry"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={code.is_active ? "default" : "secondary"}>
                                {code.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCode(code)}
                                  title={code.is_active ? "Deactivate" : "Activate"}
                                >
                                  {code.is_active ? (
                                    <ToggleRight className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCode(code.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
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
        </>
      )}

      {activeTab === "analytics" && (
        <>
          {/* Commission Summary per Referrer */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                Commission Tracker by Referrer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referrers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No referrer codes yet. Add a Referrer Name when creating a code.
                </p>
              ) : (
                <div className="space-y-4">
                  {referrers.map((referrer) => {
                    const referrerCodes = codes.filter((c) => c.created_by === referrer);
                    const allUses = uses.filter((u) =>
                      referrerCodes.map((c) => c.code).includes(u.code)
                    );
                    const totalStudents = allUses.length;
                    const totalDiscount = allUses.reduce((s, u) => s + u.discount_applied, 0);

                    return (
                      <Card key={referrer} className="border-border">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground">{referrer}</h3>
                            <Badge variant="outline">{referrerCodes.length} code(s)</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                              <p className="text-xs text-muted-foreground">Students Referred</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">₹{totalDiscount}</p>
                              <p className="text-xs text-muted-foreground">Total Discount Given</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                ₹{totalStudents * 100}
                              </p>
                              <p className="text-xs text-muted-foreground">Est. Commission (₹100/student)</p>
                            </div>
                          </div>

                          {/* Per code breakdown */}
                          <div className="mt-4 space-y-2">
                            {referrerCodes.map((c) => {
                              const s = getCodeStats(c.code);
                              return (
                                <div key={c.code} className="flex items-center justify-between text-sm">
                                  <span className="font-mono text-foreground">{c.code}</span>
                                  <span className="text-muted-foreground">{s.count} uses</span>
                                  <Badge variant={c.is_active ? "default" : "secondary"} className="text-xs">
                                    {c.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Code Uses */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Recent Promo Code Uses</CardTitle>
            </CardHeader>
            <CardContent>
              {uses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No promo codes used yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Student Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uses.slice(0, 50).map((use, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono font-bold">{use.code}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{use.user_email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {use.plan_id === "monthly"
                                ? "Monthly"
                                : use.plan_id === "sixMonth"
                                ? "6 Month"
                                : "Yearly"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            -₹{use.discount_applied}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(use.used_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}