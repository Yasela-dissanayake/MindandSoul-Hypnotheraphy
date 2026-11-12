import { Download, ExternalLink, FileText, FileType2, ImageIcon } from "lucide-react";
import { AudioPlayer } from "./audio-player";
import { YouTubeEmbed } from "./youtube";

export type ResourceView = {
  id: string;
  title: string;
  description: string | null;
  kind: "AUDIO" | "PDF" | "DOCUMENT" | "IMAGE" | "VIDEO" | "LINK";
  url: string | null;
};

function Row({
  icon,
  title,
  sub,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-50 text-sage-600">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-stone-800">{title}</p>
        {sub && <p className="truncate text-sm text-stone-500">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

const btn = "rounded-full bg-sage-600 px-3 py-1.5 text-sm text-white hover:bg-sage-700";

export function ResourceItem({ r, note }: { r: ResourceView; note?: string | null }) {
  const sub = note || r.description;
  const file = `/api/files/resource/${r.id}`;

  switch (r.kind) {
    case "AUDIO":
      return <AudioPlayer resourceId={r.id} title={r.title} subtitle={sub || undefined} compact />;
    case "VIDEO":
      return (
        <div className="space-y-2 rounded-2xl bg-white p-3 ring-1 ring-stone-200">
          <p className="font-medium text-stone-800">{r.title}</p>
          {sub && <p className="text-sm text-stone-500">{sub}</p>}
          {r.url && <YouTubeEmbed url={r.url} title={r.title} />}
        </div>
      );
    case "LINK":
      return (
        <Row icon={<ExternalLink className="h-5 w-5" />} title={r.title} sub={sub}>
          {r.url && (
            <a href={r.url} target="_blank" rel="noreferrer" className={btn}>
              Open link
            </a>
          )}
        </Row>
      );
    case "IMAGE":
      return (
        <div className="space-y-2 rounded-2xl bg-white p-3 ring-1 ring-stone-200">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-sage-600" />
            <p className="flex-1 font-medium text-stone-800">{r.title}</p>
            <a href={`${file}?download=1`} aria-label={`Download ${r.title}`} className="rounded-full p-2 text-stone-500 hover:bg-stone-100">
              <Download className="h-4 w-4" />
            </a>
          </div>
          {sub && <p className="text-sm text-stone-500">{sub}</p>}
          <a href={file} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file} alt={r.title} loading="lazy" className="max-h-80 w-auto rounded-xl" />
          </a>
        </div>
      );
    case "DOCUMENT":
      return (
        <Row icon={<FileType2 className="h-5 w-5" />} title={r.title} sub={sub || "Word document"}>
          <a href={file} className={btn}>
            Download
          </a>
        </Row>
      );
    default:
      return (
        <Row icon={<FileText className="h-5 w-5" />} title={r.title} sub={sub}>
          <a href={file} target="_blank" rel="noreferrer" className={btn}>
            Open
          </a>
          <a href={`${file}?download=1`} aria-label={`Download ${r.title}`} className="rounded-full p-2 text-stone-500 hover:bg-stone-100">
            <Download className="h-4 w-4" />
          </a>
        </Row>
      );
  }
}
