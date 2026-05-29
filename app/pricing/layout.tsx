import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — NEET Biology Preparation Plans",
  description:
    "Choose the right NEET Biology plan — 5-Day Trial at ₹29, Monthly at ₹249, 6 Months at ₹599, or Yearly at ₹999. Full access to 3800+ MCQs, PYQs, and mock tests.",
  openGraph: {
    title: "MASTER360 Pricing — NEET Biology Plans",
    description:
      "Affordable NEET Biology preparation plans starting at ₹29. Get access to 3800+ MCQs, PYQs (2010–2024), and full mock tests.",
    url: "https://master360.in/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
