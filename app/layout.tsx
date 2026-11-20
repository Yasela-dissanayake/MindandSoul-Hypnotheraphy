import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { NavigationProgress } from "@/components/navigation-progress";

export const metadata: Metadata = {
  title: "Mind & Soul Works · Hypnotherapy, Reiki & Healing with Rangika",
  description: "Hypnotherapy, Reiki, Animal Reiki and healing with Rangika, in person in Perth and online.",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/brand/logo-mark.png", type: "image/png" }],
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: { siteName: "Mind & Soul Works", images: [{ url: "/brand/logo-full.jpg", width: 1200, height: 800 }] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
