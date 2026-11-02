import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "StudyMate: plan your studies, keep your notes", template: "%s · StudyMate" },
  description:
    "StudyMate helps university students plan study sessions, organise course notes and subjects, and track study progress in one calm place.",
};

export const viewport: Viewport = {
  themeColor: "#2b47d9",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
