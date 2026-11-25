"use client";

import { useRef, useState } from "react";
import { Bold, CalendarCheck, Eye, Heading1, Heading2, Italic, Link2, List, MessageSquareQuote, Pencil, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichText } from "@/components/site/rich-text";

/**
 * The page text box with simple buttons (Heading, Point, Bold, Link…) so Rangika never has to type
 * the marks herself, and a "Preview" that shows the text exactly as the website will.
 * It still saves the same plain text the website reads (components/site/rich-text.tsx).
 */

const LINE_MARKS = ["### ", "## ", "- ", "> "];

const SAMPLE = `A short opening paragraph about this session: who it is for and how it helps.

## How it can help
- Stress and anxiety
- Better sleep
- **Confidence:** feeling calm and in control

## What to expect
### Session 1 — Getting to know you
We talk about what you'd like to change, then a gentle first hypnosis.

### Session 2 — Going deeper
Building on the first session.

> Ideal for: anyone ready to make a lasting change.

[[book]]`;

export function PageTextEditor({
  id,
  value,
  onChange,
  rows = 16,
  maxLength = 40000,
  bookButtons = true,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  maxLength?: number;
  /** Offer the "Booking buttons" button (session pages have them). */
  bookButtons?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [linkFor, setLinkFor] = useState<{ start: number; end: number; text: string } | null>(null);
  const [linkUrl, setLinkUrl] = useState("");

  /** Puts the new text in and selects `selStart..selEnd` afterwards. */
  const apply = (next: string, selStart: number, selEnd: number) => {
    onChange(next);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  };

  /** Heading / point / green box: put the mark at the start of each selected line (or take it off again). */
  const lineMark = (mark: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const from = value.lastIndexOf("\n", s - 1) + 1;
    let to = value.indexOf("\n", e > s && value[e - 1] === "\n" ? e - 1 : e);
    if (to === -1) to = value.length;
    const lines = value.slice(from, to).split("\n");
    const strip = (l: string) => {
      const t = l.replace(/^\s+/, "");
      const m = LINE_MARKS.find((x) => t.startsWith(x));
      return m ? t.slice(m.length) : t;
    };
    const all = lines.filter((l) => l.trim()).every((l) => l.replace(/^\s+/, "").startsWith(mark));
    const out = lines.map((l) => (!l.trim() ? l : all ? strip(l) : mark + strip(l))).join("\n");
    if (!value.slice(from, to).trim()) {
      // Nothing written on this line yet: add the mark with a placeholder to type over.
      const hint = mark === "- " ? "A point" : mark === "> " ? "Ideal for: …" : "Heading";
      const before = value.slice(0, from);
      const lead = before && !before.endsWith("\n\n") && mark !== "- " ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
      const next = before + lead + mark + hint + value.slice(to);
      const start = from + lead.length + mark.length;
      return apply(next, start, start + hint.length);
    }
    apply(value.slice(0, from) + out + value.slice(to), from, from + out.length);
  };

  /** Bold / italic: wrap the selected words (or add a placeholder to type over). */
  const wrap = (mark: string, hint: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e);
    if (sel.startsWith(mark) && sel.endsWith(mark) && sel.length > mark.length * 2) {
      const inner = sel.slice(mark.length, -mark.length);
      return apply(value.slice(0, s) + inner + value.slice(e), s, s + inner.length);
    }
    const text = sel || hint;
    apply(value.slice(0, s) + mark + text + mark + value.slice(e), s + mark.length, s + mark.length + text.length);
  };

  const startLink = () => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    setLinkFor({ start: s, end: e, text: value.slice(s, e) });
    setLinkUrl("");
  };
  const addLink = () => {
    if (!linkFor) return;
    let url = linkUrl.trim();
    if (!url) return;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) url = `mailto:${url}`;
    else if (/^\+?[\d\s()-]{6,}$/.test(url)) url = `tel:${url.replace(/[^\d+]/g, "")}`;
    else if (/^http:\/\//i.test(url)) url = url.replace(/^http:/i, "https:");
    else if (!/^(\/|https:\/\/|mailto:|tel:)/i.test(url)) url = url.includes(".") ? `https://${url}` : `/${url}`;
    const text = linkFor.text || "link text";
    const md = `[${text}](${url})`;
    const next = value.slice(0, linkFor.start) + md + value.slice(linkFor.end);
    setLinkFor(null);
    apply(next, linkFor.start + 1, linkFor.start + 1 + text.length);
  };

  const insertBlock = (block: string) => {
    const el = ref.current;
    const s = el ? el.selectionEnd : value.length;
    const before = value.slice(0, s).replace(/\s+$/, "");
    const after = value.slice(s).replace(/^\s+/, "");
    const next = (before ? before + "\n\n" : "") + block + (after ? "\n\n" + after : "");
    const pos = (before ? before.length + 2 : 0) + block.length;
    apply(next, pos, pos);
  };

  const tools: { label: string; title: string; icon: typeof Bold; run: () => void }[] = [
    { label: "Heading", title: "A section heading", icon: Heading1, run: () => lineMark("## ") },
    { label: "Sub-heading", title: "A smaller heading. Two or more in a row become tabs (or open/close questions if they end with ?)", icon: Heading2, run: () => lineMark("### ") },
    { label: "Points", title: "A list with ticks. Select several lines to make them all points", icon: List, run: () => lineMark("- ") },
    { label: "Bold", title: "Bold (Ctrl+B)", icon: Bold, run: () => wrap("**", "bold text") },
    { label: "Italic", title: "Italic (Ctrl+I)", icon: Italic, run: () => wrap("*", "italic text") },
    { label: "Link", title: "Make the selected words a link", icon: Link2, run: startLink },
    { label: "Green box", title: "A soft green box, e.g. \"Ideal for: …\"", icon: MessageSquareQuote, run: () => lineMark("> ") },
    ...(bookButtons ? [{ label: "Booking buttons", title: "The \"Book your session\" and \"Send us an enquiry\" buttons", icon: CalendarCheck, run: () => insertBlock("[[book]]") }] : []),
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-white">
      {/* Write / Preview */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-2 py-1.5">
        <div className="flex gap-1" role="tablist">
          {(
            [
              ["write", "Write", Pencil],
              ["preview", "Preview", Eye],
            ] as const
          ).map(([m, label, Icon]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition",
                mode === m ? "bg-white font-medium text-sage-800 shadow-sm ring-1 ring-stone-200" : "text-stone-600 hover:text-stone-800",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
            </button>
          ))}
        </div>
        {mode === "write" && !value.trim() && (
          <Button type="button" size="sm" variant="ghost" className="text-sage-700" onClick={() => apply(SAMPLE, 0, 0)}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Start from an example
          </Button>
        )}
      </div>

      {mode === "write" ? (
        <>
          <div className="flex flex-wrap gap-1 border-b border-stone-200 px-2 py-1.5">
            {tools.map((t) => (
              <button
                key={t.label}
                type="button"
                title={t.title}
                onMouseDown={(e) => e.preventDefault() /* keep the selection in the text box */}
                onClick={t.run}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-stone-700 transition hover:bg-sage-50 hover:text-sage-800"
              >
                <t.icon className="h-4 w-4 text-sage-600" aria-hidden /> {t.label}
              </button>
            ))}
          </div>
          {linkFor && (
            <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 bg-sage-50/60 px-3 py-2">
              <span className="text-sm text-stone-700">
                Link {linkFor.text ? <>for “<span className="font-medium">{linkFor.text.slice(0, 40)}</span>”</> : null} to:
              </span>
              <Input
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  } else if (e.key === "Escape") setLinkFor(null);
                }}
                placeholder="e.g. /contact or www.example.com"
                className="h-9 max-w-xs flex-1 bg-white"
              />
              <Button type="button" size="sm" className="bg-sage-600 hover:bg-sage-700" onClick={addLink} disabled={!linkUrl.trim()}>
                Add link
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setLinkFor(null)}>
                Cancel
              </Button>
            </div>
          )}
          <textarea
            suppressHydrationWarning
            ref={ref}
            id={id}
            rows={rows}
            maxLength={maxLength}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (!(e.ctrlKey || e.metaKey)) return;
              const k = e.key.toLowerCase();
              if (k === "b") {
                e.preventDefault();
                wrap("**", "bold text");
              } else if (k === "i") {
                e.preventDefault();
                wrap("*", "italic text");
              }
            }}
            placeholder="Write the page here. Select some words or lines, then use the buttons above to make a heading, points, bold text or a link."
            className="block w-full resize-y border-0 px-4 py-3 text-[15px] leading-relaxed text-stone-800 outline-none placeholder:text-stone-400 focus-visible:ring-0"
          />
          <p className="border-t border-stone-100 bg-stone-50/60 px-3 py-1.5 text-xs text-stone-500">
            Leave an empty line between paragraphs. Click <span className="font-medium">Preview</span> to see how it looks on the website.
          </p>
        </>
      ) : (
        <div className="max-h-[38rem] overflow-y-auto bg-brand-cream/40 px-5 py-5 sm:px-8" style={{ minHeight: `${rows * 1.6}rem` }}>
          {value.trim() ? (
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-8">
              <RichText
                text={value}
                cta={
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-sage-600 px-5 py-2.5 text-sm font-medium text-white">Book your session</span>
                    <span className="rounded-full px-5 py-2.5 text-sm font-medium text-sage-700 ring-1 ring-sage-300">Send us an enquiry</span>
                  </div>
                }
              />
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-stone-500">Nothing written yet. Switch to Write to add the page text.</p>
          )}
        </div>
      )}
    </div>
  );
}
