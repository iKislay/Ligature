import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ligature - Stateless SVG Widgets for GitHub",
  description: "One directory. Infinite themes. Stateless, edge-rendered SVGs for your README.",
};

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 selection:bg-blue-200 dark:selection:bg-blue-900">
        <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
          <SiteHeader />
          <main className="mx-auto w-full" id="content">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
