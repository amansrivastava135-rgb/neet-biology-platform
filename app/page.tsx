import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ChaptersPreview } from "@/components/landing/chapters-preview";
import { AboutSection } from "@/components/landing/about-section";
import { CTASection } from "@/components/landing/cta-section";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "MASTER360 – NEET Biology Mock Tests, MCQs & PYQs Platform",
  description:
    "MASTER360 is a complete NEET Biology preparation platform with 3800+ MCQs, chapter-wise practice, PYQs (2010-2024), full mock tests, and detailed performance analytics.",
  openGraph: {
    title: "MASTER360 – NEET Biology Mock Tests, MCQs & PYQs Platform",
    description:
      "MASTER360: 3800+ MCQs, PYQs, mock tests, and performance analytics for NEET Biology by Dr. Amankumar Srivastav.",
    url: "https://master360.vercel.app",
  },
};

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* H1 — hidden visually but present for SEO */}
          <h1 className="sr-only">
            MASTER360 – NEET Biology Preparation Platform by Dr. Amankumar Srivastav
          </h1>
          <HeroSection />
          <FeaturesSection />
          <ChaptersPreview />
          <AboutSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}