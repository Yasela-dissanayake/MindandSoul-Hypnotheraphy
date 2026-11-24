"use client";

import { ErrorScreen } from "@/components/error-screen";

// Website pages: the header stays, the page area shows a friendly message.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen error={error} reset={reset} area="site" />;
}
