import type React from "react";
import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "D'Nava - Panadería y Pastelería Artesanal",
  description:
    "Productos artesanales de alta calidad. Tortas, panes y postres elaborados con dedicación familiar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} ${playfair.variable}`}>
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  );
}
