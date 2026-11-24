"use client";

import { ErrorScreen } from "@/components/error-screen";

// Anything else (e.g. the login page): a friendly message instead of the bare error page.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen error={error} reset={reset} area="site" />;
}
