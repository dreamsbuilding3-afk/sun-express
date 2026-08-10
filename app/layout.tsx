import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sun Express — Bordereaux d'expédition",
  description: "Génération de bordereaux d'expédition pour la réexpédition de colis France → Antilles/Guyane.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
