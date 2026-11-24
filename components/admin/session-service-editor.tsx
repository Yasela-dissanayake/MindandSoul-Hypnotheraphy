"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createSessionService,
  deleteSessionOption,
  deleteSessionService,
  moveSessionOption,
  moveSessionService,
  saveSessionOption,
  updateSessionService,
} from "@/app/admin/_actions/session-services";
import { areaHref, areaOf, serviceEditHref } from "@/lib/session-areas";
import { useAction } from "./use-action";
import { ConfirmButton } from "./confirm-button";

const selectCls = "h-10 w-full rounded-md border border-input bg-white px-3 text-sm";

export type EditorService = {
  id: string;
  slug: string;
  title: string;
  category: "HYPNOTHERAPY" | "REIKI_HEALING" | "ANIMAL_REIKI";
  tagline: string;
  summary: string;
  body: string;
  details: string;
  highlights: string;
  planService: "HYPNOTHERAPY" | "REIKI_HEALING" | "ANIMAL_REIKI";
  minutes: number | null;
  lengthLabel: string;
  inPerson: boolean;
  online: boolean;
  enquiryOnly: boolean;
  published: boolean;
  clients: number; // clients who bought it (shown in the delete warning)
};
export type EditorOption = {
  id: string;
  title: string;
  sessions: number;
  price: number;
  priceAed: number | null;
  mode: "IN_PERSON" | "DISTANCE" | null;
  note: string;
  recorded: boolean;
};

const TAB_PATH = { HYPNOTHERAPY: "/hypnotherapy", REIKI_HEALING: "/reiki-healing", ANIMAL_REIKI: "/reiki-healing" } as const;

/** The marks the page text understands (components/site/rich-text.tsx). */
function PageTextHelp() {
  return (
    <details className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600 ring-1 ring-stone-200">
      <summary className="cursor-pointer font-medium text-stone-700">How to format the page text</summary>
      <ul className="mt-2 space-y-1 font-mono">
        <li>## Areas of focus include: <span className="font-sans text-stone-500">→ a heading</span></li>
        <li>### Option 1 — 1-Session … <span className="font-sans text-stone-500">→ a smaller heading; two or more in a row become tabs (“Option 1”, “Session 2”…), or open/close questions if they end with ?</span></li>
        <li>- Stress management and relaxation. <span className="font-sans text-stone-500">→ a ticked point</span></li>
        <li>- **Guided Hypnotherapy:** Experience … <span className="font-sans text-stone-500">→ a point with a bold title</span></li>
        <li>&gt; Ideal for: … <span className="font-sans text-stone-500">→ a soft green box</span></li>
        <li>**bold**  *italic*  [link text](/contact)</li>
        <li>[[book]] <span className="font-sans text-stone-500">→ the &quot;Book your session&quot; and &quot;Send us an enquiry&quot; buttons</span></li>
      </ul>
      <p className="mt-2">Leave an empty line between paragraphs.</p>
    </details>
  );
}

const CATEGORY_LABEL: Record<EditorService["category"], string> = {
  HYPNOTHERAPY: "Clinical Hypnotherapy",
  REIKI_HEALING: "Reiki Energy Healing",
  ANIMAL_REIKI: "Animal Reiki & Communication",
};

