import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { readRequestToken } from "@/lib/request-token";
import { SERVICES } from "@/lib/catalog";
import { RequestAccessForm } from "./request-access-form";

export const metadata: Metadata = { title: "Request access · Heal With Rangika", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function RequestAccessPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const email = readRequestToken(t);
  const [request, courses] = await Promise.all([
    email ? db.accessRequest.findUnique({ where: { email } }) : null,
    db.course.findMany({ where: { archived: false }, select: { id: true, title: true }, orderBy: [{ order: "asc" }, { title: "asc" }] }),
  ]);
  const usable = request && request.status === "PENDING";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-sage-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.jpeg" alt="Heal With Rangika" width={64} height={64} priority className="rounded-full" />
          <h1 className="mt-4 font-serif text-2xl text-stone-800">Request access</h1>
          {usable ? (
            <p className="mt-1 text-sm text-stone-500">
              Signed in as <strong className="font-medium text-stone-700">{request.email}</strong>. Tell Rangika what you&apos;re here for, so she can
              set up your space.
            </p>
          ) : null}
        </div>

        {usable ? (
          <RequestAccessForm
            token={t!}
            services={SERVICES.map((s) => ({ id: s.id, label: s.label }))}
            courses={courses}
            initial={{
              wants: (request.wants as "SESSIONS" | "COURSE" | "UNSURE" | null) ?? null,
              service: request.wantsService,
              courseId: request.wantsCourseId,
              message: request.message ?? "",
              phone: request.phone ?? "",
            }}
          />
        ) : (
          <div className="space-y-4 text-center">
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
              This page has expired or the link isn&apos;t valid. Please sign in with Google again to send your request.
            </p>
            <Link href="/login" className="inline-block rounded-md bg-sage-600 px-5 py-2.5 text-sm text-white hover:bg-sage-700">
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
