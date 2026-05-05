import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const fontSans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Método IF — Plataforma de Estudos para o IFRN",
  description:
    "A primeira plataforma gamificada e inteligente exclusiva para o Exame de Seleção do Ensino Médio Técnico Integrado do IFRN.",
  keywords: ["IFRN", "Exame de Seleção", "Ensino Médio Técnico", "Estudos", "Simulados", "Método IF"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-sans">{children}</body>
    </html>
  );
}
