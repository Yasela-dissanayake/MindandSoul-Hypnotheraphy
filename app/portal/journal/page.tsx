import { requireClientPage } from "@/lib/authz";
import { db } from "@/lib/db";
import { getToday } from "@/lib/plans";
import { formatDate } from "@/lib/dates";
import { JournalComposer } from "@/components/portal/journal-composer";
import { JournalEntryCard } from "@/components/portal/journal-entry-card";
import { AskQuestion } from "@/components/portal/ask-question";

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export default async function JournalPage() {
  const user = await requireClientPage();
  const [{ prompt, hasPlans, upcoming }, entries] = await Promise.all([
    getToday(user.id, user.timezone),
    db.journalEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const now = Date.now();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-800">My journal</h1>
        <p className="mt-1 text-sm text-stone-500">Rangika reads your entries to support you. They're private to the two of you.</p>
      </div>

      {!prompt && upcoming.length > 0 && (
        <p className="rounded-xl bg-sage-50 p-3 text-sm text-stone-600">
          Rangika&apos;s journal prompts start on {formatDate(upcoming[0].startDate, { weekday: "long", day: "numeric", month: "long" })}. You can still write anything you like.
        </p>
      )}
      <JournalComposer prompt={prompt} />
      {hasPlans && (
        <AskQuestion
          topic={prompt ? `Journal prompt: ${prompt}` : "My journal"}
          topicHref="/portal/journal"
          label="A question about your journal? Ask Rangika"
          placeholder="e.g. Do I have to write it every day, or only when I feel the urge?"
        />
      )}

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-stone-800">Past entries</h2>
        {entries.length === 0 ? (
          <p className="text-stone-500">Your entries will appear here.</p>
        ) : (
          entries.map((e) => (
            <JournalEntryCard
              key={e.id}
              entry={{
                id: e.id,
                prompt: e.prompt,
                body: e.body,
                hasAudio: Boolean(e.audioKey),
                audioSeconds: e.audioSeconds,
                createdAt: e.createdAt.toISOString(),
                readAt: e.readAt?.toISOString() ?? null,
              }}
              timezone={user.timezone}
              editable={now - e.createdAt.getTime() < EDIT_WINDOW_MS}
            />
          ))
        )}
      </section>
    </div>
  );
}
