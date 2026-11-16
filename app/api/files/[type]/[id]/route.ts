import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { presignDownload } from "@/lib/storage";
import { clientCanAccessResource } from "@/lib/plans";

// Opens a private file after checking the signed-in person may see it,
// by redirecting to a link that expires in 10 minutes.
//   /api/files/resource/:id     library file (?download=1 to save it)
//   /api/files/journal/:id      journal voice message (owner or admin)
//   /api/files/voice/:id        encouragement voice clip (any signed-in user)
//   /api/files/submission/:id   work a client sent (owner or admin)
//   /api/files/certificate/:id  enrolment certificate (the student or admin)
//   /api/files/learning-certificate/:id  online course certificate (the learner or admin)

const EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
};
const withExt = (name: string, type: string | null | undefined) => {
  const ext = (type && EXT[type]) || "";
  return ext && !name.toLowerCase().endsWith(ext) ? `${name}${ext}` : name;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const session = await auth();
  const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!session?.user || session.user.status === "FINISHED") return notFound();
  const isAdmin = session.user.role === "ADMIN";
  const wantsDownload = req.nextUrl.searchParams.get("download") === "1";
  let key: string | null = null;
  let downloadName: string | undefined;

  if (type === "resource") {
    const r = await db.resource.findUnique({ where: { id } });
    if (!r?.storageKey) return notFound();
    if (!isAdmin && !(await clientCanAccessResource(session.user.id, id))) return notFound();
    key = r.storageKey;
    // Recordings are listen-only for clients; documents and images can be saved.
    if (wantsDownload && (r.kind !== "AUDIO" || isAdmin)) downloadName = withExt(r.title, r.contentType);
    // Word documents can't be shown in the browser, so always download them.
    if (r.kind === "DOCUMENT") downloadName = withExt(r.title, r.contentType);
  } else if (type === "journal") {
    const j = await db.journalEntry.findUnique({ where: { id } });
    if (!j?.audioKey) return notFound();
    if (!isAdmin && j.userId !== session.user.id) return notFound();
    key = j.audioKey;
  } else if (type === "voice") {
    const c = await db.voiceClip.findUnique({ where: { id } });
    if (!c) return notFound();
    key = c.storageKey;
  } else if (type === "submission") {
    const s = await db.submission.findUnique({ where: { id } });
    if (!s) return notFound();
    if (!isAdmin && s.userId !== session.user.id) return notFound();
    key = s.storageKey;
    if (wantsDownload || s.contentType.includes("word") || s.contentType === "application/msword") downloadName = s.originalName;
    if (isAdmin && !s.seenAt) await db.submission.update({ where: { id }, data: { seenAt: new Date() } });
  } else if (type === "certificate") {
    const e = await db.enrollment.findUnique({ where: { id }, include: { course: { select: { title: true } } } });
    if (!e?.certificateKey) return notFound();
    if (!isAdmin && e.userId !== session.user.id) return notFound();
    key = e.certificateKey;
    if (wantsDownload) downloadName = withExt(`Certificate - ${e.course.title}`, e.certificateType);
  } else if (type === "learning-certificate") {
    const e = await db.packageEnrollment.findUnique({ where: { id }, include: { package: { select: { title: true } } } });
    if (!e?.certificateKey) return notFound();
    if (!isAdmin && e.userId !== session.user.id) return notFound();
    key = e.certificateKey;
    if (wantsDownload) downloadName = withExt(`Certificate - ${e.package.title}`, e.certificateType);
  } else {
    return notFound();
  }

  const url = await presignDownload(key, { download: downloadName });
  const res = NextResponse.redirect(new URL(url, req.nextUrl.origin), 302);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}
