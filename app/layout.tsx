import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuestLog — ACD Gamified Campus Life & Engagement Hub",
  description:
    "QuestLog — ACD Gamified Campus Life & Engagement Hub with verified event attendance, QR check-in, and evaluation management.",
  openGraph: {
    title: "QuestLog — ACD Gamified Campus Life & Engagement Hub",
    description:
      "QuestLog — ACD Gamified Campus Life & Engagement Hub with verified event attendance, QR check-in, and evaluation management.",
    siteName: "QuestLog",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}>
        {children}
      </body>
    </html>
  );
}
