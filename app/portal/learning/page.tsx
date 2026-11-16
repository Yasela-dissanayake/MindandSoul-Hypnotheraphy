import Link from "next/link";
import { Award, BookOpen } from "lucide-react";
import { requireClientPage } from "@/lib/authz";
import { getLearnerPackages } from "@/lib/learning";
import { Progress } from "@/components/ui/progress";

export default async function MyLearningPage() {
  const user = await requireClientPage();
  const packages = await getLearnerPackages(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">My learning</h1>
        <p className="text-stone-500">Your online courses. Work through the lessons in order, at your own pace.</p>
      </div>
      {packages.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-stone-500 ring-1 ring-stone-200">
          You don&apos;t have any online courses yet.{" "}
          <Link href="/learn" className="text-sage-700 underline">
            See the courses
          </Link>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {packages.map((p) => (
            <Link key={p.id} href={`/portal/learning/${p.id}`} className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200 transition hover:ring-sage-300">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-sage-50 p-2.5 text-sage-700">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-serif text-lg text-stone-800">{p.title}</p>
                  {p.summary && <p className="text-sm text-stone-500">{p.summary}</p>}
                </div>
              </div>
              <Progress value={p.total ? (p.done / p.total) * 100 : 0} className="h-2 bg-sage-100 [&>div]:bg-sage-500" />
              <p className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {p.done} of {p.total} lessons done
                </span>
                {p.hasCertificate ? (
                  <span className="flex items-center gap-1 text-amber-700">
                    <Award className="h-3.5 w-3.5" /> Certificate ready
                  </span>
                ) : p.completedAt ? (
                  <span className="text-sage-700">Finished ✓</span>
                ) : null}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
