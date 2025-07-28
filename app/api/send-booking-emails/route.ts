import { type NextRequest, NextResponse } from "next/server";
import {
  sendClientBookingConfirmation,
  sendPractitionerBookingNotification,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      paymentIntentId,
      amount,
      currency,
      service,
      date,
      time,
      sessionType,
      clientName,
      clientEmail,
      clientPhone,
      concerns,
      previousTherapy,
      emergencyContact,
      medicalConditions,
    } = body;

    console.log("📧 Sending booking emails for payment:", paymentIntentId);

    // Send client confirmation email
    const clientEmailResult = await sendClientBookingConfirmation({
      clientName,
      clientEmail,
      service,
      date,
      time,
      sessionType,
      amount,
      currency,
      paymentIntentId,
      concerns,
    });

    // Send practitioner notification email
    const practitionerEmailResult = await sendPractitionerBookingNotification({
      clientName,
      clientEmail,
      clientPhone,
      service,
      date,
      time,
      sessionType,
      amount,
      currency,
      paymentIntentId,
      concerns,
      previousTherapy,
      emergencyContact,
      medicalConditions,
    });

    if (clientEmailResult.success && practitionerEmailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Booking emails sent successfully",
        details: {
          clientEmail: clientEmailResult,
          practitionerEmail: practitionerEmailResult,
        },
      });
    } else {
      console.error("❌ Email sending failed:", {
        clientEmail: clientEmailResult,
        practitionerEmail: practitionerEmailResult,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Failed to send one or more emails",
          details: {
            clientEmail: clientEmailResult,
            practitionerEmail: practitionerEmailResult,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in send-booking-emails API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
