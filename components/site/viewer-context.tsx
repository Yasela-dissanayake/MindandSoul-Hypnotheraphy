"use client";

import { createContext, useContext } from "react";
import type { SiteViewer } from "@/lib/site-viewer";

// The signed-in person (or null), shared with every page of the website so forms can fill in their details.
const ViewerContext = createContext<SiteViewer | null>(null);

export function ViewerProvider({ viewer, children }: { viewer: SiteViewer | null; children: React.ReactNode }) {
  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>;
}

/** The signed-in person on the website, or null for a visitor. */
export const useViewer = () => useContext(ViewerContext);

/** A signed-in client: their details fill in the booking and enquiry forms (not Rangika's own account). */
export const useClientViewer = () => {
  const v = useViewer();
  return v?.role === "CLIENT" ? v : null;
};
