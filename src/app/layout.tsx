import type { Metadata } from "next";
import { Lexend, Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DYS-Detect - Dashboard",
  description: "Portail Enseignant et Orthophoniste pour la détection des troubles DYS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${lexend.variable} ${inter.variable} font-body bg-surface text-on-surface antialiased overflow-x-hidden`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
