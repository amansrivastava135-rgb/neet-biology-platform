"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isPremium } from "@/lib/checkPremium";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Zap, BookOpen, FileText, BarChart3, Clock, Tag, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRICING } from "@/lib/pricing-config";
import { PricingCard } from "@/components/PricingCard";

const allFeatures = [
  { name: "10 Demo Questions", free: true, paid: true },
  { name: "Mock Test Preview", free: true, paid: true },
  { name: "All 38 Chapters", free: false, paid: true },
  { name: "3800+ MCQs", free: false, paid: true },
  { name: "NEET PYQs (2010-2024)", free: false, paid: true },
  { name: "Unlimited Mock Tests", free: false, paid: true },
  { name: "Performance Analytics", free: false, paid: true },
  { name: "Weak Chapter Analysis", free: false, paid: true },
];

type PromoResult = {
  code: string;
  discountAmount: number;
  finalPrice: number;
  originalPrice: number;
  message: string;
  planId: string; // which plan was validated
};

type PromoState = {
  code: string;
  status: "idle" | "loading" | "valid" | "invalid";
  message: string;
  // Store results per plan so all cards can show correct price
  results: Record<string, PromoResult>;
};

function PricingContent() {
  const { user, activateSubscription, updateUser } = useAuth();
  const isPaid = isPremium(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const router = useRouter();

  const [promo, setPromo] = useState<PromoState>({
    code: "",
    status: "idle",
    message: "",
    results: {},
  });

  // Validate promo for ALL paid plans at once
  const validatePromo = async () => {
    if (!promo.code.trim()) return;
    setPromo((p) => ({ ...p, status: "loading", message: "" }));

    const paidPlans = ["crash", "sixMonth", "premium"];
    const results: Record<string, PromoResult> = {};
    let anyValid = false;
    let lastMessage = "This code is not applicable for any plan";

    // Validate against each plan
    await Promise.all(
      paidPlans.map(async (planId) => {
        try {
          const res = await fetch("/api/payment/validate-promo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: promo.code,
              planId,
              email: user?.email,
            }),
          }).then((r) => r.json());

          if (res.valid) {
            anyValid = true;
            results[planId] = {
              code: promo.code,
              discountAmount: res.discountAmount,
              finalPrice: res.finalPrice,
              originalPrice: res.originalPrice,
              message: res.message,
              planId,
            };
            lastMessage = res.message;
          }
        } catch {
          // ignore individual plan errors
        }
      })
    );

    if (anyValid) {
      setPromo((p) => ({
        ...p,
        status: "valid",
        message: lastMessage,
        results,
      }));
    } else {
      // Get actual error from one plan
      try {
        const res = await fetch("/api/payment/validate-promo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: promo.code,
            planId: "premium",
            email: user?.email,
          }),
        }).then((r) => r.json());
        setPromo((p) => ({
          ...p,
          status: "invalid",
          message: res.message || "Invalid promo code",
          results: {},
        }));
      } catch {
        setPromo((p) => ({
          ...p,
          status: "invalid",
          message: "Invalid promo code",
          results: {},
        }));
      }
    }
  };

  const loadRazorpay = () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") { reject(new Error("window not defined")); return; }
      if ((window as any).Razorpay) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay script"));
      document.body.appendChild(script);
    });
  };

  const handleBuy = async (planId: string) => {
    if (!user) { router.push("/login"); return; }
    setError(null);
    setLoading(true);
    setActivePlanId(planId);

    try {
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        setError("Payment system is being set up. Please contact us at +91 9004811546 to subscribe.");
        setLoading(false);
        return;
      }

      await loadRazorpay();

      // Get promo result for this specific plan
      const promoResult = promo.status === "valid" ? promo.results[planId] : null;

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          promoCode: promoResult ? promo.code : null,
        }),
      }).then((r) => r.json());

      const planData = PRICING[planId as keyof typeof PRICING];

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "NEET Biology",
        description: planData.description,
        order_id: orderRes.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: user.email,
              planId,
              promoCode: promoResult ? promo.code : null,
              discountAmount: promoResult?.discountAmount || 0,
            }),
          }).then((r) => r.json());

          if (verifyRes.success) {
            if (verifyRes.user) {
              updateUser({ ...user, ...verifyRes.user, isPaid: true });
            }
            activateSubscription("NEET Test Series", planData.durationDays);
            router.push("/dashboard");
          } else {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: { email: user.email, name: user.name },
        theme: { color: "#3399cc" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError("Unable to initiate payment. Please try again later.");
    } finally {
      setLoading(false);
      setActivePlanId(null);
    }
  };

  // Helper — get promo display for a specific plan
  const getPromoForPlan = (planId: string) => {
    if (promo.status !== "valid") return undefined;
    return promo.results[planId];
  };

  return (
    <div className="page-wrapper min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">

          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get unlimited access to all NEET Biology preparation resources for less than
              the cost of a single coaching class.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Promo Code Section */}
          {!isPaid && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="border-border">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground whitespace-nowrap">
                      <Tag className="h-4 w-4 text-primary" />
                      Promo Code
                    </div>
                    <div className="flex flex-1 gap-2 w-full">
                      <Input
                        placeholder="Enter promo code (e.g. NEET2025)"
                        value={promo.code}
                        onChange={(e) =>
                          setPromo((p) => ({
                            ...p,
                            code: e.target.value.toUpperCase(),
                            status: "idle",
                            message: "",
                            results: {},
                          }))
                        }
                        className="uppercase"
                        onKeyDown={(e) => e.key === "Enter" && validatePromo()}
                      />
                      <Button
                        variant="outline"
                        onClick={validatePromo}
                        disabled={!promo.code.trim() || promo.status === "loading"}
                      >
                        {promo.status === "loading" ? "Checking..." : "Apply"}
                      </Button>
                    </div>
                  </div>

                  {/* Promo Status */}
                  {promo.status === "valid" && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {promo.message} — Discount applied on eligible plans below
                    </div>
                  )}
                  {promo.status === "invalid" && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      {promo.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Crash Pack */}
          {!isPaid && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="border-orange-400 bg-orange-50 dark:bg-orange-950/20 relative">
                <Badge variant="destructive" className="absolute top-4 right-4">
                  Limited Time Offer
                </Badge>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-500" />
                    NEET Final 30 Days Crash Pack
                  </CardTitle>
                  <CardDescription>Valid Till NEET Exam · Full access for 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ All 38 Chapters unlocked</li>
                      <li>✅ 3800+ MCQs</li>
                      <li>✅ Full Mock Tests</li>
                      <li>✅ Performance Analytics</li>
                    </ul>
                    <div className="text-center min-w-[140px]">
                      {getPromoForPlan("crash") ? (
                        <div className="mb-2">
                          <span className="text-2xl line-through text-muted-foreground">
                            ₹{PRICING.crash.price}
                          </span>
                          <span className="text-4xl font-bold text-foreground ml-2">
                            ₹{getPromoForPlan("crash")!.finalPrice}
                          </span>
                          <p className="text-xs text-green-600 mt-1">
                            {getPromoForPlan("crash")!.message}
                          </p>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold text-foreground mb-2">₹299</div>
                      )}
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white border-0 w-full"
                        onClick={() => handleBuy("crash")}
                        disabled={loading && activePlanId === "crash"}
                      >
                        {loading && activePlanId === "crash" ? "Processing..." : "Buy Crash Pack"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Free + Yearly Plans */}
          <div className={`max-w-4xl mx-auto mb-8 ${isPaid ? "" : "grid grid-cols-1 md:grid-cols-2 gap-8"}`}>
            {!isPaid && (
              <PricingCard
                plan="free"
                features={allFeatures.map((f) => ({ name: f.name, included: f.free }))}
                userIsPaid={isPaid}
                userLoggedIn={!!user}
              />
            )}
            <PricingCard
              plan="premium"
              features={allFeatures.map((f) => ({ name: f.name, included: f.paid }))}
              userIsPaid={isPaid}
              userLoggedIn={!!user}
              onBuy={handleBuy}
              promoResult={getPromoForPlan("premium")}
            />
          </div>

          {/* 6 Month Plan */}
          {!isPaid && (
            <div className="max-w-sm mx-auto mb-16">
              <PricingCard
                plan="sixMonth"
                features={allFeatures.map((f) => ({ name: f.name, included: f.paid }))}
                userIsPaid={isPaid}
                userLoggedIn={!!user}
                onBuy={handleBuy}
                promoResult={getPromoForPlan("sixMonth")}
              />
            </div>
          )}

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              What You Get with Premium
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-border"><CardContent className="pt-6"><BookOpen className="h-10 w-10 text-primary mb-4" /><h3 className="font-semibold text-foreground mb-2">38 Complete Chapters</h3><p className="text-sm text-muted-foreground">Full access to Class 11 and Class 12 NCERT Biology chapters</p></CardContent></Card>
              <Card className="border-border"><CardContent className="pt-6"><FileText className="h-10 w-10 text-primary mb-4" /><h3 className="font-semibold text-foreground mb-2">3800+ MCQs</h3><p className="text-sm text-muted-foreground">100 questions per chapter with detailed NCERT-based explanations</p></CardContent></Card>
              <Card className="border-border"><CardContent className="pt-6"><Zap className="h-10 w-10 text-primary mb-4" /><h3 className="font-semibold text-foreground mb-2">NEET PYQs</h3><p className="text-sm text-muted-foreground">Previous year questions from 2010-2024 with solutions</p></CardContent></Card>
              <Card className="border-border"><CardContent className="pt-6"><Clock className="h-10 w-10 text-primary mb-4" /><h3 className="font-semibold text-foreground mb-2">Full Mock Tests</h3><p className="text-sm text-muted-foreground">180-question NEET pattern tests with 3-hour timer</p></CardContent></Card>
              <Card className="border-border"><CardContent className="pt-6"><BarChart3 className="h-10 w-10 text-primary mb-4" /><h3 className="font-semibold text-foreground mb-2">Advanced Analytics</h3><p className="text-sm text-muted-foreground">Detailed performance tracking and weak area identification</p></CardContent></Card>
              <Card className="border-border"><CardContent className="pt-6"><Shield className="h-10 w-10 text-primary mb-4" /><h3 className="font-semibold text-foreground mb-2">Secure & Private</h3><p className="text-sm text-muted-foreground">Your data is secure and your progress is saved automatically</p></CardContent></Card>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <Card className="border-border"><CardContent className="pt-6"><h3 className="font-semibold text-foreground mb-2">Can I cancel my subscription anytime?</h3><p className="text-sm text-muted-foreground">Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.</p></CardContent></Card>
              <Card className="border-border"><CardContent className="pt-6"><h3 className="font-semibold text-foreground mb-2">Is the content based on NCERT?</h3><p className="text-sm text-muted-foreground">Yes, all questions and explanations are strictly based on NCERT Biology textbooks and NEET exam patterns.</p></CardContent></Card>
              <Card className="border-border"><CardContent className="pt-6"><h3 className="font-semibold text-foreground mb-2">What payment methods are accepted?</h3><p className="text-sm text-muted-foreground">We accept UPI, debit cards, credit cards, and net banking through our secure payment gateway.</p></CardContent></Card>
              <Card className="border-border"><CardContent className="pt-6"><h3 className="font-semibold text-foreground mb-2">What is the Crash Pack?</h3><p className="text-sm text-muted-foreground">The Crash Pack gives you 30 days of full access to all features — perfect for last-minute NEET preparation at just ₹299.</p></CardContent></Card>
              <Card className="border-border"><CardContent className="pt-6"><h3 className="font-semibold text-foreground mb-2">Do you have promo codes?</h3><p className="text-sm text-muted-foreground">Yes! Follow our social media or ask your coaching partner for exclusive promo codes and get instant discounts.</p></CardContent></Card>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <AuthProvider>
      <PricingContent />
    </AuthProvider>
  );
}