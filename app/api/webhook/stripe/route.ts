import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

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

      // Here you would typically:
      // 1. Save the booking to your database
      // 2. Send confirmation email to the client
      // 3. Send notification to the practitioner
      // 4. Update your calendar/booking system

      await handleSuccessfulPayment(paymentIntent)
      break

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object as Stripe.PaymentIntent
      console.log("Payment failed:", failedPayment.id)

      // Handle failed payment
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
      status: "confirmed",
      createdAt: new Date(),
    }

    // TODO: Save to your database
    console.log("Saving booking to database:", bookingData)

    // TODO: Send confirmation email
    console.log("Sending confirmation email to:", bookingData.clientEmail)

    // TODO: Send notification to practitioner
    console.log("Notifying practitioner of new booking")

    // TODO: Update calendar system
    console.log("Updating calendar with new booking")
  } catch (error) {
    console.error("Error handling successful payment:", error)
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    // TODO: Log failed payment
    console.log("Payment failed for:", paymentIntent.metadata.client_email)

    // TODO: Send failure notification if needed
  } catch (error) {
    console.error("Error handling failed payment:", error)
  }
}
