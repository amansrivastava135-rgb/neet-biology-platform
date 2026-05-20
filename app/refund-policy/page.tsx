import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/lib/auth-context";

export default function RefundPolicyPage() {
  return (
    <AuthProvider>
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 30, 2026</p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Overview</h2>
            <p className="text-muted-foreground">Dr. Amankumar Srivastav offers a partial refund policy for Premium subscriptions. Please read this policy carefully before making a purchase.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Refund Eligibility</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Refund requests must be made within <strong>7 days</strong> of purchase</li>
              <li>A <strong>50% refund</strong> will be issued on the original amount paid</li>
              <li>Refund requests after 7 days will not be entertained</li>
              <li>Only one refund request per account is allowed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Non-Refundable Cases</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Requests made after 7 days of purchase</li>
              <li>Accounts found violating our Terms & Conditions</li>
              <li>Cases where premium content has been extensively accessed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Refund Process</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Email us at <a href="mailto:amansrivastava135@gmail.com" className="text-primary underline">amansrivastava135@gmail.com</a> with your registered email and payment ID</li>
              <li>Refunds will be processed within <strong>5-7 business days</strong></li>
              <li>Refund will be credited to the original payment method</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Contact Us</h2>
            <p className="text-muted-foreground">For refund requests or queries: <a href="mailto:amansrivastava135@gmail.com" className="text-primary underline">amansrivastava135@gmail.com</a> or call <a href="tel:+919004811546" className="text-primary underline">+91 9004811546</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
    </AuthProvider>
  );
}