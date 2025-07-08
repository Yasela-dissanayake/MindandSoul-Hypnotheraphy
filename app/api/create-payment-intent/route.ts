import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, booking_data } = await request.json();

    // Validate the amount
    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum amount is $0.50" },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency || "aud",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        // Store booking information in metadata
        service: booking_data.service || "",
        date: booking_data.date || "",
        time: booking_data.time || "",
        session_type: booking_data.session_type || "",
        client_name: `${booking_data.firstName || ""} ${
          booking_data.lastName || ""
        }`,
        client_email: booking_data.email || "",
        client_phone: booking_data.phone || "",
      },
      description: `Hypnotherapy Session: ${booking_data.service || ""}`,
      receipt_email: booking_data.email || undefined,
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
