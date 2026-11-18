import type React from "react";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/components/ui/toaster";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      {children}
      {/* Messages from the contact forms ("Your request has been sent!") */}
      <Toaster />
    </>
  );
}
