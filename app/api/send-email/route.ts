import { type NextRequest, NextResponse } from "next/server";
import { isAuthorizedInternalRequest } from "@/lib/security";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  if (!isAuthorizedInternalRequest(req)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const data = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let subject = "";
    let text = "";

    if (data.formType === "question") {
      subject = data.subject || "New Question from Website";
      text = `
        Name: ${data.name}
        Email: ${data.email}

        Question:
        ${data.question}
      `;
    } else if (data.formType === "consultation") {
      subject = "New Consultation Request";
      text = `
        First Name: ${data.firstName}
        Last Name: ${data.lastName}
        Email: ${data.email}
        Phone: ${data.phone}
        Preferred Contact: ${data.contactMethod}
        Work On: ${data.workOn}

        Details:
        ${data.details}
      `;
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "healwithrangika@gmail.com",
      subject,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
