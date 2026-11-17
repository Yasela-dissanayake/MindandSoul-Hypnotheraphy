import { Resend } from "resend";
import { createHmac } from "crypto";

// Transactional email through Resend.
// Without RESEND_API_KEY (local development) emails are printed to the console.

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
export const EMAIL_FROM = process.env.EMAIL_FROM || "Heal With Rangika <onboarding@resend.dev>";
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
<tr><td style="background:#485a48;color:#ffffff;padding:20px 28px;font-size:20px">Heal With Rangika</td></tr>
<tr><td style="padding:28px;font-size:16px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#f6f7f6;font-size:12px;color:#78716c;font-family:Arial,sans-serif">${footer || "Heal With Rangika · Hypnotherapy &amp; Reiki"}</td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0"><a href="${href}" style="background:#485a48;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-family:Arial,sans-serif;display:inline-block">${escapeHtml(label)}</a></p>`;
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  if (!resend) {
    console.log(`\n📧 [email not sent: RESEND_API_KEY missing]\nTo: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}\n`);
    return { ok: true as const };
  }
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  });
  if (error) {
    console.error("Email failed:", opts.subject, error);
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
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
    `Your private space at Heal With Rangika is ready. There you'll find your sessions work, course material and journal, all in one calm place.`;
  const url = `${SITE_URL}/login`;
  const details = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f6f7f6;border-radius:8px;font-family:Arial,sans-serif;font-size:15px">
<tr><td style="padding:12px 16px 4px;color:#78716c">Username</td><td style="padding:12px 16px 4px"><strong>${escapeHtml(opts.username)}</strong></td></tr>
<tr><td style="padding:4px 16px 12px;color:#78716c">Password</td><td style="padding:4px 16px 12px"><strong>${escapeHtml(opts.password)}</strong></td></tr></table>`;
  return {
    subject: "Your login details for Heal With Rangika",
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

/** To Rangika: someone signed in with Google and is waiting for approval. */
export function accessRequestEmail(opts: { name?: string | null; email: string; wants?: string | null; message?: string | null; phone?: string | null }) {
  const who = opts.name ? `${opts.name} (${opts.email})` : opts.email;
  const url = `${SITE_URL}/admin/requests`;
  const rows = [
    opts.wants ? `<p style="margin:0 0 8px"><strong>Asking for:</strong> ${escapeHtml(opts.wants)}</p>` : "",
    opts.phone ? `<p style="margin:0 0 8px"><strong>Phone:</strong> ${escapeHtml(opts.phone)}</p>` : "",
    opts.message ? `<p style="margin:0 0 8px"><strong>Message:</strong></p>${quote(opts.message)}` : "",
  ].join("");
  return {
    subject: `Access request: ${opts.name || opts.email}${opts.wants ? ` (${opts.wants})` : ""}`,
    html: layout(
      `<p style="margin:0 0 16px"><strong>${escapeHtml(who)}</strong> is asking for access to your client area.</p>${rows}<p style="margin:16px 0">Approve or decline with one click. What they asked for is already selected.</p>${button(url, "Review request")}`,
    ),
    text: `${who} is asking for access.${opts.wants ? `
Asking for: ${opts.wants}` : ""}${opts.phone ? `
Phone: ${opts.phone}` : ""}${opts.message ? `
Message: ${opts.message}` : ""}
Review: ${url}`,
  };
}

/** To the person: their Google access request was approved. */
export function accessApprovedEmail(opts: { name?: string | null }) {
  const hello = `Hello${opts.name ? ` ${opts.name}` : ""},`;
  const url = `${SITE_URL}/login`;
  const body = `Good news: Rangika has approved your access to your private space. Sign in with the same Google account you used before.`;
  return {
    subject: "Your access has been approved",
    html: layout(`<p style="margin:0 0 16px">${escapeHtml(hello)}</p>${paragraphs(body)}${button(url, "Sign in with Google")}`),
    text: `${hello}

${body}

${url}`,
  };
}

export function welcomeEmail(opts: { name?: string | null }) {
  const hello = `Welcome${opts.name ? `, ${opts.name}` : ""}!`;
  const url = `${SITE_URL}/portal`;
  const body = `You're all set. Your private page shows your sessions work and course material. Tick tasks off as you go, and use your journal whenever you like.`;
  return {
    subject: "Welcome to Heal With Rangika",
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
  const url = `${SITE_URL}/login`;
  const details = opts.login
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f6f7f6;border-radius:8px;font-family:Arial,sans-serif;font-size:15px">
<tr><td style="padding:12px 16px 4px;color:#78716c">Username</td><td style="padding:12px 16px 4px"><strong>${escapeHtml(opts.login.username)}</strong></td></tr>
<tr><td style="padding:4px 16px 12px;color:#78716c">Password</td><td style="padding:4px 16px 12px"><strong>${escapeHtml(opts.login.password)}</strong></td></tr></table>`
    : `<p style="margin:0 0 16px">Sign in with your usual username and password. You'll find it under <strong>My learning</strong>.</p>`;
  return {
    subject: `Your course is ready: ${opts.packageTitle}`,
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p>${paragraphs(intro)}${details}${button(url, "Sign in and start")}${
        opts.login ? `<p style="margin:0;color:#78716c;font-size:14px">You can change your password after signing in, under Profile.</p>` : ""
      }`,
    ),
    text: `${hello}

${intro}

${opts.login ? `Username: ${opts.login.username}\nPassword: ${opts.login.password}` : "Sign in with your usual username and password. You'll find it under My learning."}

Sign in: ${url}`,
  };
}

/** To Rangika: someone bought a package. */
export function packageSoldEmail(opts: { name: string; email: string; packageTitle: string; amount: string; userId: string }) {
  const url = `${SITE_URL}/admin/learning`;
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
  const url = `${SITE_URL}/admin/learning#finished`;
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
  const url = `${SITE_URL}/portal/learning/${opts.packageId}`;
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
}) {
  const hello = `Hello ${opts.name},`;
  const intro = `Thank you for enrolling in ${opts.courseTitle}. Your place is booked, and Rangika will be in touch with everything you need before the class.`;
  const when = [opts.schedule, opts.format].filter(Boolean).join(" · ");
  const url = `${SITE_URL}/login`;
  const details = opts.login
    ? `<p style="margin:0 0 8px">Your private space, where your course notes and material will appear:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f6f7f6;border-radius:8px;font-family:Arial,sans-serif;font-size:15px">
<tr><td style="padding:12px 16px 4px;color:#78716c">Username</td><td style="padding:12px 16px 4px"><strong>${escapeHtml(opts.login.username)}</strong></td></tr>
<tr><td style="padding:4px 16px 12px;color:#78716c">Password</td><td style="padding:4px 16px 12px"><strong>${escapeHtml(opts.login.password)}</strong></td></tr></table>`
    : `<p style="margin:0 0 16px">Sign in with your usual username and password. You'll find the course under <strong>My courses</strong>.</p>`;
  return {
    subject: `You're enrolled: ${opts.courseTitle}`,
    html: layout(
      `<p style="margin:0 0 16px">${escapeHtml(hello)}</p>${paragraphs(intro)}${
        when ? `<p style="margin:0 0 16px"><strong>When and where:</strong> ${escapeHtml(when)}</p>` : ""
      }${details}${button(url, "Sign in")}`,
    ),
    text: `${hello}

${intro}
${when ? `\nWhen and where: ${when}\n` : ""}
${opts.login ? `Username: ${opts.login.username}\nPassword: ${opts.login.password}` : "Sign in with your usual username and password. You'll find the course under My courses."}

Sign in: ${url}`,
  };
}

/** To Rangika: someone paid for a place on a course. */
export function courseSoldEmail(opts: { name: string; email: string; phone?: string | null; courseTitle: string; amount: string; seatsLeft: number | null }) {
  const url = `${SITE_URL}/admin/courses`;
  const contact = [opts.email, opts.phone].filter(Boolean).join(" · ");
  const seats = opts.seatsLeft === null ? "" : `${opts.seatsLeft} place${opts.seatsLeft === 1 ? "" : "s"} left.`;
  return {
    subject: `New enrolment: ${opts.courseTitle}`,
    html: layout(
      `<p style="margin:0 0 16px"><strong>${escapeHtml(opts.name)}</strong> (${escapeHtml(contact)}) paid ${escapeHtml(opts.amount)} for <strong>${escapeHtml(opts.courseTitle)}</strong>.</p><p style="margin:0 0 16px">They've been enrolled automatically. ${escapeHtml(seats)}</p>${button(url, "Open Courses")}`,
    ),
    text: `${opts.name} (${contact}) paid ${opts.amount} for ${opts.courseTitle}.\nThey've been enrolled automatically. ${seats}\n\n${url}`,
  };
}
