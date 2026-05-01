import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/components/shared/providers";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://remnak.com.mx";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Remnak — Marketplace de materiales de construcción",
    template: "%s | Remnak",
  },
  description:
    "Marketplace de materiales de construcción y maquinaria en México. Compra, vende y reutiliza sobrantes con pagos seguros y entregas verificadas.",
  applicationName: "Remnak",
  keywords: [
    "marketplace construcción México",
    "materiales sobrantes",
    "cemento",
    "acero",
    "maquinaria construcción",
    "Campeche",
    "Mérida",
  ],
  authors: [{ name: "Remnak" }],
  creator: "Remnak",
  publisher: "Remnak",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    siteName: "Remnak",
    title: "Remnak — Marketplace de materiales de construcción",
    description:
      "Compra y vende materiales de construcción sobrantes en México con pagos seguros.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remnak — Marketplace de materiales de construcción",
    description:
      "Compra y vende materiales de construcción sobrantes en México con pagos seguros.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#161a1f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
