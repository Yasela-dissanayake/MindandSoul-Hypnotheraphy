import { Resend } from "resend";
import { createHmac } from "crypto";
import { sendViaSmtp, smtpConfigured } from "@/lib/email";

// Transactional email through Resend, with Gmail (SMTP) as a backup.
// With neither set up (local development) emails are printed to the console.

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
export const EMAIL_FROM = process.env.EMAIL_FROM || "Mind & Soul Works <onboarding@resend.dev>";
export const PRACTITIONER_EMAIL = process.env.PRACTITIONER_EMAIL || "healwithrangika@gmail.com";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function paragraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** Shared calm, green email layout. `body` is trusted HTML built by the templates below. */
function layout(body: string, footer = "") {
  return `<!doctype html><html><body style="margin:0;background:#f6f7f6;font-family:Georgia,'Times New Roman',serif;color:#292524">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f6;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#485a48;color:#ffffff;padding:20px 28px;font-size:20px">Mind &amp; Soul Works</td></tr>
<tr><td style="padding:28px;font-size:16px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#f6f7f6;font-size:12px;color:#78716c;font-family:Arial,sans-serif">${footer || "Mind &amp; Soul Works · Hypnotherapy &amp; Reiki"}</td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0"><a href="${href}" style="background:#485a48;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-family:Arial,sans-serif;display:inline-block">${escapeHtml(label)}</a></p>`;
}

/**
 * Sends an email: through Resend first, then through Gmail (SMTP) if Resend isn't set up or refuses it
 * (e.g. Resend's test mode, which only delivers to the account owner until a domain is verified).
 * Fixing either one is enough for emails to arrive.
 */
export async function sendMail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  let resendError: string | null = null;
  if (resend) {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
    });
    if (!error) return { ok: true as const };
    resendError = error.message;
    if (!smtpConfigured) {
      console.error("Email failed:", opts.subject, error);
      return { ok: false as const, error: error.message };
    }
  }

  if (smtpConfigured) {
    try {
      await sendViaSmtp({ ...opts, fromName: fromName(EMAIL_FROM) });
      if (resendError) console.warn(`Email sent through Gmail instead (Resend: ${resendError.slice(0, 120)})`);
      return { ok: true as const };
    } catch (e) {
      const smtpError = e instanceof Error ? e.message : String(e);
      console.error("Email failed:", opts.subject, { resend: resendError ?? "not set up", smtp: smtpError.slice(0, 200) });
      return { ok: false as const, error: smtpError };
    }
  }

  // Neither is set up (local development): show the email in the terminal instead.
  console.log(`\n📧 [email not sent: no RESEND_API_KEY or SMTP settings]\nTo: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}\n`);
  return { ok: true as const };
}

/** "Mind & Soul Works <x@y>" → "Mind & Soul Works" (display name for Gmail sending). */
function fromName(from: string) {
  return from.match(/^\s*"?([^"<]+?)"?\s*</)?.[1];
}

// ---------------------------------------------------------------------------
// Unsubscribe links (signed, no login needed)
// ---------------------------------------------------------------------------

export function unsubscribeToken(userId: string) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "dev").update(`unsub:${userId}`).digest("hex").slice(0, 32);
}

