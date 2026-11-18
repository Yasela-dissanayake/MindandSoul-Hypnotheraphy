import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHmac, randomUUID } from "crypto";
import path from "path";
import { promises as fs } from "fs";

// Private file storage on Cloudflare R2.
// In local development without R2 settings, files are kept in ./.local-uploads
// and served by /api/dev-storage (disabled in production).

const R2 = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
};

export const usingR2 = Boolean(R2.accountId && R2.accessKeyId && R2.secretAccessKey && R2.bucket);

function assertStorageConfigured() {
  if (!usingR2 && process.env.NODE_ENV === "production") {
    throw new Error("File storage (Cloudflare R2) is not configured. Set the R2_* environment variables.");
  }
}

let client: S3Client | null = null;
function s3() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${R2.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2.accessKeyId!, secretAccessKey: R2.secretAccessKey! },
    });
  }
  return client;
}

export const LOCAL_DIR = path.join(process.cwd(), ".local-uploads");

function devSign(key: string, op: "get" | "put", expires: number) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "dev").update(`${op}:${key}:${expires}`).digest("hex");
}

export function verifyDevSignature(key: string, op: "get" | "put", expires: number, sig: string) {
  return expires > Date.now() && devSign(key, op, expires) === sig;
}

function devUrl(key: string, op: "get" | "put", seconds: number, extra = "") {
  const expires = Date.now() + seconds * 1000;
  return `/api/dev-storage/${key}?op=${op}&e=${expires}&s=${devSign(key, op, expires)}${extra}`;
}

function safeName(filename: string) {
  const base = filename.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").replace(/-+/g, "-");
  return base.slice(-80) || "file";
}

export function newKey(folder: string, filename: string) {
  return `${folder}/${randomUUID()}/${safeName(filename)}`;
}

/** Short-lived URL the browser can PUT a file to. */
export async function presignUpload(key: string, contentType: string): Promise<string> {
  assertStorageConfigured();
  if (!usingR2) return devUrl(key, "put", 600);
  return getSignedUrl(s3(), new PutObjectCommand({ Bucket: R2.bucket, Key: key, ContentType: contentType }), {
    expiresIn: 600,
  });
}

/**
 * Short-lived URL to open or play a private file. Links last 10 minutes; pass `seconds` for
 * videos, which keep loading while they play, so a long video doesn't stop halfway.
 */
export async function presignDownload(key: string, opts: { download?: string; seconds?: number } = {}): Promise<string> {
  assertStorageConfigured();
  const seconds = opts.seconds ?? 600;
  const disposition = opts.download ? `attachment; filename="${safeName(opts.download)}"` : "inline";
  if (!usingR2) return devUrl(key, "get", seconds, opts.download ? `&dl=${encodeURIComponent(safeName(opts.download))}` : "");
  return getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: R2.bucket, Key: key, ResponseContentDisposition: disposition }),
    { expiresIn: seconds },
  );
}

export async function deleteObject(key: string | null | undefined) {
  if (!key) return;
  try {
    if (!usingR2) {
      await fs.rm(path.join(LOCAL_DIR, key), { force: true });
      return;
    }
    await s3().send(new DeleteObjectCommand({ Bucket: R2.bucket, Key: key }));
  } catch (e) {
    console.error("Failed to delete stored file", key, e);
  }
}

export const STORAGE_FREE_BYTES = 10 * 1024 ** 3; // Cloudflare R2 free allowance (~10 GB)
export const STORAGE_WARN_BYTES = 8 * 1024 ** 3;
