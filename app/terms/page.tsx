import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/auth-context";

export default function TermsPage() {
  return (
    <AuthProvider>
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 30, 2026</p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">By accessing or using the NEET Biology platform by Dr. Amankumar Srivastav, you agree to be bound by these Terms & Conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Services</h2>
            <p className="text-muted-foreground">We provide an online NEET Biology preparation platform including MCQ practice, mock tests, and performance analytics. Services are available in Free and Premium plans.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Account Responsibility</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>One account per user is allowed</li>
              <li>Sharing of premium accounts is strictly prohibited</li>
              <li>We reserve the right to terminate accounts violating these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Subscription & Payments</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Premium subscription is valid for 1 year from date of purchase</li>
              <li>All payments are processed securely via Razorpay</li>
              <li>Subscription fees are non-transferable</li>
              <li>We reserve the right to change pricing with prior notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
            <p className="text-muted-foreground">All content on this platform including questions, explanations, and materials is the intellectual property of Dr. Amankumar Srivastav. Copying or redistribution is strictly prohibited.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">We are not responsible for any indirect or consequential damages arising from the use of our platform. Our liability is limited to the subscription amount paid.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
            <p className="text-muted-foreground">For any queries, contact us at: <a href="mailto:amansrivastava135@gmail.com" className="text-primary underline">amansrivastava135@gmail.com</a> or call <a href="tel:+919004811546" className="text-primary underline">+91 9004811546</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
    </AuthProvider>
  );
}
