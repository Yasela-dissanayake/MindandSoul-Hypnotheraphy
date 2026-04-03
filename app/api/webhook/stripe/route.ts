import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sendClientBookingConfirmation, sendPractitionerBookingNotification } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("Payment succeeded:", paymentIntent.id)

      await handleSuccessfulPayment(paymentIntent)
      break

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent
      console.log("Payment failed:", failedPayment.id)

      await handleFailedPayment(failedPayment)
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Extract booking data from metadata
    const bookingData = {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      service: paymentIntent.metadata.service,
      date: paymentIntent.metadata.date,
      time: paymentIntent.metadata.time,
      sessionType: paymentIntent.metadata.session_type,
      clientName: paymentIntent.metadata.client_name,
      clientEmail: paymentIntent.metadata.client_email,
      clientPhone: paymentIntent.metadata.client_phone,
      concerns: paymentIntent.metadata.concerns || "",
      status: "confirmed",
      createdAt: new Date(),
    }

    console.log("Processing successful payment for:", bookingData.clientEmail)

    // Send confirmation email to client
    const clientEmailResult = await sendClientBookingConfirmation(bookingData)
    if (clientEmailResult.success) {
      console.log("✅ Confirmation email sent to client:", clientEmailResult.messageId)
    } else {
      console.error("❌ Failed to send confirmation email:", clientEmailResult.error)
    }

    // Send notification to practitioner
    const practitionerEmailResult = await sendPractitionerBookingNotification(bookingData)
    if (practitionerEmailResult.success) {
      console.log("✅ Notification sent to practitioner:", practitionerEmailResult.messageId)
    } else {
      console.error("❌ Failed to send practitioner notification:", practitionerEmailResult.error)
    }

    // TODO: Save to your database
    console.log("📝 Saving booking to database:", {
      id: bookingData.paymentIntentId,
      client: bookingData.clientName,
      service: bookingData.service,
      date: bookingData.date,
      time: bookingData.time,
      amount: bookingData.amount,
      status: bookingData.status,
    })

    // TODO: Update calendar system
    console.log("📅 Updating calendar with new booking")
  } catch (error) {
    console.error("Error handling successful payment:", error)
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("❌ Payment failed for:", paymentIntent.metadata.client_email)

    // TODO: Log failed payment attempt
    // TODO: Send failure notification if needed
    // TODO: Clean up any temporary booking data
  } catch (error) {
    console.error("Error handling failed payment:", error)
  }
}
