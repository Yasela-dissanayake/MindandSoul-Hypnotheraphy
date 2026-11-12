import { PageLoading } from "@/components/ui/spinner";

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-sage-50">
      <PageLoading />
    </main>
  );
}
