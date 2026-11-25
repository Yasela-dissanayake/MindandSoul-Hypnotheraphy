"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleHeart, Pencil, Reply, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBusyTransition } from "@/components/use-busy-transition";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRecorder, type Recording } from "@/components/portal/voice-recorder";
import { deleteJournalReply, saveJournalReply } from "@/app/admin/_actions/journal";
import { uploadFile } from "@/lib/upload-client";
import { formatDuration } from "@/lib/format";
import { friendlyError } from "@/lib/friendly-error";
import { UploadProgress } from "@/components/upload-progress";

export type JournalReplyData = {
  text: string | null;
  hasAudio: boolean;
  audioSeconds: number | null;
  repliedAt: string;
  seen: boolean;
};

/** Under each journal entry in the admin: Rangika's reply (typed and/or a voice message). */
export function JournalReply({ entryId, clientName, reply }: { entryId: string; clientName: string; reply: JournalReplyData | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(reply?.text ?? "");
  const [recording, setRecording] = useState<Recording | null>(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [pending, start] = useBusyTransition();

  const reset = () => {
    setOpen(false);
    setText(reply?.text ?? "");
    setRecording(null);
    setRemoveAudio(false);
  };

  const keepsOldAudio = Boolean(reply?.hasAudio && !removeAudio && !recording);
  const canSave = Boolean(text.trim() || recording || keepsOldAudio);

  const save = () =>
    start(async () => {
      try {
        let audio;
        if (recording) {
          setProgress(0);
          const ext = recording.type.includes("mp4") ? "m4a" : recording.type.includes("ogg") ? "ogg" : "webm";
          const up = await uploadFile(recording.blob, { purpose: "journal-reply", filename: `reply.${ext}`, onProgress: setProgress });
          audio = { key: up.key, type: up.contentType, seconds: recording.seconds };
        }
        const res = await saveJournalReply(entryId, { text: text.trim() || undefined, audio, removeAudio: removeAudio && !audio });
        if (!res.ok) return void toast.error(res.error);
        toast.success(res.data?.emailed ? `Reply sent. ${clientName} has been emailed.` : reply ? "Reply updated" : "Reply sent");
        setOpen(false);
        setRecording(null);
        setRemoveAudio(false);
        router.refresh();
      } catch (e) {
        toast.error(friendlyError(e, "Could not send the reply. Please try again."));
      } finally {
        setProgress(null);
      }
    });

  const remove = () => {
    if (!confirm(`Delete your reply? ${clientName} won't see it any more.`)) return;
    start(async () => {
      const res = await deleteJournalReply(entryId);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Reply deleted");
      setText("");
      router.refresh();
    });
  };

  if (!open) {
    if (!reply) {
      return (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2 border-sage-300 text-sage-800 hover:bg-sage-50">
          <Reply className="h-4 w-4" /> Reply to {clientName}
        </Button>
      );
    }
    return (
      <div className="space-y-2 rounded-xl bg-sage-50 p-3 ring-1 ring-sage-200">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-sage-800">
            <MessageCircleHeart className="h-4 w-4" /> Your reply
            <span className="font-normal text-stone-500">· {reply.seen ? `Seen by ${clientName}` : `Not seen yet`}</span>
          </p>
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} disabled={pending} className="h-7 gap-1 px-2 text-xs">
              <Pencil className="h-3 w-3" /> Edit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={pending} className="h-7 gap-1 px-2 text-xs text-red-700 hover:bg-red-50 hover:text-red-800">
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          </div>
        </div>
        {reply.hasAudio && <ReplyAudio entryId={entryId} seconds={reply.audioSeconds} version={reply.repliedAt} />}
        {reply.text && <p className="whitespace-pre-line text-sm text-stone-700">{reply.text}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl bg-sage-50/60 p-3 ring-1 ring-sage-200">
      <p className="flex items-center gap-1.5 text-xs font-medium text-sage-800">
        <MessageCircleHeart className="h-4 w-4" /> {reply ? "Edit your reply" : `Your reply to ${clientName}`}
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your thoughts on this entry…"
        className="min-h-[100px] bg-white text-sm"
        disabled={pending}
        autoFocus
      />
      {reply?.hasAudio && !removeAudio && !recording ? (
        <div className="space-y-1">
          <p className="text-xs text-stone-500">Your voice message:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ReplyAudio entryId={entryId} seconds={reply.audioSeconds} version={reply.repliedAt} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setRemoveAudio(true)} disabled={pending} aria-label="Remove voice message">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-xs text-stone-500">Or, record a voice message:</p>
          <VoiceRecorder value={recording} onChange={setRecording} disabled={pending} label="Record a voice reply" />
        </div>
      )}
      {progress !== null && <UploadProgress pct={progress} label="Uploading your voice reply…" />}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={save} disabled={pending || !canSave} className="bg-sage-600 hover:bg-sage-700">
          {pending ? "Sending…" : reply ? "Save reply" : "Send reply"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={reset} disabled={pending}>
          Cancel
        </Button>
      </div>
      {!reply && <p className="text-xs text-stone-500">{clientName} will see it under this entry and get an email.</p>}
    </div>
  );
}

function ReplyAudio({ entryId, seconds, version }: { entryId: string; seconds: number | null; version: string }) {
  return (
    <div className="flex items-center gap-2">
      <audio src={`/api/files/journal-reply/${entryId}?v=${encodeURIComponent(version)}`} controls preload="none" className="h-10 w-full" />
      {seconds ? <span className="text-xs text-stone-500">{formatDuration(seconds)}</span> : null}
    </div>
  );
}
