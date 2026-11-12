import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { NavigationProgress } from "@/components/navigation-progress";

export const metadata: Metadata = {
  title: "Heal With Rangika Hypnotherapy",
  description: "Professional hypnotherapy services in Australia",
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
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
