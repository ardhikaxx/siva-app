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
  description: "Aplikasi pelacak menstruasi & siklus kewanitaan paling cerdas. SIVA membantu kamu memantau mood, gejala, mencatat jurnal kesehatan, hingga deteksi PMDD dengan mudah dan aman.",
  keywords: ["pelacak haid", "menstruasi", "kesehatan wanita", "femtech", "pcos tracker", "endometriosis", "kalkulator masa subur", "aplikasi siva", "program hamil", "catat haid"],
  authors: [{ name: "SIVA Team" }],
  creator: "SIVA",
  publisher: "SIVA FemTech",
  applicationName: "SIVA App",
  manifest: "/manifest.json",
  openGraph: {
    title: "SIVA | Pelacak Siklus Haid & Kesehatan Wanita Cerdas",
    description: "Pantau menstruasi, kesehatan, dan siklus vitalitasmu dengan SIVA. Aman, cantik, dan sangat privat.",
    url: "https://siva.app",
    siteName: "SIVA",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIVA | Pelacak Siklus Haid & Kesehatan Wanita Cerdas",
    description: "Pantau menstruasi, kesehatan, dan siklus vitalitasmu dengan SIVA. Aman, cantik, dan sangat privat.",
    creator: "@siva_app",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIVA",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff758f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      suppressHydrationWarning
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
