import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { PRACTITIONER_EMAIL, enquiryEmail, sendMail } from "@/lib/mail";
import { notifyAdmins } from "@/lib/notifications";

// Public contact forms on the website: "Book Your Free Consultation" and "Ask a question".
// Every message is saved (so Rangika sees it in the dashboard under Enquiries), then emailed to her.

const text = (max: number) => z.string().trim().max(max).optional().transform((v) => v || null);

const schema = z.discriminatedUnion("formType", [
  z.object({
    formType: z.literal("consultation"),
    firstName: z.string().trim().min(1, "Please enter your first name.").max(100),
    lastName: z.string().trim().min(1, "Please enter your last name.").max(100),
    email: z.string().trim().email("Please enter a valid email address.").max(200),
    phone: z.string().trim().min(5, "Please enter your phone number.").max(40),
    contactMethod: text(40),
    workOn: text(100),
    details: text(5000),
    website: z.string().optional(), // hidden field: real people leave it empty
  }),
  z.object({
    formType: z.literal("question"),
    name: z.string().trim().min(1, "Please enter your name.").max(150),
    email: z.string().trim().email("Please enter a valid email address.").max(200),
    subject: text(200),
    question: z.string().trim().min(1, "Please write your question.").max(5000),
    website: z.string().optional(),
  }),
]);

// A few messages per address in 10 minutes is plenty for a person; more is almost certainly spam.
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  times.push(now);
  recent.set(ip, times);
  if (recent.size > 5000) recent.clear();
  return times.length > 5;
}

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }, { status: 400 });
  }
  const d = parsed.data;
  // Bots fill in every field, including the hidden one. Pretend it worked.
  if (d.website) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });

  const data =
    d.formType === "consultation"
      ? {
          kind: "CONSULTATION" as const,
          name: `${d.firstName} ${d.lastName}`,
          email: d.email.toLowerCase(),
          phone: d.phone,
          contactMethod: d.contactMethod,
          topic: d.workOn,
          message: d.details,
        }
      : { kind: "QUESTION" as const, name: d.name, email: d.email.toLowerCase(), topic: d.subject, message: d.question };

  try {
    await db.enquiry.create({ data });
  } catch (e) {
    console.error("Could not save enquiry", e);
    return NextResponse.json({ error: "Sorry, your message couldn't be sent. Please try again or email us directly." }, { status: 500 });
  }

  await notifyAdmins({
    kind: "ENQUIRY",
    title: data.kind === "QUESTION" ? `New question from ${data.name}` : `Free consultation request: ${data.name}`,
    body: data.topic ?? (data.message ? (data.message.length > 90 ? `${data.message.slice(0, 87)}…` : data.message) : null),
    href: "/admin/enquiries",
  });

  // Saved already, so a failed email doesn't lose the message.
  const mail = await sendMail({ to: PRACTITIONER_EMAIL, replyTo: data.email, ...enquiryEmail(data) }).catch(() => ({ ok: false }));
  if (!mail.ok) console.error("Enquiry email to Rangika failed (the enquiry is saved in the dashboard).");

  return NextResponse.json({ ok: true });
}
