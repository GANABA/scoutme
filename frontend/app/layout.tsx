import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScoutMe - Plateforme de Scouting Football",
  description: "Connectez les talents aux opportunités dans le football africain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
