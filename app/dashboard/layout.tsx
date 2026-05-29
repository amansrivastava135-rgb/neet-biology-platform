import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Your NEET Biology Progress",
  description:
    "Track your NEET Biology preparation progress. View accuracy, weak chapters, test history, and performance analytics on your MASTER360 dashboard.",
  openGraph: {
    title: "MASTER360 Dashboard — NEET Biology Progress Tracker",
    description:
      "Monitor your NEET Biology preparation with detailed analytics, weak chapter analysis, and test history.",
    url: "https://master360.in/dashboard",
  },
  robots: { index: false, follow: false }, // dashboard index nahi hona chahiye
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
