import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { confirmBookingPayment, releaseHold, stripe } from "@/lib/booking-payments"
import { fulfilPurchase, markPurchaseFailed } from "@/lib/learning"
import { fulfilCoursePurchase, markCoursePurchaseFailed } from "@/lib/course-sales"

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe().webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        // Backup for the booking page: saves the booking and sends the emails if the
        // browser closed before it could (emails are only ever sent once).
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        if (paymentIntent.metadata?.kind === "learning_package") await fulfilPurchase(paymentIntent.id)
        else if (paymentIntent.metadata?.kind === "course") await fulfilCoursePurchase(paymentIntent.id)
        else await confirmBookingPayment(paymentIntent.id)
        break
      }
      case "payment_intent.payment_failed": {
        const failed = event.data.object as Stripe.PaymentIntent
        if (failed.metadata?.kind === "learning_package") await markPurchaseFailed(failed.id)
        else if (failed.metadata?.kind === "course") await markCoursePurchaseFailed(failed.id)
        else await releaseHold(failed.id)
        break
      }
      default:
        break
    }
  } catch (error) {
    console.error(`Error handling ${event.type}:`, error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
