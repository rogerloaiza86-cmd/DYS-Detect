import type { Metadata } from "next";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Geronimo Éclaireur — Portail",
  description: "Portail enseignant pour le repérage et l'orientation des troubles DYS, TDAH et TSA.",
};

export default function PortailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
