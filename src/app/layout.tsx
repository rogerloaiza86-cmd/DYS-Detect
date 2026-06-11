import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "Geronimo Éclaireur — L'éclaireur bienveillant de l'école inclusive",
  description: "Des outils d'aide au repérage précoce des troubles DYS, TDAH et TSA pour les enseignants et les équipes éducatives. Aucun enfant n'avance seul.",
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
      <body className={`${fraunces.variable} ${figtree.variable} font-body bg-surface text-on-surface antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
