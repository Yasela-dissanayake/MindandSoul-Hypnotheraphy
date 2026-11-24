import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { NavigationProgress } from "@/components/navigation-progress";
import { NetworkStatus } from "@/components/network-status";

// The logo's typeface, used only for the "Mind & Soul Works" wordmark (class font-brand).
const brandFont = Poppins({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-brand", display: "swap" });

export const metadata: Metadata = {
  title: "Mind & Soul Works · Hypnotherapy, Reiki & Healing with Rangika",
  description: "Hypnotherapy, Reiki, Animal Reiki and healing with Rangika, in person in Perth and online.",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/brand/logo-mark.png", type: "image/png" }],
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: { siteName: "Mind & Soul Works", images: [{ url: "/brand/logo-full.jpg", width: 1200, height: 630 }] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={brandFont.variable}>
      <body>
        <NavigationProgress />
        {children}
        <NetworkStatus />
      </body>
    </html>
  );
}
