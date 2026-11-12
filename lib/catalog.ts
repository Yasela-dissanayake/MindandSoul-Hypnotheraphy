// Names shown in the app for services, file types and tracker fields.

export type ServiceId = "REIKI_HEALING" | "ANIMAL_REIKI" | "HYPNOTHERAPY";

export const SERVICES: { id: ServiceId; label: string; short: string }[] = [
  { id: "HYPNOTHERAPY", label: "Clinical Hypnotherapy", short: "Hypnotherapy" },
  { id: "REIKI_HEALING", label: "Reiki Healing", short: "Reiki" },
  { id: "ANIMAL_REIKI", label: "Animal Reiki", short: "Animal Reiki" },
];

export const serviceLabel = (s: string | null | undefined) => SERVICES.find((x) => x.id === s)?.label ?? "Sessions";

export type KindId = "AUDIO" | "PDF" | "DOCUMENT" | "IMAGE" | "VIDEO" | "LINK";

export const KIND_LABEL: Record<KindId, string> = {
  AUDIO: "Recording",
  PDF: "PDF",
  DOCUMENT: "Word document",
  IMAGE: "Image",
  VIDEO: "YouTube video",
  LINK: "Link",
};

/** File type → library kind (null = not allowed). */
export function kindForFile(contentType: string, filename: string): Exclude<KindId, "VIDEO" | "LINK"> | null {
  const t = contentType.toLowerCase();
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (t === "application/pdf" || ext === "pdf") return "PDF";
  if (t.startsWith("audio/") || ["mp3", "m4a", "wav", "aac", "ogg", "webm"].includes(ext)) return "AUDIO";
  if (t.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "heic"].includes(ext)) return "IMAGE";
  if (
    t === "application/msword" ||
    t === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ["doc", "docx"].includes(ext)
  )
    return "DOCUMENT";
  return null;
}

export const ACCEPT_FILES = "audio/*,.mp3,.m4a,.pdf,application/pdf,.doc,.docx,image/*,.jpg,.jpeg,.png";

/** Tracker form fields */
export const TRACKER_FIELD_TYPES = ["number", "scale", "yesno", "time", "text"] as const;
export type TrackerFieldType = (typeof TRACKER_FIELD_TYPES)[number];
export type TrackerField = { id: string; label: string; type: TrackerFieldType; unit?: string };

export const FIELD_TYPE_LABEL: Record<TrackerFieldType, string> = {
  number: "Number (e.g. weight)",
  scale: "Scale 0–10 (e.g. urge level)",
  yesno: "Yes / No",
  time: "Time of day (e.g. when the urge came)",
  text: "Short text",
};

/** "20:30" → "8:30 pm" */
export function formatTimeOfDay(v: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v);
  if (!m) return v;
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "am" : "pm"}`;
}

export function parseTrackerFields(json: unknown): TrackerField[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((f): f is TrackerField => typeof f === "object" && f !== null && typeof (f as TrackerField).id === "string" && typeof (f as TrackerField).label === "string")
    .map((f) => ({ id: f.id, label: f.label, type: ((TRACKER_FIELD_TYPES as readonly string[]).includes(f.type) ? f.type : "text") as TrackerFieldType, unit: f.unit || undefined }));
}

/** Ready-made tracker examples Rangika can start from. */
export const TRACKER_EXAMPLES: { title: string; fields: Omit<TrackerField, "id">[] }[] = [
  {
    title: "Weight & measurements",
    fields: [
      { label: "Weight", type: "number", unit: "kg" },
      { label: "Waist", type: "number", unit: "cm" },
      { label: "Hips", type: "number", unit: "cm" },
      { label: "How did eating go today?", type: "text" },
    ],
  },
  {
    title: "Daily check-in (addiction)",
    fields: [
      { label: "How did you feel today?", type: "text" },
      { label: "How easy was it to handle the day?", type: "scale" },
      { label: "What time did you first feel the urge to drink or smoke?", type: "time" },
      { label: "Did you give in to the urge?", type: "yesno" },
    ],
  },
  {
    title: "Urge tracker",
    fields: [
      { label: "Strongest urge today", type: "scale" },
      { label: "Did you give in to the urge?", type: "yesno" },
      { label: "What triggered it?", type: "text" },
    ],
  },
  {
    title: "Sleep tracker",
    fields: [
      { label: "Hours slept", type: "number", unit: "hours" },
      { label: "Sleep quality", type: "scale" },
      { label: "Listened to the audio?", type: "yesno" },
    ],
  },
  {
    title: "Mood check-in",
    fields: [
      { label: "Mood", type: "scale" },
      { label: "Anxiety", type: "scale" },
      { label: "Anything to share?", type: "text" },
    ],
  },
];
