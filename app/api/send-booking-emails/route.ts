import { type NextRequest, NextResponse } from "next/server";
import {
  sendConfirmationEmail,
  sendPractitionerNotification,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    console.log(
      "POST /api/send-booking-emails - Sending booking confirmation emails..."
    );

    const bookingData = await request.json();
    console.log("Booking data received:", {
      clientEmail: bookingData.clientEmail,
      service: bookingData.service,
      date: bookingData.date,
      time: bookingData.time,
    });

    // Validate required fields
    if (
      !bookingData.clientEmail ||
      !bookingData.clientName ||
      !bookingData.service
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required booking data",
        },
        { status: 400 }
      );
    }

    // Send confirmation email to client
    console.log(
      "Sending confirmation email to client:",
      bookingData.clientEmail
    );
    const clientResult = await sendConfirmationEmail(bookingData);

    // Send notification to practitioner
    console.log("Sending notification to practitioner");
    const practitionerResult = await sendPractitionerNotification(bookingData);

    // Return results
    const response = {
      success: true,
      message: "Booking emails processed",
      results: {
        clientEmail: {
          success: clientResult.success,
          messageId: clientResult.messageId,
          error: clientResult.error,
        },
        practitionerEmail: {
          success: practitionerResult.success,
          messageId: practitionerResult.messageId,
          error: practitionerResult.error,
        },
      },
    };

    console.log("Email sending results:", response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in send-booking-emails:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
