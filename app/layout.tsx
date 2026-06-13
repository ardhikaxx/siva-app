import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIVA | Siklus Interaktif Vitalitas wanitA",
  description: "Siklus Interaktif Vitalitas wanitA - Aplikasi Web Progresif Pemantau Siklus Menstruasi",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#ff758f",
};

import BottomNav from "@/components/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans pb-20">
        <Providers>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
