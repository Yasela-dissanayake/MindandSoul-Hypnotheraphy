"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { readRequestToken } from "@/lib/request-token";
import { describeWants } from "@/lib/access-requests";
import { accessRequestEmail, PRACTITIONER_EMAIL, sendMail } from "@/lib/mail";

const schema = z
  .object({
    wants: z.enum(["SESSIONS", "COURSE", "UNSURE"], { message: "Please choose what you're here for." }),
    service: z.enum(["HYPNOTHERAPY", "REIKI_HEALING", "ANIMAL_REIKI"]).nullable().optional(),
    courseId: z.string().max(50).nullable().optional(),
    message: z.string().trim().max(1000).optional().default(""),
    phone: z.string().trim().max(40).optional().default(""),
  })
  .refine((d) => d.wants !== "SESSIONS" || d.service, { message: "Please choose which sessions." })
  .refine((d) => d.wants !== "COURSE" || d.courseId, { message: "Please choose a class." });

export type RequestFormResult = { ok: false; error: string };

/** Sends the access request with what they're asking for, then emails Rangika. */
export async function sendAccessRequest(token: string, input: z.input<typeof schema>): Promise<RequestFormResult> {
  const email = readRequestToken(token);
  if (!email) return { ok: false, error: "This page has expired. Please sign in with Google again." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;

  const request = await db.accessRequest.findUnique({ where: { email } });
  if (!request || request.status !== "PENDING") return { ok: false, error: "Please sign in with Google again." };

  let courseTitle: string | null = null;
  if (d.wants === "COURSE") {
    const course = await db.course.findFirst({ where: { id: d.courseId!, archived: false }, select: { title: true } });
    if (!course) return { ok: false, error: "Please choose a class from the list." };
    courseTitle = course.title;
  }

  const first = !request.detailsAt;
  const updated = await db.accessRequest.update({
    where: { email },
    data: {
      wants: d.wants,
      wantsService: d.wants === "SESSIONS" ? d.service : null,
      wantsCourseId: d.wants === "COURSE" ? d.courseId : null,
      message: d.message || null,
      phone: d.phone || null,
      detailsAt: new Date(),
      ...(first ? { createdAt: new Date() } : {}),
    },
  });
  if (first) {
    await sendMail({
      to: PRACTITIONER_EMAIL,
      ...accessRequestEmail({ name: updated.name, email, wants: describeWants(updated, courseTitle), message: updated.message, phone: updated.phone }),
    });
  }
  revalidatePath("/admin", "layout");
  redirect("/login?error=RequestSent");
}