/** "New session" for one area: the website tab can be chosen when the area has more than one (Reiki / Animal Reiki). */
export function NewSessionServiceButton({ categories }: { categories: EditorService["category"][] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EditorService["category"]>(categories[0]);
  const { pending, run } = useAction();
  const router = useRouter();
  if (!open)
    return (
      <Button onClick={() => setOpen(true)} className="bg-sage-600 hover:bg-sage-700">
        <Plus className="mr-2 h-4 w-4" /> New session
      </Button>
    );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input autoFocus placeholder="e.g. Inner Child Healing" value={title} onChange={(e) => setTitle(e.target.value)} className="w-64" />
      {categories.length > 1 && (
        <select suppressHydrationWarning className={`${selectCls} w-56`} value={category} onChange={(e) => setCategory(e.target.value as EditorService["category"])} aria-label="Website tab">
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      )}
      <Button
        disabled={pending || !title.trim()}
        className="bg-sage-600 hover:bg-sage-700"
        onClick={() =>
          run(() => createSessionService({ title, category }), "Created. Add its details and prices.", (r) => r.ok && router.push(serviceEditHref((r as { data?: { id: string } }).data?.id ?? "", category)))
        }
      >
        Create
      </Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}

export function MoveServiceButtons({ id, first, last }: { id: string; first: boolean; last: boolean }) {
  const { pending, run } = useAction();
  return (
    <span className="inline-flex">
      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || first} onClick={() => run(() => moveSessionService(id, -1))} aria-label="Move up">
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || last} onClick={() => run(() => moveSessionService(id, 1))} aria-label="Move down">
        <ArrowDown className="h-4 w-4" />
      </Button>
    </span>
  );
}

/** Deletes a service after an "Are you sure?" that says what happens to clients who already bought it. */
export function DeleteServiceButton({ id, title, clients, icon, onDeleted }: { id: string; title: string; clients: number; icon?: boolean; onDeleted?: () => void }) {
  const { run } = useAction();
  const description =
    clients > 0
      ? `It disappears from the website and its prices are removed. ${clients} client${clients === 1 ? " has" : "s have"} bought it: they keep their plan, past bookings and payments, but can't book any remaining sessions of it online. This can't be undone. To only take it off the website, use "Hide from the website" instead.`
      : "It disappears from the website and its prices are removed. This can't be undone.";
  return (
    <ConfirmButton
      icon={icon}
      label={icon ? `Delete ${title}` : "Delete"}
      title={`Delete "${title}"?`}
      description={description}
      onConfirm={() => run(() => deleteSessionService(id), "Deleted", (r) => r.ok && onDeleted?.())}
    />
  );
}