export function unsubscribeUrl(userId: string) {
  return `${SITE_URL}/api/unsubscribe?u=${userId}&t=${unsubscribeToken(userId)}`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------


/** Login details for an account the admin created (or reset). */
export function loginDetailsEmail(opts: {
  name?: string | null;
  username: string;
  password: string;
  customText?: string | null;
}) {
  const hello = `Hello${opts.name ? ` ${opts.name}` : ""},`;
  const intro =
    opts.customText?.trim() ||
    `Your private space at Mind & Soul Works is ready. There you'll find your sessions work, class material and journal, all in one calm place.`;
  const url = `${SITE_URL}/login`;
  const details = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f6f7f6;border-radius:8px;font-family:Arial,sans-serif;font-size:15px">
<tr><td style="padding:12px 16px 4px;color:#78716c">Username</td><td style="padding:12px 16px 4px"><strong>${escapeHtml(opts.username)}</strong></td></tr>
<tr><td style="padding:4px 16px 12px;color:#78716c">Password</td><td style="padding:4px 16px 12px"><strong>${escapeHtml(opts.password)}</strong></td></tr></table>`;
  return {
    subject: "Your login details for Mind & Soul Works",
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p>${paragraphs(intro)}${details}${button(url, "Sign in")}<p style="margin:0;color:#78716c;font-size:14px">You can change your password after signing in, under Profile.</p>`,
    ),
    text: `${hello}

${intro}

Username: ${opts.username}
Password: ${opts.password}

Sign in: ${url}
You can change your password after signing in, under Profile.`,
  };
}

export function welcomeEmail(opts: { name?: string | null }) {
  const hello = `Welcome${opts.name ? `, ${opts.name}` : ""}!`;
  const url = `${SITE_URL}/portal`;
  const body = `You're all set. Your private page shows your sessions work and class material. Tick tasks off as you go, and use your journal whenever you like.`;
  return {
    subject: "Welcome to Mind & Soul Works",
    html: layout(`<p style="margin:0 0 16px">${escapeHtml(hello)}</p>${paragraphs(body)}${button(url, "Open my page")}`),
    text: `${hello}\n\n${body}\n\n${url}`,
  };
}

export function taskDoneEmail(opts: { clientName: string; taskTitle: string; when: string; clientId: string }) {
  const url = `${SITE_URL}/admin/clients/${opts.clientId}?tab=progress`;
  return {
    subject: `✓ ${opts.clientName} completed "${opts.taskTitle}"`,
    html: layout(
      `<p style="margin:0 0 16px"><strong>${escapeHtml(opts.clientName)}</strong> completed <strong>${escapeHtml(opts.taskTitle)}</strong> (${escapeHtml(opts.when)}).</p>${button(url, "View progress")}`,
    ),
    text: `${opts.clientName} completed "${opts.taskTitle}" (${opts.when}).\n${url}`,
  };
}

function quote(text: string) {
  return `<div style="margin:0 0 16px;padding:12px 16px;background:#f6f7f6;border-left:3px solid #8aa58a;border-radius:4px">${escapeHtml(text).replace(/\n/g, "<br>")}</div>`;
}

/** To Rangika: a client typed a question. */
export function questionEmail(opts: { clientName: string; topic?: string | null; body: string }) {
  const url = `${SITE_URL}/admin/sessions#questions`;
  const about = opts.topic ? ` about <strong>${escapeHtml(opts.topic)}</strong>` : "";
  return {
    subject: `❓ ${opts.clientName} asked a question${opts.topic ? `: ${opts.topic}` : ""}`,
    html: layout(`<p style="margin:0 0 16px"><strong>${escapeHtml(opts.clientName)}</strong> asked a question${about}:</p>${quote(opts.body)}${button(url, "Answer it")}`),
    text: `${opts.clientName} asked a question${opts.topic ? ` about ${opts.topic}` : ""}:\n\n${opts.body}\n\nAnswer it: ${url}`,
  };
}

/** To the client: Rangika answered their question. */
export function answerEmail(opts: { name?: string | null; topic?: string | null; question: string; answer: string }) {
  const hello = `Hello${opts.name ? ` ${opts.name}` : ""},`;
  const url = `${SITE_URL}/portal/sessions#questions`;
  return {
    subject: "Rangika answered your question",
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p><p style="margin:0 0 8px;color:#78716c">You asked${opts.topic ? ` about ${escapeHtml(opts.topic)}` : ""}:</p>${quote(opts.question)}<p style="margin:0 0 8px;color:#78716c">Rangika's answer:</p>${quote(opts.answer)}${button(url, "Open my page")}`,
    ),
    text: `${hello}\n\nYou asked${opts.topic ? ` about ${opts.topic}` : ""}:\n${opts.question}\n\nRangika's answer:\n${opts.answer}\n\n${url}`,
  };
}

