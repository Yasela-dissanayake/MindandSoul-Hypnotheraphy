"use client";

// Uploads a file straight from the browser to private storage (R2), with progress.

export type UploadPurpose = "library" | "voice" | "journal" | "journal-reply" | "certificate" | "submission" | "cover";

export async function uploadFile(
  file: Blob,
  opts: { purpose: UploadPurpose; filename: string; onProgress?: (pct: number) => void },
): Promise<{ key: string; contentType: string; size: number }> {
  const contentType = (file.type || "application/octet-stream").split(";")[0];
  const res = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purpose: opts.purpose, filename: opts.filename, contentType, size: file.size }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload could not start.");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", data.uploadUrl);
    xhr.setRequestHeader("Content-Type", data.contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed.")));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(file);
  });
  return { key: data.key, contentType: data.contentType, size: file.size };
}

export { formatBytes, formatDuration } from "./format";
