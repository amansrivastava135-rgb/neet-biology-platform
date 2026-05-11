"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fetchUserProgress, saveUserProgress } from "@/lib/progress-utils";

export type User = {
  id: string;
  email: string;
  name: string;
  isPaid: boolean;
  subscriptionPlan?: "free" | "monthly" | "sixMonth" | "premium" | "trial" | "expired";
  subscriptionStart?: string;
  subscriptionEnd?: string;
  subscription?: "free" | "active" | "expired";
  plan?: string;
  subscription_end?: string;
  isAdmin: boolean;
};

export type UserProgress = {
  totalAttempted: number;
  totalCorrect: number;
  chapterProgress: Record<number, { attempted: number; correct: number }>;
};

type AuthContextType = {
  user: User | null;
  progress: UserProgress;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProgress: (chapterId: number, isCorrect: boolean) => void;
  updateUser: (u: User) => Promise<void>;
  activateSubscription: (plan: string, days: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPTY_PROGRESS: UserProgress = {
  totalAttempted: 0,
  totalCorrect: 0,
  chapterProgress: {},
};

function progressKey(userId: string) {
  return `neet_progress_${userId}`;
}

const DEMO_USERS: Record<string, { password: string; user: User }> =
  process.env.NODE_ENV === "development"
    ? {
        "demo@example.com": {
          password: "demo123",
          user: {
            id: "demo_1",
            email: "demo@example.com",
            name: "Demo User",
            isPaid: false,
            isAdmin: false,
            subscription: "free",
            subscriptionPlan: "free",
          },
        },
      }
    : {};

function applySubscription(u: User, plan: string, days: number): User {
  const now = new Date();
  const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    ...u,
    subscriptionPlan: plan as User["subscriptionPlan"],
    plan: plan,
    subscriptionStart: now.toISOString(),
    subscriptionEnd: expiry.toISOString(),
    subscription: "active",
    isPaid: true,
  };
}

async function loadProgress(userId: string): Promise<UserProgress> {
  // Pehle Supabase se try karo
  try {
    const supabaseProgress = await fetchUserProgress(userId);
    if (supabaseProgress.totalAttempted > 0 || Object.keys(supabaseProgress.chapterProgress).length > 0) {
      // Supabase mein data hai — localStorage bhi sync karo
      localStorage.setItem(progressKey(userId), JSON.stringify(supabaseProgress));
      return supabaseProgress;
    }
  } catch {
    // Supabase fail — fallback to localStorage
  }

  // Supabase empty ya failed — localStorage check karo
  try {
    const stored = localStorage.getItem(progressKey(userId));
    if (stored) {
      const localProgress = JSON.parse(stored) as UserProgress;
      // localStorage mein data hai — Supabase mein bhi save karo (migration)
      if (localProgress.totalAttempted > 0) {
        saveUserProgress(userId, localProgress).catch(() => {});
      }
      return localProgress;
    }
  } catch {}

  return EMPTY_PROGRESS;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress>(EMPTY_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("neet_user");
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        setUser(parsed);
        // Supabase se load karo (localStorage fallback ke saath)
        loadProgress(parsed.id).then(setProgress);
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      const storedProgress = localStorage.getItem(progressKey(demoUser.user.id));
      setProgress(storedProgress ? JSON.parse(storedProgress) : EMPTY_PROGRESS);
      localStorage.setItem("neet_user", JSON.stringify(demoUser.user));
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: demoUser.user }),
      });
      return true;
    }

    const res = await fetch("/api/auth/login-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem("neet_user", JSON.stringify(data.user));
      // Supabase se progress load karo login pe
      loadProgress(data.user.id).then(setProgress);
      return true;
    }

    return false;
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    if (DEMO_USERS[email]) return false;

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.success && data.user) {
      const newUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isPaid: false,
        isAdmin: false,
        subscription: "free",
        subscriptionPlan: "free",
      };
      setUser(newUser);
      setProgress(EMPTY_PROGRESS);
      localStorage.setItem("neet_user", JSON.stringify(newUser));
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: newUser }),
      });
      return true;
    }

    return false;
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setProgress(EMPTY_PROGRESS);
    localStorage.removeItem("neet_user");
    await fetch("/api/auth/logout", { method: "POST" });
  };

  const updateUser = async (u: User): Promise<void> => {
    setUser(u);
    localStorage.setItem("neet_user", JSON.stringify(u));
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: u }),
    });
  };

  const activateSubscription = async (plan: string, days: number): Promise<void> => {
    if (!user) return;
    const updated = applySubscription(user, plan, days);
    setUser(updated);
    localStorage.setItem("neet_user", JSON.stringify(updated));
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: updated }),
    });
  };

  const updateProgress = (chapterId: number, isCorrect: boolean) => {
    if (!user) return;
    setProgress((prev) => {
      const newProgress = {
        totalAttempted: prev.totalAttempted + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        chapterProgress: {
          ...prev.chapterProgress,
          [chapterId]: {
            attempted: (prev.chapterProgress[chapterId]?.attempted || 0) + 1,
            correct:
              (prev.chapterProgress[chapterId]?.correct || 0) +
              (isCorrect ? 1 : 0),
          },
        },
      };
      // localStorage mein save karo (instant)
      localStorage.setItem(progressKey(user.id), JSON.stringify(newProgress));
      // Supabase mein bhi save karo (async, fire-and-forget)
      saveUserProgress(user.id, newProgress).catch(() => {});
      return newProgress;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        progress,
        isLoading,
        login,
        signup,
        logout,
        updateProgress,
        updateUser,
        activateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}