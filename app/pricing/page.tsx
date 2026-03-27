"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isPremium } from "@/lib/checkPremium";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, BookOpen, FileText, BarChart3, Clock, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRICING } from "@/lib/pricing-config";
import { PricingCard } from "@/components/PricingCard";

const features = [
  { name: "10 Demo Questions", free: true, premium: true },
  { name: "Mock Test Preview", free: true, premium: true },
  { name: "All 38 Chapters", free: false, premium: true },
  { name: "3800+ MCQs", free: false, premium: true },
  { name: "NEET PYQs (2010-2024)", free: false, premium: true },
  { name: "Unlimited Mock Tests", free: false, premium: true },
  { name: "Performance Analytics", free: false, premium: true },
  { name: "Weak Chapter Analysis", free: false, premium: true },
];

function PricingContent() {
  const { user, activateSubscription, updateUser } = useAuth();
  const isPaid = isPremium(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadRazorpay = () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("window not defined"));
        return;
      }
      if ((window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay script"));
      document.body.appendChild(script);
    });
  };

  const handleBuy = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setError(null);
    setLoading(true);
     try {
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        setError("Payment system is being set up. Please contact us at +91 9004811546 to subscribe.");
        setLoading(false);
        return;
      }

      await loadRazorpay();
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
      }).then((r) => r.json());

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "NEET Biology",
        description: PRICING.premium.description,
        order_id: orderRes.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          }).then((r) => r.json());

          if (verifyRes.success) {
            if (verifyRes.user) {
              const updatedUser = {
                ...user,
                ...verifyRes.user,
                isPaid: true,
              };
              updateUser(updatedUser);
            }
            activateSubscription("NEET Test Series", PRICING.premium.durationDays);
            router.push("/dashboard");
          } else {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: user.email,
          name: user.name,
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError("Unable to initiate payment. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
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

          {/* Pricing Cards */}
          {error && (
            <div className="mb-4 text-center text-red-600">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <PricingCard
              plan="free"
              features={features.map((f) => ({ name: f.name, included: f.free }))}
              userIsPaid={isPaid}
            />
            <PricingCard
              plan="premium"
              features={features.map((f) => ({ name: f.name, included: f.premium }))}
              userIsPaid={isPaid}
              onBuy={handleBuy}
            />
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              What You Get with Premium
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-border">
                <CardContent className="pt-6">
                  <BookOpen className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">38 Complete Chapters</h3>
                  <p className="text-sm text-muted-foreground">
                    Full access to Class 11 and Class 12 NCERT Biology chapters
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <FileText className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">3800+ MCQs</h3>
                  <p className="text-sm text-muted-foreground">
                    100 questions per chapter with detailed NCERT-based explanations
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">NEET PYQs</h3>
                  <p className="text-sm text-muted-foreground">
                    Previous year questions from 2010-2024 with solutions
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <Clock className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Full Mock Tests</h3>
                  <p className="text-sm text-muted-foreground">
                    180-question NEET pattern tests with 3-hour timer
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <BarChart3 className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Advanced Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed performance tracking and weak area identification
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is secure and your progress is saved automatically
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <Card className="border-border">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Can I cancel my subscription anytime?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can cancel your subscription at any time. Your access will continue
                    until the end of your billing period.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    Is the content based on NCERT?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, all questions and explanations are strictly based on NCERT Biology
                    textbooks and NEET exam patterns.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    What payment methods are accepted?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We accept UPI, debit cards, credit cards, and net banking through our
                    secure payment gateway.
                  </p>
                </CardContent>
              </Card>
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