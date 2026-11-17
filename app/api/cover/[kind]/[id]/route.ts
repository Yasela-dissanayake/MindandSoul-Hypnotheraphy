import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { presignDownload } from "@/lib/storage";
import { isSiteImage } from "@/lib/covers";

// Cover photo of a course or online package. Anyone may see the cover of something
// that is on the website; drafts are only visible to the admin.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  const item =
    kind === "course"
      ? await db.course.findUnique({ where: { id }, select: { imageKey: true, published: true, archived: true } })
      : kind === "package"
        ? await db.learningPackage.findUnique({ where: { id }, select: { imageKey: true, published: true, archived: true } })
        : null;
  if (!item?.imageKey) return new NextResponse(null, { status: 404 });
  if (!item.published || item.archived) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse(null, { status: 404 });
  }
  // One of the website's own images: send the browser straight there.
  const url = isSiteImage(item.imageKey) ? item.imageKey : await presignDownload(item.imageKey);
  return NextResponse.redirect(new URL(url, _req.url), { status: 302, headers: { "Cache-Control": "public, max-age=300" } });
}
