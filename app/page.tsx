import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ChaptersPreview } from "@/components/landing/chapters-preview";
import { AboutSection } from "@/components/landing/about-section";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { CTASection } from "@/components/landing/cta-section";
import { AuthProvider } from "@/lib/auth-context";

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <FeaturesSection />
          <ChaptersPreview />
          <AboutSection />
          <PricingPreview />
          <CTASection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
