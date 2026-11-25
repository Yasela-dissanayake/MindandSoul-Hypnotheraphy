import type React from "react";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/components/ui/toaster";
import { ViewerProvider } from "@/components/site/viewer-context";
import { getSiteViewer } from "@/lib/site-viewer";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Who is signed in (null for visitors): the menu shows their name, and the booking, checkout and
  // enquiry forms fill in their details.
  const viewer = await getSiteViewer();
  return (
    <ViewerProvider viewer={viewer}>
      <SiteHeader />
      {children}
      {/* Messages from the contact forms ("Your request has been sent!") */}
      <Toaster />
    </ViewerProvider>
  );
}
