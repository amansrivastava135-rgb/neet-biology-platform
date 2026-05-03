import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chapter Practice — NEET Biology MCQs",
  description:
    "Practice NEET Biology chapter-wise with 3800+ MCQs across 38 chapters. Covers Class 11 and Class 12 NCERT Biology with detailed explanations.",
  openGraph: {
    title: "NEET Biology Chapter Practice — MASTER360",
    description:
      "38 chapters, 3800+ MCQs, NCERT-based explanations. Practice NEET Biology chapter-wise on MASTER360.",
    url: "https://master360.vercel.app/practice",
  },
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}