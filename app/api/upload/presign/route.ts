import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { newKey, presignUpload } from "@/lib/storage";

// Returns a short-lived URL the browser uploads a file to directly.
// - library:     admin uploads recordings, PDFs, Word documents, images
// - voice:       admin uploads an encouragement voice clip
// - certificate: admin uploads a scanned, signed certificate (PDF or image)
// - journal:     a client records a voice message for their journal
// - submission:  a client sends their work (worksheet, recording, photo)

const MB = 1024 * 1024;
const AUDIO = ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/aac", "audio/wav", "audio/x-wav", "audio/webm", "audio/ogg"];
const IMAGES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const DOCS = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const RULES = {
  library: { admin: true, types: [...AUDIO, ...DOCS, ...IMAGES], max: 200 * MB, folder: () => "library" },
  voice: { admin: true, types: AUDIO, max: 5 * MB, folder: () => "voice" },
  certificate: { admin: true, types: ["application/pdf", ...IMAGES], max: 20 * MB, folder: () => "certificates" },
  journal: { admin: false, types: AUDIO, max: 25 * MB, folder: (id: string) => `journal/${id}` },
  submission: { admin: false, types: [...AUDIO, ...DOCS, ...IMAGES], max: 50 * MB, folder: (id: string) => `submissions/${id}` },
} as const;

const schema = z.object({
  purpose: z.enum(["library", "voice", "certificate", "journal", "submission"]),
  filename: z.string().min(1).max(200),
  contentType: z.string().max(150), // may be empty: some devices send no type for Word files
  size: z.number().int().positive(),
});

const EXT_TYPES: Record<string, string> = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.status === "FINISHED") {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  const { purpose, filename, size } = parsed.data;
  let contentType = parsed.data.contentType.split(";")[0].trim().toLowerCase();
  // Some phones/browsers send no type (or a generic one) for Word files.
  if (!contentType || contentType === "application/octet-stream") {
    contentType = EXT_TYPES[filename.toLowerCase().split(".").pop() ?? ""] ?? contentType;
  }
  const rule = RULES[purpose];

  const isAdmin = session.user.role === "ADMIN";
  if (rule.admin !== isAdmin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (!(rule.types as readonly string[]).includes(contentType)) {
    return NextResponse.json({ error: "This file type isn't supported. Use a recording, PDF, Word document or photo." }, { status: 400 });
  }
  if (size > rule.max) {
    return NextResponse.json({ error: `File is too large (max ${Math.round(rule.max / MB)} MB).` }, { status: 400 });
  }

  const key = newKey(rule.folder(session.user.id), filename);
  const uploadUrl = await presignUpload(key, contentType);
  return NextResponse.json({ key, uploadUrl, contentType });
}
