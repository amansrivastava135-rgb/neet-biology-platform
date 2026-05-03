import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Result History — NEET Biology Test Results",
  description:
    "View your complete NEET Biology test history including mock test scores, chapter practice results, accuracy trends, and performance analytics.",
  openGraph: {
    title: "MASTER360 Result History — NEET Biology",
    description:
      "Your complete NEET Biology test history — mock tests, chapter practice, scores, and accuracy trends.",
    url: "https://master360.vercel.app/results",
  },
  robots: { index: false, follow: false }, // private page — index nahi hona chahiye
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}