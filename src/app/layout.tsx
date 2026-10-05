import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout";
import { DBProvider } from "@/store/db";
import { AuthProvider } from "@/store/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signal POS — Sistem Operasional Bisnis Kebab",
  description:
    "Signal POS: penjualan, HPP, stok, shift, dan laba bersih dalam satu sistem modern.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-[#0F172A]">
        <DBProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </DBProvider>
      </body>
    </html>
  );
}
