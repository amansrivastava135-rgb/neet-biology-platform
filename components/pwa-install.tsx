"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY        = "m360_pwa_dismissed";
const STORAGE_INSTALLED  = "m360_pwa_installed";
const TRIGGER_DELAY_MS   = 20000; // 20 seconds
const DISMISS_DAYS       = 7;     // re-show after 7 days

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "android" | "ios" | "other";
type ModalState = "hidden" | "modal" | "sticky";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  const isIOS =
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(ua);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "other";
}

function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { timestamp } = JSON.parse(raw);
    const daysSince =
      (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    return daysSince < DISMISS_DAYS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
  } catch {}
}

function markInstalled() {
  try {
    localStorage.setItem(STORAGE_INSTALLED, "1");
  } catch {}
}

function wasAlreadyInstalled(): boolean {
  try {
    return localStorage.getItem(STORAGE_INSTALLED) === "1";
  } catch {
    return false;
  }
}

// Simple analytics ping (fire-and-forget, never throws)
function trackEvent(event: string, platform: string) {
  try {
    if (typeof window !== "undefined" && (window as any).va) {
      (window as any).va("event", { name: `pwa_${event}`, platform });
    }
  } catch {}
}

// ─── iOS Guide ────────────────────────────────────────────────────────────────

function IOSGuide() {
  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        How to install on iPhone / iPad
      </p>
      {[
        {
          step: "1",
          icon: "⬆️",
          text: (
            <>
              Tap the <strong>Share</strong> button at the bottom of Safari
            </>
          ),
        },
        {
          step: "2",
          icon: "➕",
          text: (
            <>
              Scroll down and tap{" "}
              <strong>&quot;Add to Home Screen&quot;</strong>
            </>
          ),
        },
        {
          step: "3",
          icon: "✅",
          text: (
            <>
              Tap <strong>Add</strong> in the top-right corner
            </>
          ),
        },
      ].map(({ step, icon, text }) => (
        <div key={step} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
            {step}
          </span>
          <p className="text-sm text-gray-700 leading-relaxed">
            {icon} {text}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Benefits list ────────────────────────────────────────────────────────────

function Benefits() {
  const items = [
    { icon: "⚡", title: "Faster performance", desc: "Loads instantly, even on slow networks" },
    { icon: "🖥️", title: "Full-screen tests",  desc: "No browser bar — distraction-free focus" },
    { icon: "📲", title: "Quick access",        desc: "One tap from your home screen" },
    { icon: "📴", title: "App-like experience", desc: "Works like a native app" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {items.map(({ icon, title, desc }) => (
        <div
          key={title}
          className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100"
        >
          <span className="text-xl">{icon}</span>
          <p className="text-xs font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 leading-snug">{desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PWAInstall() {
  const [state, setState]           = useState<ModalState>("hidden");
  const [platform, setPlatform]     = useState<Platform>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installing, setInstalling] = useState(false);
  const [mounted, setMounted]       = useState(false);

  // ── Setup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    // Already installed or running standalone — do nothing
    if (isRunningStandalone() || wasAlreadyInstalled()) return;

    const plat = detectPlatform();
    setPlatform(plat);

    // Only show for Android and iOS
    if (plat === "other") return;

    // Capture beforeinstallprompt for Android
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Track successful install
    const handleAppInstalled = () => {
      markInstalled();
      setState("hidden");
      trackEvent("installed", plat);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // Trigger after delay (if not dismissed recently)
    let timer: ReturnType<typeof setTimeout>;
    if (!wasDismissedRecently()) {
      timer = setTimeout(() => {
        setState("modal");
        trackEvent("modal_shown", plat);
      }, TRIGGER_DELAY_MS);
    } else {
      // Dismissed recently — show sticky only
      setState("sticky");
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // ── Trigger modal after login event ──────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (isRunningStandalone() || wasAlreadyInstalled()) return;
    if (platform === "other") return;

    const handleLoginEvent = () => {
      if (!wasDismissedRecently()) {
        setState("modal");
        trackEvent("modal_shown_login", platform);
      }
    };

    window.addEventListener("m360_user_logged_in", handleLoginEvent);
    return () => window.removeEventListener("m360_user_logged_in", handleLoginEvent);
  }, [mounted, platform]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleInstall = useCallback(async () => {
    trackEvent("install_clicked", platform);

    if (platform === "android" && deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          markInstalled();
          trackEvent("android_accepted", platform);
        } else {
          trackEvent("android_dismissed", platform);
        }
        setDeferredPrompt(null);
      } catch {}
      setInstalling(false);
      setState("hidden");
    }
    // iOS: button not applicable — guide is shown instead
  }, [platform, deferredPrompt]);

  const handleDismiss = useCallback(() => {
    markDismissed();
    setState("sticky");
    trackEvent("modal_dismissed", platform);
  }, [platform]);

  const handleStickyOpen = useCallback(() => {
    setState("modal");
    trackEvent("sticky_clicked", platform);
  }, [platform]);

  const handleStickyDismiss = useCallback(() => {
    markDismissed();
    setState("hidden");
    trackEvent("sticky_dismissed", platform);
  }, [platform]);

  if (!mounted) return null;
  if (isRunningStandalone() || wasAlreadyInstalled()) return null;
  if (platform === "other") return null;

  return (
    <>
      {/* ── Backdrop ── */}
      {state === "modal" && (
        <div
          className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
          style={{ animation: "m360FadeIn 0.2s ease" }}
          onClick={handleDismiss}
        />
      )}

      {/* ── Modal ── */}
      {state === "modal" && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[999] mx-auto max-w-md w-full"
          style={{ animation: "m360SlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          <div className="m-3 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">

            {/* Green header bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-emerald-400" />

            <div className="p-5">
              {/* Title row */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                      Install MASTER360
                    </h2>
                    <p className="text-xs text-gray-500">
                      NEET Biology · Free · No App Store needed
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Benefits grid */}
              <Benefits />

              {/* iOS guide or Android button */}
              {platform === "ios" ? (
                <IOSGuide />
              ) : (
                <button
                  onClick={handleInstall}
                  disabled={installing || !deferredPrompt}
                  className="mt-4 w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95
                    text-white text-sm font-semibold transition-all duration-150 shadow-md
                    disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {installing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Installing…
                    </>
                  ) : (
                    <>📲 Install Now — It&apos;s Free</>
                  )}
                </button>
              )}

              {/* Dismiss link */}
              <button
                onClick={handleDismiss}
                className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                {platform === "ios" ? "I'll do it later" : "Not now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky bottom CTA ── */}
      {state === "sticky" && (
        <div
          className="fixed bottom-4 left-0 right-0 z-[997] flex justify-center px-4 pointer-events-none"
          style={{ animation: "m360FadeIn 0.4s ease" }}
        >
          <div className="flex items-center gap-2 pointer-events-auto bg-green-600 text-white
            rounded-full px-4 py-2.5 shadow-lg shadow-green-900/30 border border-green-500">
            <button
              onClick={handleStickyOpen}
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <span>📲</span>
              <span>Install MASTER360 App</span>
            </button>
            <button
              onClick={handleStickyDismiss}
              className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Keyframe animations (injected once) ── */}
      <style>{`
        @keyframes m360FadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes m360SlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── Login trigger helper (call this after successful login) ─────────────────
// Usage: import { triggerPWAPrompt } from "@/components/pwa-install"
// Call:  triggerPWAPrompt() inside your login success handler

export function triggerPWAPrompt() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("m360_user_logged_in"));
  }
}