/** To the client: Rangika replied to one of their journal entries. */
export function journalReplyEmail(opts: { name?: string | null; reply?: string | null; voice: boolean }) {
  const hello = `Hello${opts.name ? ` ${opts.name}` : ""},`;
  const url = `${SITE_URL}/portal/journal`;
  const what = opts.voice && !opts.reply ? "sent you a voice reply to your journal entry" : "replied to your journal entry";
  const voiceNote = opts.voice && opts.reply ? "There's a voice message with it too." : opts.voice ? "Open your journal to listen to it." : "";
  return {
    subject: "Rangika replied to your journal",
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p><p style="margin:0 0 16px">Rangika ${what}.</p>${opts.reply ? quote(opts.reply) : ""}${voiceNote ? `<p style="margin:0 0 16px;color:#78716c">${voiceNote}</p>` : ""}${button(url, "Open my journal")}`,
    ),
    text: `${hello}

Rangika ${what}.
${opts.reply ? `
${opts.reply}
` : ""}${voiceNote ? `
${voiceNote}
` : ""}
${url}`,
  };
}

/** To Rangika: a client sent something (journal entry, tracker answers, an upload). */
export function activityEmail(opts: { clientName: string; what: string; preview?: string | null; clientId: string; tab: string }) {
  const url = `${SITE_URL}/admin/clients/${opts.clientId}?tab=${opts.tab}`;
  return {
    subject: `${opts.clientName} ${opts.what}`,
    html: layout(`<p style="margin:0 0 16px"><strong>${escapeHtml(opts.clientName)}</strong> ${escapeHtml(opts.what)}.</p>${opts.preview ? quote(opts.preview) : ""}${button(url, "Have a look")}`),
    text: `${opts.clientName} ${opts.what}.\n${opts.preview ? `\n${opts.preview}\n` : ""}\n${url}`,
  };
}

export function digestEmail(rows: { clientName: string; taskTitle: string; when: string }[]) {
  const list = rows
    .map((r) => `<li style="margin:0 0 6px"><strong>${escapeHtml(r.clientName)}</strong>: ${escapeHtml(r.taskTitle)} <span style="color:#78716c">(${escapeHtml(r.when)})</span></li>`)
    .join("");
  const url = `${SITE_URL}/admin`;
  return {
    subject: `Today's progress: ${rows.length} task${rows.length === 1 ? "" : "s"} completed`,
    html: layout(`<p style="margin:0 0 16px">Here's what your clients completed today:</p><ul style="padding-left:20px;margin:0 0 16px">${list}</ul>${button(url, "Open dashboard")}`),
    text: `Completed today:\n${rows.map((r) => `- ${r.clientName}: ${r.taskTitle} (${r.when})`).join("\n")}\n\n${url}`,
  };
}

