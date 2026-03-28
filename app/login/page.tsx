"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Loader2, AlertCircle, Mail, KeyRound } from "lucide-react";
import { useAuth, AuthProvider } from "@/lib/auth-context";

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
      const res = await fetch(`/api/auth/send-otp?email=${email}&otp=${otp}`);
      const data = await res.json();

      if (data.valid) {
        // Check if user exists
        const registeredUsers = JSON.parse(
          localStorage.getItem("neet_registered_users") || "{}"
        );
        
        if (registeredUsers[email]) {
          const success = await login(email, registeredUsers[email].password);
          if (success) {
            const storedUser = localStorage.getItem("neet_user");
            const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
            router.push(loggedInUser?.isAdmin ? "/admin" : "/dashboard");
          }
        } else {
          setError("No account found with this email. Please sign up first.");
        }
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
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
        const storedUser = localStorage.getItem("neet_user");
        const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
        router.push(loggedInUser?.isAdmin ? "/admin" : "/dashboard");
      } else {
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
              <p className="text-sm font-bold text-foreground leading-tight">Dr. Amankumar Srivastav</p>
              <p className="text-xs text-muted-foreground">Pvt Tutorials</p>
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
          <CardContent>
            {/* Login Method Toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
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
              <Alert variant="destructive" className="mb-4">
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

            <div className="mt-6 text-center text-sm">
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

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}