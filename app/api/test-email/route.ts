import { type NextRequest, NextResponse } from "next/server";
import {
  testEmailConfiguration,
  sendConfirmationEmail,
  sendPractitionerNotification,
} from "@/lib/email";

export async function GET() {
  try {
    console.log("GET /api/test-email - Testing email configuration...");

    // Test email configuration
    const configTest = await testEmailConfiguration();

    if (!configTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Email configuration failed",
          details: configTest.error,
          help: "Check your SMTP environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email configuration is working correctly",
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? "✓ Set" : "✗ Missing",
        pass: process.env.SMTP_PASS ? "✓ Set" : "✗ Missing",
        from: process.env.SMTP_FROM,
        practitioner: process.env.PRACTITIONER_EMAIL,
      },
    });
  } catch (error: any) {
    console.error("GET /api/test-email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        help: "Make sure all SMTP environment variables are set correctly",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/test-email - Sending test emails...");

    const body = await request.json().catch(() => ({}));
    console.log("Request body:", body);

    // Use provided email or default test email
    const testEmail = body.email || "test@example.com";

    // Send a test confirmation email
    const testBookingData = {
      clientName: body.clientName || "Test Client",
      clientEmail: testEmail,
      clientPhone: body.clientPhone || "+61 2 1234 5678",
      service: body.service || "Anxiety & Stress Relief",
      date: body.date || "2024-02-15",
      time: body.time || "10:00",
      sessionType: body.sessionType || "in-person",
      amount: body.amount || 120,
      currency: body.currency || "aud",
      paymentIntentId: body.paymentIntentId || "pi_test_123456789",
    };

    console.log("Sending test email to:", testEmail);

    // Send confirmation email
    const clientResult = await sendConfirmationEmail(testBookingData);
    console.log("Client email result:", clientResult);

    // Send practitioner notification
    const practitionerResult = await sendPractitionerNotification(
      testBookingData
    );
    console.log("Practitioner email result:", practitionerResult);

    return NextResponse.json({
      success: true,
      message: "Test emails sent successfully",
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
      testData: testBookingData,
    });
  } catch (error: any) {
    console.error("POST /api/test-email error:", error);
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
