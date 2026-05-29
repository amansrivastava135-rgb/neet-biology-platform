import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/auth-context";

export default function PrivacyPolicyPage() {
  return (
    <AuthProvider>
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 30, 2026</p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p className="text-muted-foreground">Dr. Amankumar Srivastav ("we", "our", "us") operates the NEET Biology preparation platform at neet-biology-platform.vercel.app. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Name and email address during registration</li>
              <li>Payment information (processed securely via Razorpay)</li>
              <li>Usage data and quiz performance</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>To provide and improve our services</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send important updates about your account</li>
              <li>To track your learning progress</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
            <p className="text-muted-foreground">We use industry-standard security measures to protect your data. Payments are processed by Razorpay and we do not store any card or UPI details on our servers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Third-Party Services</h2>
            <p className="text-muted-foreground">We use Razorpay for payment processing and Supabase for data storage. These services have their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
            <p className="text-muted-foreground">For any privacy-related queries, contact us at: <a href="mailto:amansrivastava135@gmail.com" className="text-primary underline">amansrivastava135@gmail.com</a> or call <a href="tel:+919004811546" className="text-primary underline">+91 9004811546</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
    </AuthProvider>
  );
}
