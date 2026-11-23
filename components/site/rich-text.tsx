import Link from "next/link";
import { CheckCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeeMore } from "@/components/site/see-more";
import { ContentTabs } from "@/components/site/content-tabs";

/**
 * The long page text of a service, written by Rangika in the admin with a few simple marks:
 *
 *   ## Heading            a section heading
 *   ### Smaller heading   e.g. "Option 1 — 5-Session Self-Paced Recorded Journey"
 *   - A point             a ticked list (a line "- **Title:** text" shows the title in bold)
 *   > A highlighted line  a soft green box, for a quote or "Ideal for: ..."
 *   **bold**  *italic*  [link text](/contact)
 *   [[book]]              the "Book your session" and "Send us an enquiry" buttons
 *
 * Two or more "### " headings in a row become tabs ("Session 1", "Session 2"... — the part before " — "
 * is the tab name), or open/close questions when every heading is a question.
 *
 * A blank line starts a new paragraph. Anything else is plain text, so a slip never breaks the page.
 */

type Block =
  | { kind: "h2" | "h3" | "p" | "quote"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "cta" };

export function parseRichText(src: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  const flush = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
    para = [];
    if (list) blocks.push({ kind: "list", items: list });
    list = null;
  };
  for (const raw of src.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (/^\[\[book\]\]$/i.test(line)) {
      flush();
      blocks.push({ kind: "cta" });
    } else if (line.startsWith("### ")) {
      flush();
      blocks.push({ kind: "h3", text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ kind: "h2", text: line.slice(3) });
    } else if (line.startsWith("> ")) {
      flush();
      blocks.push({ kind: "quote", text: line.slice(2) });
    } else if (/^[-•*]\s+/.test(line)) {
      if (para.length) {
        blocks.push({ kind: "p", text: para.join(" ") });
        para = [];
      }
      (list ??= []).push(line.replace(/^[-•*]\s+/, ""));
    } else {
      if (list) {
        blocks.push({ kind: "list", items: list });
        list = null;
      }
      para.push(line);
    }
  }
  flush();
  return blocks;
}

