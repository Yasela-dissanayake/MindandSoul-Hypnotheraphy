import type { Metadata } from "next";
import type React from "react";
import { Mail, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy · Mind & Soul Works",
  description: "What information Mind & Soul Works collects about you, why, where it is held, and what you can do about it.",
};

// Text from "docs/website extra information.docx" (Privacy Policy, last updated 22/11/2026).
// The "where it is held" table lists the systems this website actually uses.
const EMAIL = "mindandsoulworksaus@gmail.com";
const UPDATED = "22 November 2026";

const SYSTEMS: [what: string, service: string, where: string][] = [
  ["Bookings, appointment details and your client portal (account, questions, journal, tasks and trackers)", "This website's database (Supabase)", "Singapore"],
  ["Card payments for sessions, classes and courses", "Stripe, through this website's checkout", "United States"],
  ["Files you upload, or that I share with you, in your portal", "Cloudflare R2 storage", "United States and elsewhere"],
  ["Emails the website sends (booking confirmations and reminders)", "Resend", "United States"],
  ["Website hosting", "Netlify", "United States"],
  ["Website analytics", "Google Analytics", "United States and elsewhere"],
  ["Online sessions", "Zoom", "United States"],
  ["Email correspondence", "Gmail", "Australia"],
  ["Clinical notes", "Google Drive", "Australia"],
  ["Paper client files", "Held by me, in a secured filing cabinet", "My home office, Western Australia"],
];

const SECTIONS = [
  ["why", "Why this policy exists"],
  ["collect", "What I collect"],
  ["purpose", "Why I collect it"],
  ["where", "How it is held, and where"],
  ["share", "Who I share it with"],
  ["keep", "How long I keep it"],
  ["secure", "Keeping it secure"],
  ["access", "Seeing and correcting your information"],
  ["cookies", "Cookies and analytics"],
  ["complaints", "If you are unhappy"],
  ["changes", "Changes to this policy"],
] as const;

function Section({ id, title, children }: { id: (typeof SECTIONS)[number][0]; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <h2 className="font-serif text-2xl text-stone-800 md:text-3xl">{title}</h2>
      <div className="space-y-4 leading-relaxed text-stone-600">{children}</div>
    </section>
  );
}