/** Name, text, length, in person / online and whether it's on the website. */
export function SessionServiceForm({ service }: { service: EditorService }) {
  const [f, setF] = useState({ ...service, minutes: service.minutes === null ? "" : String(service.minutes) });
  const { pending, run } = useAction();
  const router = useRouter();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const tick = (k: "inPerson" | "online" | "enquiryOnly" | "published") => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.checked });
  const save = (published = f.published) =>
    run(
      () =>
        updateSessionService(service.id, {
          title: f.title,
          category: f.category,
          tagline: f.tagline,
          summary: f.summary,
          body: f.body,
          details: f.details,
          highlights: f.highlights,
          planService: f.planService,
          minutes: f.minutes.trim() === "" ? null : Math.round(Number(f.minutes)),
          lengthLabel: f.lengthLabel,
          inPerson: f.inPerson,
          online: f.online,
          enquiryOnly: f.enquiryOnly,
          published,
        }),
      published && !service.published ? "Saved and shown on the website" : !published && service.published ? "Hidden from the website" : "Saved",
      (r) => r.ok && setF((x) => ({ ...x, published })),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-stone-800">Details</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${f.published ? "bg-sage-100 text-sage-800" : "bg-amber-100 text-amber-900"}`}>
          {f.published ? "On the website" : "Hidden"}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
        <div className="space-y-1.5">
          <Label htmlFor="ss-title">Name</Label>
          <Input id="ss-title" maxLength={150} value={f.title} onChange={set("title")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ss-category">Website tab</Label>
          <select suppressHydrationWarning id="ss-category" className={selectCls} value={f.category} onChange={set("category")}>
            <option value="HYPNOTHERAPY">Clinical Hypnotherapy</option>
            <option value="REIKI_HEALING">Reiki Energy Healing</option>
            <option value="ANIMAL_REIKI">Reiki Energy Healing · Animal</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ss-tagline">Tagline</Label>
        <Input id="ss-tagline" maxLength={200} placeholder="e.g. Break Free from Smoking. Build a Healthier Future." value={f.tagline} onChange={set("tagline")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ss-summary">Short summary</Label>
        <Input id="ss-summary" maxLength={300} placeholder="One or two lines on the tab page's card" value={f.summary} onChange={set("summary")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ss-body">Page text</Label>
        <Textarea id="ss-body" rows={22} maxLength={40000} className="font-mono text-[13px] leading-relaxed" value={f.body} onChange={set("body")} />
        <PageTextHelp />
      </div>
      <details className="space-y-3 rounded-lg px-3 py-2 ring-1 ring-stone-200">
        <summary className="cursor-pointer text-sm font-medium text-stone-700">Older fields (only shown when the page text is empty)</summary>
        <div className="mt-3 space-y-1.5">
          <Label htmlFor="ss-details">About this session</Label>
          <Textarea id="ss-details" rows={6} maxLength={10000} value={f.details} onChange={set("details")} />
        </div>
        <div className="mt-3 space-y-1.5">
          <Label htmlFor="ss-highlights">How it can help / areas of support</Label>
          <Textarea id="ss-highlights" rows={5} maxLength={5000} placeholder={"One point per line"} value={f.highlights} onChange={set("highlights")} />
        </div>
      </details>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="ss-minutes">Booking length (minutes)</Label>
          <Input id="ss-minutes" type="number" min={15} max={480} step={5} placeholder="Calendar default" value={f.minutes} onChange={set("minutes")} />
          <p className="text-xs text-stone-500">How long it blocks in your calendar. Empty = your normal length.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ss-length">Length shown on the website</Label>
          <Input id="ss-length" maxLength={60} placeholder="e.g. 1 hour (empty = not shown)" value={f.lengthLabel} onChange={set("lengthLabel")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ss-plan">Client plan type</Label>
          <select suppressHydrationWarning id="ss-plan" className={selectCls} value={f.planService} onChange={set("planService")}>
            <option value="HYPNOTHERAPY">Hypnotherapy</option>
            <option value="REIKI_HEALING">Reiki / energy healing</option>
            <option value="ANIMAL_REIKI">Animal Reiki</option>
          </select>
          <p className="text-xs text-stone-500">Where these clients appear on your Sessions page.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-700">
        <label className="flex items-center gap-2">
          <input suppressHydrationWarning type="checkbox" checked={f.inPerson} onChange={tick("inPerson")} /> In person (Perth)
        </label>
        <label className="flex items-center gap-2">
          <input suppressHydrationWarning type="checkbox" checked={f.online} onChange={tick("online")} /> Online / distance
        </label>
        <label className="flex items-center gap-2">
          <input suppressHydrationWarning type="checkbox" checked={f.enquiryOnly} onChange={tick("enquiryOnly")} /> Enquiry only (no online booking)
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={pending} onClick={() => save()} className="bg-sage-600 hover:bg-sage-700">
          {pending ? "Saving…" : "Save"}
        </Button>
        {f.published ? (
          <Button variant="outline" disabled={pending} onClick={() => save(false)}>
            Hide from the website
          </Button>
        ) : (
          <Button variant="outline" disabled={pending} onClick={() => save(true)}>
            Show on the website
          </Button>
        )}
        {f.published && (
          <Button variant="ghost" asChild>
            <a href={`${TAB_PATH[f.category]}/${service.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> View on website
            </a>
          </Button>
        )}
        <DeleteServiceButton id={service.id} title={service.title} clients={service.clients} onDeleted={() => router.push(`${areaHref(areaOf(service.category))}#services`)} />
      </div>
    </div>
  );
}

function OptionForm({ serviceId, option, onDone }: { serviceId: string; option: EditorOption | null; onDone: () => void }) {
  const [f, setF] = useState({
    title: option?.title ?? "",
    sessions: String(option?.sessions ?? 1),
    price: option ? String(option.price / 100) : "",
    priceAed: option?.priceAed ? String(option.priceAed / 100) : "",
    mode: option?.mode ?? "",
    note: option?.note ?? "",
    recorded: false, // the recorded-course option is no longer offered
  });
  const { pending, run } = useAction();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-3 rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200">
      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input maxLength={80} placeholder='e.g. "5-session package"' value={f.title} onChange={set("title")} />
        </div>
        <div className="space-y-1">
          <Label>Sessions</Label>
          <Input type="number" min={1} max={50} value={f.sessions} onChange={set("sessions")} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label>Price (AUD)</Label>
          <Input type="number" min={0} step={0.01} value={f.price} onChange={set("price")} />
        </div>
        <div className="space-y-1">
          <Label>Price (AED)</Label>
          <Input type="number" min={0} step={0.01} placeholder="Empty = AUD" value={f.priceAed} onChange={set("priceAed")} />
        </div>
        <div className="space-y-1">
          <Label>For</Label>
          <select suppressHydrationWarning className={selectCls} value={f.mode} onChange={set("mode")}>
            <option value="">In person and online</option>
            <option value="IN_PERSON">In person only</option>
            <option value="DISTANCE">Online / distance only</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Note (optional)</Label>
        <Input maxLength={200} placeholder="e.g. Recommended for IBS · completed within 6 weeks" value={f.note} onChange={set("note")} />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={pending}
          className="bg-sage-600 hover:bg-sage-700"
          onClick={() =>
            run(
              () =>
                saveSessionOption(serviceId, option?.id ?? null, {
                  title: f.title,
                  sessions: Math.round(Number(f.sessions || 1)),
                  price: Number(f.price || 0),
                  priceAed: f.priceAed.trim() === "" ? null : Number(f.priceAed),
                  mode: f.mode === "" ? null : (f.mode as "IN_PERSON" | "DISTANCE"),
                  note: f.note,
                  recorded: f.recorded,
                }),
              "Price saved",
              (r) => r.ok && onDone(),
            )
          }
        >
          Save price
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

const fmt = (cents: number, cur: string) => `${cur} ${(cents / 100).toLocaleString("en-AU", { maximumFractionDigits: 2 })}`;

/** Single session and packages, each with an AUD and (optional) AED price. */
export function SessionOptionsEditor({ serviceId, options }: { serviceId: string; options: EditorOption[] }) {
  const [editing, setEditing] = useState<string | null>(null); // option id, "new", or null
  const { pending, run } = useAction();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl text-stone-800">Prices and packages</h2>
          <p className="text-sm text-stone-500">Visitors in the UAE see the AED price; everyone else sees AUD. A package&apos;s other sessions are booked by the client from their private space.</p>
        </div>
        {editing !== "new" && (
          <Button variant="outline" onClick={() => setEditing("new")}>
            <Plus className="mr-2 h-4 w-4" /> Add price
          </Button>
        )}
      </div>
      {editing === "new" && <OptionForm serviceId={serviceId} option={null} onDone={() => setEditing(null)} />}
      {options.length === 0 && editing !== "new" && <p className="text-sm text-stone-500">No prices yet.</p>}
      <ul className="space-y-2">
        {options.map((o, i) =>
          editing === o.id ? (
            <li key={o.id}>
              <OptionForm serviceId={serviceId} option={o} onDone={() => setEditing(null)} />
            </li>
          ) : (
            <li key={o.id} className="flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 ring-1 ring-stone-200">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-800">
                  {o.title}{" "}
                  <span className="text-sm font-normal text-stone-500">
                    · {o.sessions} session{o.sessions === 1 ? "" : "s"}
                    {o.mode ? ` · ${o.mode === "IN_PERSON" ? "in person only" : "online only"}` : ""}
                  </span>
                </p>
                <p className="text-sm text-stone-600">
                  {fmt(o.price, "AUD")}
                  {o.priceAed ? ` / ${fmt(o.priceAed, "AED")}` : " (no AED price)"}
                </p>
                {o.note && <p className="text-xs text-stone-500">{o.note}</p>}
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === 0} onClick={() => run(() => moveSessionOption(o.id, -1))} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === options.length - 1} onClick={() => run(() => moveSessionOption(o.id, 1))} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(o.id)} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <ConfirmButton
                icon
                title={`Remove "${o.title}"?`}
                description="It disappears from the website. Bookings already made are not affected."
                onConfirm={() => run(() => deleteSessionOption(o.id), "Removed")}
              />
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