/** **bold**, *italic* and [links](/path) inside a line. Only site links and https links are made clickable. */
function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re =
    /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\(((?:\/|https:\/\/|mailto:|tel:)[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1])
      parts.push(
        <strong key={m.index} className="font-semibold text-stone-800">
          {m[1]}
        </strong>,
      );
    else if (m[2]) parts.push(<em key={m.index}>{m[2]}</em>);
    else
      parts.push(
        <Link
          key={m.index}
          href={m[4]}
          className="text-sage-700 underline underline-offset-2 hover:text-sage-800"
        >
          {m[3]}
        </Link>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

type Segment = { heading: Block | null; blocks: Block[] } | { cta: true };

/** Splits the page into its "## " sections (the text before the first one is the intro), with [[book]] on its own. */
function segments(blocks: Block[]): Segment[] {
  const out: Segment[] = [];
  let cur: { heading: Block | null; blocks: Block[] } = {
    heading: null,
    blocks: [],
  };
  const close = () => {
    if (cur.heading || cur.blocks.length) out.push(cur);
  };
  for (const b of blocks) {
    if (b.kind === "h2") {
      close();
      cur = { heading: b, blocks: [] };
    } else if (b.kind === "cta") {
      close();
      out.push({ cta: true });
      cur = { heading: null, blocks: [] };
    } else cur.blocks.push(b);
  }
  close();
  return out;
}

/**
 * `fold`: long sections show a preview with "See more" (the intro and the booking buttons are never folded).
 */
export function RichText({
  text,
  cta,
  className,
  fold = false,
}: {
  text: string;
  cta?: React.ReactNode;
  className?: string;
  fold?: boolean;
}) {
  const blocks = parseRichText(text);
  if (!fold)
    return (
      <div className={cn("space-y-4 text-stone-700", className)}>
        {renderBlocks(blocks, cta)}
      </div>
    );
  return (
    <div className={cn("space-y-6 text-stone-700", className)}>
      {segments(blocks).map((seg, i) => {
        if ("cta" in seg) return cta ? <div key={i}>{cta}</div> : null;
        const body = (
          <div className="space-y-4">
            {renderBlocks(seg.blocks, cta)}
          </div>
        );
        // The intro (no heading) always shows in full, and so does a section with tabs (they keep it short).
        if (!seg.heading) return <div key={i}>{body}</div>;
        const tabbed = subsections(seg.blocks).some((g) => "subs" in g);
        return (
          <section key={i} className="space-y-4">
            {renderBlock(seg.heading, -1, cta)}
            {seg.blocks.length > 0 && (tabbed ? body : <SeeMore collapsedHeight={280}>{body}</SeeMore>)}
          </section>
        );
      })}
    </div>
  );
}

type Sub = { heading: string; blocks: Block[] };
type Group = { block: Block } | { subs: Sub[] };

/** Finds runs of two or more "### " sub-sections (each heading with the blocks under it, up to the next heading). */
function subsections(blocks: Block[]): Group[] {
  const out: Group[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.kind !== "h3") {
      out.push({ block: b });
      i++;
      continue;
    }
    const subs: Sub[] = [];
    while (i < blocks.length && blocks[i].kind === "h3") {
      const sub: Sub = { heading: (blocks[i] as { text: string }).text, blocks: [] };
      i++;
      while (i < blocks.length && !["h2", "h3", "cta"].includes(blocks[i].kind)) sub.blocks.push(blocks[i++]);
      subs.push(sub);
    }
    if (subs.length >= 2) out.push({ subs });
    else for (const s of subs) out.push({ block: { kind: "h3", text: s.heading } }, ...s.blocks.map((block) => ({ block })));
  }
  return out;
}

/** "Session 1 — Understanding Your Stress" → tab "Session 1", panel heading "Understanding Your Stress". */
/** "2. Creating a Peaceful Space" → tab "Step 2", panel heading "Creating a Peaceful Space". */
function splitHeading(h: string): { label: string; title: string | null } {
  const step = h.match(/^(\d{1,2})\.\s+(.+)$/);
  if (step) return { label: `Step ${step[1]}`, title: step[2] };
  const m = h.match(/^(.{1,14}?)\s+[—–-]\s+(.+)$/);
  return m ? { label: m[1], title: m[2] } : { label: h, title: null };
}

function renderBlocks(blocks: Block[], cta: React.ReactNode) {
  return subsections(blocks).map((g, i) => {
    if ("block" in g) return renderBlock(g.block, i, cta);
    const inner = (s: Sub) => s.blocks.map((b, j) => renderBlock(b, j, cta));
    // Questions (e.g. a FAQ) open and close one by one; anything else becomes tabs.
    if (g.subs.every((s) => s.heading.trim().endsWith("?")))
      return (
        <div key={i} className="divide-y divide-stone-200 rounded-2xl bg-white ring-1 ring-stone-200">
          {g.subs.map((s, j) => (
            <details key={j} className="group px-5 py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 font-medium text-stone-800 [&::-webkit-details-marker]:hidden">
                <Inline text={s.heading} />
                <ChevronDown className="h-4 w-4 shrink-0 text-stone-500 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="space-y-3 pb-4">{inner(s)}</div>
            </details>
          ))}
        </div>
      );
    return (
      <ContentTabs
        key={i}
        tabs={g.subs.map((s) => {
          const { label, title } = splitHeading(s.heading);
          return {
            label,
            panel: (
              <>
                <h3 className="font-serif text-xl text-sage-800">
                  <Inline text={title ?? s.heading} />
                </h3>
                {inner(s)}
              </>
            ),
          };
        })}
      />
    );
  });
}

function renderBlock(b: Block, i: number, cta: React.ReactNode) {
  switch (b.kind) {
    case "h2":
      return (
        <h2
          key={i}
          className="pt-4 font-serif text-2xl text-stone-800 first:pt-0 md:text-3xl"
        >
          <Inline text={b.text} />
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="pt-2 font-serif text-xl text-sage-800">
          <Inline text={b.text} />
        </h3>
      );
    case "quote":
      return (
        <p
          key={i}
          className="rounded-xl bg-sage-50 px-4 py-3 text-sm leading-relaxed text-sage-900 ring-1 ring-sage-200"
        >
          <Inline text={b.text} />
        </p>
      );
    case "list":
      return (
        <ul key={i} className="space-y-2">
          {b.items.map((item, j) => (
            <li key={j} className="flex gap-2.5 leading-relaxed">
              <CheckCircle
                className="mt-1 h-4 w-4 shrink-0 text-sage-600"
                aria-hidden
              />
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "cta":
      return cta ? <div key={i}>{cta}</div> : null;
    default:
      return (
        <p key={i} className="leading-relaxed">
          <Inline text={b.text} />
        </p>
      );
  }
}
