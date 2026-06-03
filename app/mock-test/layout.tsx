import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Tests — NEET Biology Full Length Tests",
  description:
    "Attempt full-length NEET Biology mock tests with 90 questions in 60 minutes. NEET pattern tests with performance analytics and weak chapter analysis.",
  openGraph: {
    title: "NEET Biology Mock Tests — MASTER360",
    description:
      "Full-length NEET pattern mock tests with 90 questions, timer, and detailed analytics. Prepare smarter with MASTER360.",
    url: "https://master360.in/mock-test",
  },
};

export default function MockTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