const EmailLink = () => (
  <a href={`mailto:${EMAIL}`} className="font-medium text-sage-700 underline underline-offset-2 hover:text-sage-800">
    {EMAIL}
  </a>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-br from-stone-100 to-sage-50 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-sage-200">
            <ShieldCheck className="h-6 w-6 text-sage-600" aria-hidden />
          </span>
          <h1 className="mt-5 font-serif text-4xl text-stone-800 md:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-lg text-stone-600">Mind &amp; Soul Works · Rangika Mathew</p>
          <p className="mt-1 text-sm text-stone-500">Last updated: {UPDATED}</p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">On this page</p>
            <ol className="mt-3 space-y-1.5 border-l border-stone-200 text-sm">
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="-ml-px block border-l border-transparent pl-3 text-stone-600 hover:border-sage-500 hover:text-sage-800">
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="min-w-0 space-y-12">
            <Section id="why" title="Why this policy exists">
              <p>
                I am a clinical hypnotherapist. That makes me a health service provider under the <em>Privacy Act 1988</em> (Cth), and the Act applies to my
                practice regardless of its size. This policy explains what information I collect about you, why I have it, where it is kept, and what you can
                do about it.
              </p>
            </Section>

            <Section id="collect" title="What I collect">
              <ul className="space-y-3">
                <li>
                  <strong className="font-medium text-stone-800">When you enquire or book a session:</strong> your name, email address, phone number, and
                  whatever you choose to tell me about why you are getting in touch.
                </li>
                <li>
                  <strong className="font-medium text-stone-800">When you become a client:</strong> health information. That includes what you tell me about
                  your symptoms, your history, your circumstances, and how you respond to sessions, along with my own notes about our work together. Health
                  information is treated as <em>sensitive information</em> under the Act, which means I can only collect it with your consent and I must
                  protect it more carefully than ordinary contact details.
                </li>
                <li>
                  <strong className="font-medium text-stone-800">When you join my email list:</strong> your email address, and the language you selected.
                </li>
                <li>
                  <strong className="font-medium text-stone-800">When you visit the website:</strong> anonymous usage data through Google Analytics: pages
                  viewed, approximate location by country or city, device type, and how you arrived at the site. This does not identify you by name.
                </li>
              </ul>
              <p>I do not collect information about you from anyone else without telling you.</p>
            </Section>

            <Section id="purpose" title="Why I collect it">
              <ul className="list-disc space-y-1.5 pl-5 marker:text-sage-500">
                <li>To provide Reiki and hypnotherapy services to you</li>
                <li>To arrange, confirm and reschedule appointments</li>
                <li>To keep clinical records, which I am obliged to keep accurately</li>
                <li>To enable you to log in to your portal on my website</li>
                <li>To understand how people find and use the website</li>
              </ul>
              <p className="rounded-xl bg-sage-50 px-4 py-3 font-medium text-sage-900 ring-1 ring-sage-200">I do not sell your information. To anyone.</p>
            </Section>

            <Section id="where" title="How it is held, and where">
              <p>
                Your information is held in the following systems. Several are based overseas, and this is the part most people do not think to ask about,
                so it is set out plainly:
              </p>
              {/* Table on larger screens, stacked cards on phones. */}
              <div className="hidden overflow-hidden rounded-xl bg-white ring-1 ring-stone-200 md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">What</th>
                      <th className="px-4 py-3 font-medium">Service</th>
                      <th className="px-4 py-3 font-medium">Where it is held</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {SYSTEMS.map(([what, service, where]) => (
                      <tr key={what} className="align-top">
                        <td className="px-4 py-3 text-stone-700">{what}</td>
                        <td className="px-4 py-3 text-stone-600">{service}</td>
                        <td className="px-4 py-3 font-medium text-stone-800">{where}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="space-y-3 md:hidden">
                {SYSTEMS.map(([what, service, where]) => (
                  <li key={what} className="rounded-xl bg-white p-4 text-sm ring-1 ring-stone-200">
                    <p className="font-medium text-stone-800">{what}</p>
                    <p className="mt-1 text-stone-600">{service}</p>
                    <p className="mt-1 text-stone-500">Held in: {where}</p>
                  </li>
                ))}
              </ul>
              <p>
                I never see or store your full card number. Card details are entered directly into Stripe&apos;s payment fields and handled by Stripe. What
                reaches me is confirmation that a payment succeeded.
              </p>
              <p>
                By using this site, booking a session, or emailing me, you consent to your information being handled in those countries. I take reasonable
                steps to use established providers with their own security obligations, but information held overseas is subject to the laws of those
                countries.
              </p>
              <p>Sessions are held over Zoom. I record sessions with your consent.</p>
            </Section>

            <Section id="share" title="Who I share it with">
              <p>I do not disclose your information to anyone else except:</p>
              <ul className="list-disc space-y-2 pl-5 marker:text-sage-500">
                <li>
                  <strong className="font-medium text-stone-800">With your express consent</strong>, for example a support letter to your employer, or a
                  letter to your GP. You decide, in each case, what it says and who receives it.
                </li>
                <li>
                  <strong className="font-medium text-stone-800">Where the law requires it.</strong> This includes a court order or subpoena, and it includes
                  my obligations where there is a serious and imminent risk to someone&apos;s life, health or safety, or where a child is at risk of harm.
                </li>
              </ul>
              <p>Nothing goes to your employer, your recruiter, or a testing clinic unless you have asked me to send it.</p>
            </Section>

            <Section id="keep" title="How long I keep it">
              <p>
                Clinical records are kept for seven years from the last date of interaction or service delivery. After that they are securely destroyed.
              </p>
              <p>You can unsubscribe from my email list at any time using the link at the bottom of any email, and your address is removed.</p>
            </Section>

            <Section id="secure" title="Keeping it secure">
              <p>
                I use password-protected accounts where the service offers it, and a password manager rather than reused passwords. Paper records are held in
                a secured filing cabinet. The website is served over HTTPS.
              </p>
              <p>
                No system is completely secure. If a data breach happens that is likely to cause you serious harm, I am required to notify you and the Office
                of the Australian Information Commissioner.
              </p>
            </Section>

            <Section id="access" title="Seeing your information, and correcting it">
              <p>You have the right to ask for a copy of the personal information I hold about you, and to ask me to correct anything that is wrong.</p>
              <p>
                Email me at <EmailLink />. I will respond within 30 days. There is no charge for making the request.
              </p>
              <p>
                There are limited circumstances where the Act allows me to refuse access, for example where giving it to you would pose a serious threat to
                someone&apos;s life or health, or would unreasonably affect another person&apos;s privacy. If I refuse, I will tell you why in writing.
              </p>
            </Section>

            <Section id="cookies" title="Cookies and analytics">
              <p>
                The website uses Google Analytics, which sets cookies to measure visits. You can block or delete cookies in your browser settings, or install
                Google&apos;s{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-sage-700 underline underline-offset-2 hover:text-sage-800"
                >
                  opt-out browser add-on
                </a>
                . The site works without them.
              </p>
            </Section>

            <Section id="complaints" title="If you are unhappy with how I have handled your information">
              <p>
                Tell me first. Email <EmailLink /> with what happened. I will acknowledge within 7 days and give you a written response within 30 days.
              </p>
              <p>If you are not satisfied with my response, you can complain to the Office of the Australian Information Commissioner:</p>
              <address className="rounded-xl bg-white p-4 not-italic ring-1 ring-stone-200">
                <p className="font-medium text-stone-800">Office of the Australian Information Commissioner (OAIC)</p>
                <p>
                  <a href="https://www.oaic.gov.au" target="_blank" rel="noreferrer" className="text-sage-700 underline underline-offset-2 hover:text-sage-800">
                    oaic.gov.au
                  </a>
                </p>
                <p>
                  <a href="tel:1300363992" className="text-sage-700 underline underline-offset-2 hover:text-sage-800">
                    1300 363 992
                  </a>
                </p>
                <p>GPO Box 5218, Sydney NSW 2001</p>
              </address>
            </Section>

            <Section id="changes" title="Changes to this policy">
              <p>If this policy changes, the updated version is published on this page with a new date at the top.</p>
            </Section>

            <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
              <address className="not-italic leading-relaxed text-stone-600">
                <p className="font-serif text-lg text-stone-800">Rangika Mathew</p>
                <p>Mind &amp; Soul Works</p>
                <p>Western Australia, Australia</p>
              </address>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full bg-sage-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sage-700"
              >
                <Mail className="h-4 w-4" aria-hidden /> {EMAIL}
              </a>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
}
