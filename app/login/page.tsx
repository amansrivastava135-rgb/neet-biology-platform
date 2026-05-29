"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Loader2, AlertCircle, Mail, KeyRound } from "lucide-react";
import { useAuth, AuthProvider } from "@/lib/auth-context";
import { GoogleButton } from "@/components/ui/google-button";
import { track } from "@vercel/analytics";
import { Suspense } from "react";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_denied: "Google sign-in was cancelled.",
  google_failed: "Google sign-in failed. Please try again.",
  google_unverified: "Your Google account email is not verified.",
};

function LoginForm() {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show error from Google OAuth redirect
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError && GOOGLE_ERROR_MESSAGES[oauthError]) {
      setError(GOOGLE_ERROR_MESSAGES[oauthError]);
    }
  }, [searchParams]);

  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter your email first");
      return;
    }
    setError("");
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        track("otp_sent");
        setOtpSent(true);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter valid 6-digit OTP");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const verifyRes = await fetch(
        `/api/auth/send-otp?email=${encodeURIComponent(email)}&otp=${otp}`
      );
      const verifyData = await verifyRes.json();

      if (!verifyData.valid) {
        setError(verifyData.error || "Invalid OTP. Please try again.");
        return;
      }

      const loginRes = await fetch("/api/auth/otp-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const loginData = await loginRes.json();

      if (loginRes.ok && loginData.user) {
        track("login_success", { method: "otp" });
        localStorage.setItem("neet_user", JSON.stringify(loginData.user));
        router.push(loginData.user?.isAdmin ? "/admin" : "/dashboard");
      } else {
        track("login_failed", { method: "otp" });
        setError(loginData.error || "No account found. Please sign up first.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        track("login_success", { method: "password" });
        const storedUser = localStorage.getItem("neet_user");
        const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
        router.push(loggedInUser?.isAdmin ? "/admin" : "/dashboard");
      } else {
        track("login_failed", { method: "password" });
        setError("Invalid email or password. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-foreground leading-tight">MASTER360</p>
              <p className="text-xs text-muted-foreground">Dr. Amankumar Srivastav</p>
            </div>
          </Link>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to continue your NEET Biology preparation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Google Button */}
            <GoogleButton label="Continue with Google" />

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => { setLoginMethod("password"); setError(""); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "password"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <KeyRound className="h-4 w-4" />
                Password
              </button>
              <button
                onClick={() => { setLoginMethod("otp"); setError(""); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "otp"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="h-4 w-4" />
                Email OTP
              </button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Password Login */}
            {loginMethod === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                  ) : "Sign In"}
                </Button>
              </form>
            )}

            {/* OTP Login */}
            {loginMethod === "otp" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp-email">Email</Label>
                  <Input
                    id="otp-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent || otpLoading}
                  />
                </div>

                {!otpSent ? (
                  <Button
                    className="w-full"
                    onClick={handleSendOTP}
                    disabled={otpLoading || !email}
                  >
                    {otpLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</>
                    ) : "Send OTP"}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        disabled={isLoading}
                        className="text-center text-xl tracking-widest font-bold"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        OTP sent to {email} — valid for 10 minutes
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleOTPLogin}
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>
                      ) : "Verify OTP & Login"}
                    </Button>
                    <button
                      onClick={() => { setOtpSent(false); setOtp(""); }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground"
                    >
                      Resend OTP
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="text-center text-sm">
              <span className="text-muted-foreground">{"Don't have an account? "}</span>
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

function LoginFormWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginFormWithSuspense />
    </AuthProvider>
  );
}
