import type React from "react";
import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { StructuredData } from "@/components/structured-data";
import { HealthCheckProvider } from "@/components/HealthCheckProvider";
import Script from "next/script";
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
  metadataBase: new URL("https://www.dnava-api.com"),
  title: {
    default: "D'Nava - Panadería y Pastelería Artesanal",
    template: "%s | D'Nava",
  },
  description:
    "Productos artesanales de alta calidad. Tortas, panes y postres elaborados con dedicación familiar.",
  keywords: [
    "panadería",
    "pastelería",
    "tortas artesanales",
    "panes artesanales",
    "postres",
    "Lima",
    "Perú",
    "delivery",
    "tortas por encargo",
    "pastelería peruana",
  ],
  authors: [{ name: "D'Nava" }],
  creator: "D'Nava",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://www.dnava-api.com",
    title: "D'Nava - Panadería y Pastelería Artesanal",
    description:
      "Productos artesanales de alta calidad. Tortas, panes y postres elaborados con dedicación familiar.",
    siteName: "D'Nava",
  },
  twitter: {
    card: "summary_large_image",
    title: "D'Nava - Panadería y Pastelería Artesanal",
    description:
      "Productos artesanales de alta calidad. Tortas, panes y postres elaborados con dedicación familiar.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} ${playfair.variable}`}>
      <head>
        <StructuredData />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4FZS5T5B2J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4FZS5T5B2J');
          `}
        </Script>
      </head>
      <body className={`font-sans antialiased`}>
        <HealthCheckProvider>
          {children}
          <Toaster position="top-center" richColors />
        </HealthCheckProvider>
      </body>
    </html>
  );
}
