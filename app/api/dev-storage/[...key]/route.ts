import { NextResponse, type NextRequest } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { LOCAL_DIR, usingR2, verifyDevSignature } from "@/lib/storage";

// Local stand-in for Cloudflare R2, used only in development when R2 isn't configured.

const MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".mp4": "audio/mp4",
  ".aac": "audio/aac",
  ".wav": "audio/wav",
  ".webm": "audio/webm",
  ".ogg": "audio/ogg",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

function resolve(parts: string[]) {
  const key = parts.map(decodeURIComponent).join("/");
  const full = path.resolve(LOCAL_DIR, key);
  if (!full.startsWith(path.resolve(LOCAL_DIR) + path.sep)) return null;
  return { key, full };
}

function check(req: NextRequest, key: string, op: "get" | "put") {
  if (process.env.NODE_ENV === "production" || usingR2) return false;
  const sp = req.nextUrl.searchParams;
  return sp.get("op") === op && verifyDevSignature(key, op, Number(sp.get("e")), sp.get("s") ?? "");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const r = resolve((await params).key);
  if (!r || !check(req, r.key, "put")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await fs.mkdir(path.dirname(r.full), { recursive: true });
  await fs.writeFile(r.full, Buffer.from(await req.arrayBuffer()));
  return new NextResponse(null, { status: 200 });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const r = resolve((await params).key);
  if (!r || !check(req, r.key, "get")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = await fs.readFile(r.full);
    const total = data.length;
    const type = MIME[path.extname(r.full).toLowerCase()] ?? "application/octet-stream";
    const dl = req.nextUrl.searchParams.get("dl");
    const headers: Record<string, string> = {
      "Content-Type": type,
      "Accept-Ranges": "bytes",
      "Content-Disposition": dl ? `attachment; filename="${dl}"` : "inline",
    };
    // Range support so audio can be seeked.
    const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), total - 1) : total - 1;
      return new NextResponse(data.subarray(start, end + 1), {
        status: 206,
        headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${total}`, "Content-Length": String(end - start + 1) },
      });
    }
    return new NextResponse(data, { headers: { ...headers, "Content-Length": String(total) } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
