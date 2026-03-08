"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Shield, Zap, BookOpen, FileText, BarChart3, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

const features = [
  { name: "Demo Questions", free: "10 questions", premium: "Unlimited" },
  { name: "Chapter Access", free: "2 chapters", premium: "All 38 chapters" },
  { name: "NEET PYQs", free: false, premium: true },
  { name: "Full Mock Tests", free: false, premium: true },
  { name: "Performance Analytics", free: "Basic", premium: "Advanced" },
  { name: "Weak Chapter Analysis", free: false, premium: true },
  { name: "Progress Tracking", free: true, premium: true },
];

function PricingContent() {
  const { user } = useAuth();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      return;
    }
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setPaymentSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Free Plan */}
            <Card className="border-border">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Try before you commit</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">Rs.0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      {feature.free ? (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={feature.free ? "text-foreground" : "text-muted-foreground"}>
                        {feature.name}
                        {typeof feature.free === "string" && (
                          <span className="text-muted-foreground ml-1">({feature.free})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {user ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-primary shadow-lg relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>Complete NEET preparation</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">Rs.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Less than Rs.4 per day
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">
                        {feature.name}
                        {typeof feature.premium === "string" && (
                          <span className="text-muted-foreground ml-1">({feature.premium})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {user?.isPaid ? (
                  <Button className="w-full" disabled>
                    Already Subscribed
                  </Button>
                ) : user ? (
                  <Button className="w-full" onClick={() => setShowPaymentDialog(true)}>
                    Upgrade to Premium
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
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

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentSuccess ? "Payment Successful!" : "Complete Your Purchase"}
            </DialogTitle>
            <DialogDescription>
              {paymentSuccess 
                ? "Your premium access has been activated."
                : "Premium Plan - Rs.99/month"}
            </DialogDescription>
          </DialogHeader>
          
          {paymentSuccess ? (
            <div className="py-6 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-muted-foreground mb-4">
                You now have full access to all premium features.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name on Card</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="pt-4">
                <Button 
                  className="w-full" 
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay Rs.99"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