export function reminderEmail(opts: { name?: string | null; tasks: string[]; userId: string; customText?: string | null }) {
  const hello = `Hello${opts.name ? ` ${opts.name}` : ""},`;
  const intro = opts.customText?.trim() || "A gentle reminder: your practice for today is waiting for you.";
  const list = opts.tasks.map((t) => `<li style="margin:0 0 6px">${escapeHtml(t)}</li>`).join("");
  const url = `${SITE_URL}/portal`;
  const unsub = unsubscribeUrl(opts.userId);
  return {
    subject: "Your practice for today is waiting 🌿",
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p>${paragraphs(intro)}<ul style="padding-left:20px;margin:0 0 16px">${list}</ul>${button(url, "Open today's tasks")}`,
      `You get this because reminders are on. <a href="${unsub}" style="color:#78716c">Turn off reminder emails</a>`,
    ),
    text: `${hello}\n\n${intro}\n\n${opts.tasks.map((t) => `- ${t}`).join("\n")}\n\n${url}\n\nTurn off reminders: ${unsub}`,
  };
}

// ---------- Independent learning packages ----------

/** To the learner after buying: their login details (new account) or a "you're in" note (existing account). */
export function packagePurchasedEmail(opts: { name: string; packageTitle: string; login?: { username: string; password: string } | null }) {
  const hello = `Hello ${opts.name},`;
  const intro = `Thank you for buying ${opts.packageTitle}. It's ready for you in your private space. Work through the lessons one by one, at your own pace.`;
  const url = `${SITE_URL}/login?bought=1`; // shows the "use the details we emailed you" note
  const details = opts.login
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f6f7f6;border-radius:8px;font-family:Arial,sans-serif;font-size:15px">
<tr><td style="padding:12px 16px 4px;color:#78716c">Username</td><td style="padding:12px 16px 4px"><strong>${escapeHtml(opts.login.username)}</strong></td></tr>
<tr><td style="padding:4px 16px 12px;color:#78716c">Password</td><td style="padding:4px 16px 12px"><strong>${escapeHtml(opts.login.password)}</strong></td></tr></table>`
    : `<p style="margin:0 0 16px">Sign in as usual (with Google or your username and password). You'll find it under <strong>My courses</strong>.</p>`;
  return {
    subject: `Your course is ready: ${opts.packageTitle}`,
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p>${paragraphs(intro)}${details}${button(url, "Sign in and start")}${
        opts.login ? `<p style="margin:0;color:#78716c;font-size:14px">You can change your password after signing in, under Profile.</p>` : ""
      }`,
    ),
    text: `${hello}

${intro}

${opts.login ? `Username: ${opts.login.username}\nPassword: ${opts.login.password}` : "Sign in as usual (with Google or your username and password). You'll find it under My courses."}

Sign in: ${url}`,
  };
}

/** To Rangika: someone bought a package. */
export function packageSoldEmail(opts: { name: string; email: string; packageTitle: string; amount: string; userId: string }) {
  const url = `${SITE_URL}/admin/courses`;
  return {
    subject: `New sale: ${opts.packageTitle}`,
    html: layout(
      `<p style="margin:0 0 16px"><strong>${escapeHtml(opts.name)}</strong> (${escapeHtml(opts.email)}) bought <strong>${escapeHtml(opts.packageTitle)}</strong> for ${escapeHtml(opts.amount)}.</p><p style="margin:0 0 16px">Their account and access were set up automatically.</p>${button(url, "Open Independent Learning")}`,
    ),
    text: `${opts.name} (${opts.email}) bought ${opts.packageTitle} for ${opts.amount}.\nTheir account and access were set up automatically.\n\n${url}`,
  };
}

/** To Rangika: a learner finished every lesson and is waiting for their certificate. */
export function packageFinishedEmail(opts: { name: string; packageTitle: string }) {
  const url = `${SITE_URL}/admin/courses#finished`;
  return {
    subject: `${opts.name} finished ${opts.packageTitle}`,
    html: layout(
      `<p style="margin:0 0 16px"><strong>${escapeHtml(opts.name)}</strong> has finished every lesson in <strong>${escapeHtml(opts.packageTitle)}</strong>.</p><p style="margin:0 0 16px">They're waiting for their certificate.</p>${button(url, "Upload certificate")}`,
    ),
    text: `${opts.name} has finished every lesson in ${opts.packageTitle}. They're waiting for their certificate.\n\n${url}`,
  };
}

/** To the learner: Rangika uploaded their certificate. */
export function packageCertificateEmail(opts: { name?: string | null; packageTitle: string; packageId: string }) {
  const hello = `Hello${opts.name ? ` ${opts.name}` : ""},`;
  const url = `${SITE_URL}/portal/courses/${opts.packageId}`;
  return {
    subject: `Your certificate for ${opts.packageTitle}`,
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p><p style="margin:0 0 16px">Congratulations on completing <strong>${escapeHtml(opts.packageTitle)}</strong>. Your certificate from Rangika is ready.</p>${button(url, "View certificate")}`,
    ),
    text: `${hello}\n\nCongratulations on completing ${opts.packageTitle}. Your certificate from Rangika is ready.\n\n${url}`,
  };
}

// ---------- Taught courses bought on the website ----------

/** To the student after paying for a place: their login details (new account) and what happens next. */
export function courseEnrolledEmail(opts: {
  name: string;
  courseTitle: string;
  schedule?: string | null;
  format?: string | null;
  login?: { username: string; password: string } | null;
  // The class days, already written out in the buyer's own time zone.
  classDays?: { zone: string; lines: string[] } | null;
}) {
  const hello = `Hello ${opts.name},`;
  const days = opts.classDays?.lines.length ? opts.classDays : null;
  const daysHtml = days
    ? `<p style="margin:0 0 6px"><strong>Your class days</strong> (${escapeHtml(days.zone)}):</p><ul style="margin:0 0 16px;padding-left:20px">${days.lines
        .map((l) => `<li style="margin:0 0 4px">${escapeHtml(l)}</li>`)
        .join("")}</ul>`
    : "";
  const daysText = days ? `\nYour class days (${days.zone}):\n${days.lines.map((l) => `- ${l}`).join("\n")}\n` : "";
  const intro = `Thank you for enrolling in ${opts.courseTitle}. Your place is booked, and Rangika will be in touch with everything you need before the class.`;
  const when = [opts.schedule, opts.format].filter(Boolean).join(" · ");
  const url = `${SITE_URL}/login?bought=1`; // shows the "use the details we emailed you" note
  const details = opts.login
    ? `<p style="margin:0 0 8px">Your private space, where your class notes and material will appear:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f6f7f6;border-radius:8px;font-family:Arial,sans-serif;font-size:15px">
<tr><td style="padding:12px 16px 4px;color:#78716c">Username</td><td style="padding:12px 16px 4px"><strong>${escapeHtml(opts.login.username)}</strong></td></tr>
<tr><td style="padding:4px 16px 12px;color:#78716c">Password</td><td style="padding:4px 16px 12px"><strong>${escapeHtml(opts.login.password)}</strong></td></tr></table>`
    : `<p style="margin:0 0 16px">Sign in as usual (with Google or your username and password). You'll find the class under <strong>My classes</strong>.</p>`;
  return {
    subject: `You're enrolled: ${opts.courseTitle}`,
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p>${paragraphs(intro)}${
        when ? `<p style="margin:0 0 16px"><strong>When and where:</strong> ${escapeHtml(when)}</p>` : ""
      }${daysHtml}${details}${button(url, "Sign in")}`,
    ),
    text: `${hello}

${intro}
${when ? `\nWhen and where: ${when}\n` : ""}${daysText}
${opts.login ? `Username: ${opts.login.username}\nPassword: ${opts.login.password}` : "Sign in as usual (with Google or your username and password). You'll find the class under My classes."}

Sign in: ${url}`,
  };
}

/** To Rangika: someone paid for a place on a course. */
export function courseSoldEmail(opts: { name: string; email: string; phone?: string | null; courseTitle: string; amount: string; seatsLeft: number | null }) {
  const url = `${SITE_URL}/admin/classes`;
  const contact = [opts.email, opts.phone].filter(Boolean).join(" · ");
  const seats = opts.seatsLeft === null ? "" : `${opts.seatsLeft} place${opts.seatsLeft === 1 ? "" : "s"} left.`;
  return {
    subject: `New enrollment: ${opts.courseTitle}`,
    html: layout(
      `<p style="margin:0 0 16px"><strong>${escapeHtml(opts.name)}</strong> (${escapeHtml(contact)}) paid ${escapeHtml(opts.amount)} for <strong>${escapeHtml(opts.courseTitle)}</strong>.</p><p style="margin:0 0 16px">They've been enrolled automatically. ${escapeHtml(seats)}</p>${button(url, "Open Courses")}`,
    ),
    text: `${opts.name} (${contact}) paid ${opts.amount} for ${opts.courseTitle}.\nThey've been enrolled automatically. ${seats}\n\n${url}`,
  };
}

/** To Rangika: someone sent the contact form (free consultation request or a question). */
export function enquiryEmail(opts: {
  kind: "CONSULTATION" | "QUESTION";
  name: string;
  email: string;
  phone?: string | null;
  contactMethod?: string | null;
  topic?: string | null;
  message?: string | null;
}) {
  const url = `${SITE_URL}/admin/enquiries`;
  const consult = opts.kind === "CONSULTATION";
  const rows = [
    ["Email", opts.email],
    ["Phone", opts.phone],
    ["Prefers", opts.contactMethod],
    [consult ? "Would like to work on" : "Subject", opts.topic],
  ].filter(([, v]) => v) as [string, string][];
  const subject = consult ? `Free consultation request: ${opts.name}` : `New question from ${opts.name}`;
  return {
    subject,
    html: layout(
      `<p style="margin:0 0 16px"><strong>${escapeHtml(opts.name)}</strong> ${consult ? "asked for a free consultation" : "sent a question"} on the website.</p>` +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px">${rows
          .map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0;color:#78716c">${k}</td><td style="padding:2px 0">${escapeHtml(v)}</td></tr>`)
          .join("")}</table>` +
        (opts.message ? `<p style="margin:0 0 16px;white-space:pre-line">${escapeHtml(opts.message)}</p>` : "") +
        button(url, "Open in your dashboard"),
    ),
    text: `${opts.name} ${consult ? "asked for a free consultation" : "sent a question"} on the website.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${opts.message ?? ""}\n\n${url}`,
  };
}

// ---------- One-to-one sessions booked on the website ----------

type SessionMail = {
  name: string;
  serviceTitle: string;
  optionTitle: string; // e.g. "5-session package"; "" for a session booked from a package
  when: string; // date and time as the reader should see it
  inPerson: boolean;
  paid: string | null; // e.g. "AUD 610"; null when booked with a session left in their package
  sessionsLeft: number; // still to book after this one
  recorded?: boolean; // a self-paced recorded journey: no appointment, Rangika adds the recordings to their private space
};

const RECORDED_TEXT = "Self-paced recorded journey. No appointment needed: Rangika adds your recordings, workbooks and trackers to your private space.";

function detailRows(rows: [string, string][]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f6f7f6;border-radius:8px;font-family:Arial,sans-serif;font-size:15px">${rows
    .map(([k, v]) => `<tr><td style="padding:8px 16px;color:#78716c;vertical-align:top">${escapeHtml(k)}</td><td style="padding:8px 16px">${escapeHtml(v)}</td></tr>`)
    .join("")}</table>`;
}

/** To the client: their session is booked (and their login details if the account is new). */
export function sessionBookedEmail(opts: SessionMail & { login?: { username: string; password: string } | null }) {
  const hello = `Hello ${opts.name},`;
  const intro = opts.recorded
    ? `Thank you for choosing the ${opts.serviceTitle} self-paced recorded journey. Your payment went through.`
    : opts.paid
      ? `Thank you for booking ${opts.serviceTitle}. Your payment went through and your session is confirmed.`
      : `Your next ${opts.serviceTitle} session is booked.`;
  const rows: [string, string][] = opts.recorded
    ? [
        ["Journey", [opts.serviceTitle, opts.optionTitle].filter(Boolean).join(" · ")],
        ["Format", RECORDED_TEXT],
        ...(opts.paid ? ([["Paid", opts.paid]] as [string, string][]) : []),
      ]
    : [
        ["Session", [opts.serviceTitle, opts.optionTitle].filter(Boolean).join(" · ")],
        ["When", opts.when],
        ["Where", opts.inPerson ? "In person in Perth. Rangika will confirm the address with you." : "Online. Your session link will be in your private space."],
        ...(opts.paid ? ([["Paid", opts.paid]] as [string, string][]) : []),
      ];
  const footer = opts.recorded ? "Any questions? Simply reply to this email." : "Need to change the time? Simply reply to this email.";
  const left =
    opts.sessionsLeft > 0
      ? `You have ${opts.sessionsLeft} more session${opts.sessionsLeft === 1 ? "" : "s"} in your package. Book ${opts.sessionsLeft === 1 ? "it" : "them"} whenever it suits you from your private space (My sessions → Book your next session).`
      : "";
  const url = `${SITE_URL}/login`;
  const login = opts.login
    ? `<p style="margin:0 0 8px">Your private space, where Rangika will add your session notes, exercises and material:</p>${detailRows([
        ["Username", opts.login.username],
        ["Password", opts.login.password],
      ])}`
    : `<p style="margin:0 0 16px">Sign in as usual (with Google or your username and password) to see your session details.</p>`;
  return {
    subject: opts.recorded
      ? `Your recorded journey: ${opts.serviceTitle}`
      : opts.paid
        ? `Your session is booked: ${opts.serviceTitle}`
        : `Session booked: ${opts.serviceTitle}`,
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p>${paragraphs(intro)}${detailRows(rows)}${left ? paragraphs(left) : ""}${login}${button(url, "Sign in")}<p style="margin:0;color:#78716c;font-size:14px">${footer}</p>`,
    ),
    text: `${hello}

${intro}

${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}
${left ? `\n${left}\n` : ""}
${opts.login ? `Username: ${opts.login.username}\nPassword: ${opts.login.password}` : "Sign in as usual (with Google or your username and password) to see your session details."}

Sign in: ${url}

${footer}`,
  };
}

/** To Rangika: a new one-to-one booking, with what the client wrote on the booking form. */
export function sessionBookedAdminEmail(
  opts: SessionMail & {
    email: string;
    phone?: string | null;
    userId?: string | null;
    clientTimezone?: string | null;
    concerns?: string | null;
    previousTherapy?: string | null;
    medicalConditions?: string | null;
  },
) {
  const url = opts.userId ? `${SITE_URL}/admin/clients/${opts.userId}?tab=sessions` : `${SITE_URL}/admin/bookings`;
  const rows: [string, string][] = [
    ["Client", `${opts.name} · ${[opts.email, opts.phone].filter(Boolean).join(" · ")}`],
    ["Session", [opts.serviceTitle, opts.optionTitle].filter(Boolean).join(" · ")],
    ...(opts.recorded
      ? ([["Format", "Self-paced recorded journey (no appointment). Please add their recordings, workbooks and trackers to their plan."]] as [string, string][])
      : ([
          ["When (Perth time)", opts.when],
          ["Where", opts.inPerson ? "In person" : "Online / distance"],
        ] as [string, string][])),
    ...(opts.clientTimezone ? ([["Client's time zone", opts.clientTimezone.replace(/_/g, " ")]] as [string, string][]) : []),
    ["Payment", opts.paid ?? "Booked with a session left in their package"],
    ...(opts.sessionsLeft > 0 ? ([["Still to book", `${opts.sessionsLeft} session${opts.sessionsLeft === 1 ? "" : "s"}`]] as [string, string][]) : []),
  ];
  const notes: [string, string | null | undefined][] = [
    ["What they'd like help with", opts.concerns],
    ["Previous therapy", opts.previousTherapy],
    ["Medical conditions / medication", opts.medicalConditions],
  ];
  const noteHtml = notes
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `<p style="margin:0 0 4px"><strong>${escapeHtml(k)}</strong></p>${quote(v!)}`)
    .join("");
  return {
    subject: `${opts.recorded ? "New recorded journey" : "New booking"}: ${opts.serviceTitle} · ${opts.name}`,
    html: layout(`${detailRows(rows)}${noteHtml}${button(url, "Open their page")}`),
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${notes
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `${k}:\n${v}`)
      .join("\n\n")}\n\n${url}`,
  };
}
