"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Brain,
  Heart,
  Leaf,
  CheckCircle,
  CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Shield,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Zap,
  Globe,
} from "lucide-react"
import { format, addDays, isBefore, startOfDay, isAfter, isSunday } from "date-fns"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useSearchParams } from "next/navigation"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_your_key_here")

// Stripe Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
      padding: "12px",
    },
    invalid: {
      color: "#9e2146",
    },
  },
  hidePostalCode: false,
}

// Payment Form Component
function PaymentForm({
  bookingData,
  selectedServiceData,
  selectedDate,
  selectedTime,
  sessionType,
  onPaymentSuccess,
  onPaymentError,
}: {
  bookingData: any
  selectedServiceData: any
  selectedDate: Date | undefined
  selectedTime: string
  sessionType: string
  onPaymentSuccess: (paymentIntent: any) => void
  onPaymentError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [cancellationAccepted, setCancellationAccepted] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!termsAccepted || !cancellationAccepted) {
      setPaymentError("Please accept the terms and conditions to proceed.")
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setPaymentError("Card element not found")
      setIsProcessing(false)
      return
    }

    try {
      // Create payment intent on the server
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: selectedServiceData.price * 100, // Convert to cents
          currency: "aud",
          booking_data: {
            ...bookingData,
            service: selectedServiceData.title,
            date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
            time: selectedTime,
            session_type: sessionType,
          },
        }),
      })

      const { client_secret, error } = await response.json()

      if (error) {
        setPaymentError(error)
        setIsProcessing(false)
        return
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${bookingData.firstName} ${bookingData.lastName}`,
            email: bookingData.email,
            phone: bookingData.phone,
          },
        },
      })

      if (stripeError) {
        setPaymentError(stripeError.message || "Payment failed")
        onPaymentError(stripeError.message || "Payment failed")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful - now send emails
        console.log("Payment successful, sending emails...")

        try {
          // Send confirmation emails
          const emailResponse = await fetch("/api/send-booking-emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              amount: selectedServiceData.price,
              currency: "aud",
              service: selectedServiceData.title,
              date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
              time: selectedTime,
              sessionType: sessionType,
              clientName: `${bookingData.firstName} ${bookingData.lastName}`,
              clientEmail: bookingData.email,
              clientPhone: bookingData.phone,
              concerns: bookingData.concerns,
              previousTherapy: bookingData.previousTherapy,
              emergencyContact: bookingData.emergencyContact,
              medicalConditions: bookingData.medicalConditions,
            }),
          })

          const emailResult = await emailResponse.json()

          if (emailResult.success) {
            console.log("✅ Booking emails sent successfully")
          } else {
            console.error("❌ Failed to send booking emails:", emailResult.error)
            // Don't fail the booking if emails fail - just log it
          }
        } catch (emailError) {
          console.error("Error sending booking emails:", emailError)
          // Don't fail the booking if emails fail
        }

        onPaymentSuccess(paymentIntent)
      }
    } catch (error) {
      setPaymentError("An unexpected error occurred")
      onPaymentError("An unexpected error occurred")
    }

    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Card Element */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700">Card Details</label>
        <div className="border border-stone-300 rounded-lg p-4 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-stone-600">
            I agree to the{" "}
            <a href="/terms" target="_blank" className="text-sage-600 hover:underline" rel="noreferrer">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" className="text-sage-600 hover:underline" rel="noreferrer">
              Privacy Policy
            </a>
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="cancellation"
            checked={cancellationAccepted}
            onChange={(e) => setCancellationAccepted(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="cancellation" className="text-sm text-stone-600">
            I understand the{" "}
            <a href="/terms#cancellation" target="_blank" className="text-sage-600 hover:underline" rel="noreferrer">
              cancellation policy
            </a>{" "}
            (24-hour notice required for cancellations)
          </label>
        </div>
      </div>

      {/* Error Display */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{paymentError}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing || !termsAccepted || !cancellationAccepted}
        className="w-full bg-sage-600 hover:bg-sage-700 text-white py-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Complete Booking - $${selectedServiceData?.price} AUD`
        )}
      </Button>
    </form>
  )
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [sessionType, setSessionType] = useState<string>("in-person")
  const [currentStep, setCurrentStep] = useState(1)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null)
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    concerns: "",
    previousTherapy: "",
    emergencyContact: "",
    medicalConditions: "",
  })

  // Set initial service and program from URL params
  useEffect(() => {
    const serviceParam = searchParams.get("service")
    const programParam = searchParams.get("program")
    const typeParam = searchParams.get("type")
    const packageParam = searchParams.get("package")

    if (serviceParam) {
      setSelectedService(serviceParam)
    }
    if (programParam) {
      setSelectedProgram(programParam)
    }
    if (typeParam) {
      setSessionType(typeParam)
    }
    if (packageParam) {
      setSelectedPackage(packageParam)
    }
  }, [searchParams])

  const services = [
    {
      id: "clinical-hypnotherapy",
      icon: Brain,
      title: "Clinical Hypnotherapy",
      duration: "60-90 minutes",
      price: 140,
      description: "Empowering you through subconscious healing and transformation",
      packages: [
        { id: "single", sessions: 1, price: 140, name: "Single Session" },
        { id: "3-sessions", sessions: 3, price: 390, savings: 30, name: "3 Sessions Package" },
      ],
      specialPrograms: [
        {
          id: "age-regression",
          name: "Age Regression Therapy",
          price: 190,
          duration: "90-120 minutes",
          description: "Explore and heal childhood experiences that may be affecting your present life",
        },
        {
          id: "weight-loss",
          name: "Time to Lose Weight Program",
          price: 1450,
          duration: "12-week program",
          description:
            "Comprehensive program to develop a healthy relationship with food and sustainable weight management",
        },
        {
          id: "sleep-program",
          name: "Time to Sleep Program",
          price: 1350,
          duration: "12-week program",
          description: "Overcome insomnia and develop healthy sleep patterns for restorative rest",
        },
        {
          id: "ibs-program",
          name: "Freedom from IBS Program",
          price: 1350,
          duration: "12-week program",
          description: "Address the mind-body connection to manage IBS symptoms and improve digestive health",
        },
        {
          id: "past-life",
          name: "Past Life Regression Therapy",
          price: 235,
          duration: "90-120 minutes",
          description: "Explore past life memories to understand current patterns and relationships",
        },
      ],
    },
    {
      id: "reiki-healing",
      icon: Heart,
      title: "Reiki Healing",
      duration: "60 minutes",
      price: 120, // In-person price
      description: "Restore balance, renew energy, reconnect with your inner peace",
      pricing: {
        inPerson: {
          single: 120,
          packages: [
            { id: "single", sessions: 1, price: 120, name: "Single Session" },
            { id: "3-sessions", sessions: 3, price: 320, name: "3 Sessions Package" },
          ],
        },
        distance: {
          single: 90,
          packages: [
            { id: "single", sessions: 1, price: 90, name: "Single Session" },
            { id: "3-sessions", sessions: 3, price: 250, name: "3 Sessions Package" },
            { id: "5-sessions", sessions: 5, price: 420, name: "5 Sessions Package" },
          ],
        },
      },
    },
    {
      id: "animal-reiki",
      icon: Leaf,
      title: "Animal Reiki & Communication",
      duration: "45-60 minutes",
      price: 160, // In-person price
      description: "Healing, understanding, and connection for your beloved companions",
      pricing: {
        inPerson: {
          single: 160,
          packages: [
            { id: "single", sessions: 1, price: 160, name: "Single Session" },
            { id: "3-sessions", sessions: 3, price: 450, name: "3 Sessions Package" },
            { id: "5-sessions", sessions: 5, price: 750, name: "5 Sessions Package" },
          ],
        },
        distance: {
          single: 110,
          packages: [
            { id: "single", sessions: 1, price: 110, name: "Single Session" },
            { id: "3-sessions", sessions: 3, price: 300, name: "3 Sessions Package" },
            { id: "5-sessions", sessions: 5, price: 500, name: "5 Sessions Package" },
          ],
        },
        petParentInPerson: {
          single: 250,
          packages: [
            { id: "single", sessions: 1, price: 250, name: "Single Session" },
            { id: "3-sessions", sessions: 3, price: 700, name: "3 Sessions Package" },
            { id: "5-sessions", sessions: 5, price: 1000, name: "5 Sessions Package" },
          ],
        },
        petParentDistance: {
          single: 200,
          packages: [
            { id: "single", sessions: 1, price: 200, name: "Single Session" },
            { id: "3-sessions", sessions: 3, price: 550, name: "3 Sessions Package" },
            { id: "5-sessions", sessions: 5, price: 950, name: "5 Sessions Package" },
          ],
        },
      },
    },
    {
      id: "lama-fera",
      icon: Zap,
      title: "Lama Fera Healing",
      duration: "30-45 minutes",
      price: 150, // In-person price
      description: "Ancient Tibetan healing for deep spiritual & energetic transformation",
      pricing: {
        inPerson: {
          single: 150,
          packages: [{ id: "single", sessions: 1, price: 150, name: "Single Session" }],
        },
        distance: {
          single: 120,
          packages: [{ id: "single", sessions: 1, price: 120, name: "Single Session" }],
        },
      },
    },
  ]

  // Generate available time slots
  const generateTimeSlots = (date: Date) => {
    const slots = []
    const isWeekend = date.getDay() === 6 // Only Saturday (Sunday disabled)
    const startHour = 9
    const endHour = isWeekend ? 14 : 18 // Weekend ends at 2 PM, weekdays at 6 PM

    for (let hour = startHour; hour < endHour; hour++) {
      // Create 90-minute slots starting every hour
      if (hour + 1.5 <= endHour) {
        // Ensure 90-minute slot fits
        const time = `${hour.toString().padStart(2, "0")}:00`
        slots.push(time)
      }
    }
    return slots
  }

  // Mock unavailable slots (would come from backend)
  const unavailableSlots = ["10:00", "14:00", "15:00"]

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : []
  const availableSlots = timeSlots.filter((slot) => !unavailableSlots.includes(slot))

  const selectedServiceData = services.find((s) => s.id === selectedService)

  // Get the selected program if any
  const selectedProgramData = selectedServiceData?.specialPrograms?.find((p) => p.id === selectedProgram)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime("") // Reset time when date changes
  }

  const handleInputChange = (field: string, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentSuccess(true)
    setBookingConfirmation({
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
    })
    // Here you would typically save the booking to your database
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
    // Handle payment error (show notification, etc.)
  }

  const canProceedToStep2 = selectedService && selectedDate && selectedTime && sessionType
  const canProceedToStep3 = bookingData.firstName && bookingData.lastName && bookingData.email && bookingData.phone
  const canProceedToStep4 = true // All fields in step 3 are optional

  // Get current service price based on selection
  const getCurrentPrice = () => {
    if (selectedProgramData) {
      return selectedProgramData.price
    }

    if (selectedServiceData?.pricing) {
      // Handle different session types
      let pricingSection = null

      if (sessionType === "in-person") {
        pricingSection = selectedServiceData.pricing.inPerson
      } else if (sessionType === "distance") {
        pricingSection = selectedServiceData.pricing.distance
      } else if (sessionType === "pet-parent-in-person") {
        pricingSection = selectedServiceData.pricing.petParentInPerson
      } else if (sessionType === "pet-parent-distance") {
        pricingSection = selectedServiceData.pricing.petParentDistance
      }

      if (pricingSection && selectedPackage) {
        const packageData = pricingSection.packages?.find((pkg: any) => pkg.id === selectedPackage)
        if (packageData) {
          return packageData.price
        }
      }

      if (pricingSection) {
        return pricingSection.single
      }
    }

    // Fallback for services with simple pricing (like clinical hypnotherapy)
    if (selectedServiceData?.packages && selectedPackage) {
      const packageData = selectedServiceData.packages.find((pkg: any) => pkg.id === selectedPackage)
      if (packageData) {
        return packageData.price
      }
    }

    return selectedServiceData?.price || 0
  }

  const getCurrentTitle = () => {
    if (selectedProgramData) {
      return selectedProgramData.name
    }

    let title = selectedServiceData?.title || ""

    // Add session type info
    if (sessionType === "pet-parent-in-person") {
      title += " (Pet & Parent - In-Person)"
    } else if (sessionType === "pet-parent-distance") {
      title += " (Pet & Parent - Distance)"
    } else if (sessionType === "distance") {
      title += " (Distance)"
    } else if (sessionType === "in-person") {
      title += " (In-Person)"
    }

    // Add package info
    if (selectedPackage && selectedServiceData) {
      let packageData = null

      if (selectedServiceData.pricing) {
        const pricingSection =
          selectedServiceData.pricing[
            sessionType === "in-person"
              ? "inPerson"
              : sessionType === "distance"
                ? "distance"
                : sessionType === "pet-parent-in-person"
                  ? "petParentInPerson"
                  : "petParentDistance"
          ]
        packageData = pricingSection?.packages?.find((pkg: any) => pkg.id === selectedPackage)
      } else if (selectedServiceData.packages) {
        packageData = selectedServiceData.packages.find((pkg: any) => pkg.id === selectedPackage)
      }

      if (packageData && packageData.sessions > 1) {
        title += ` - ${packageData.sessions} Sessions`
      }
    }

    return title
  }

  const getCurrentDuration = () => {
    if (selectedProgramData) {
      return selectedProgramData.duration
    }
    return selectedServiceData?.duration || ""
  }

  // Get available packages for current service and session type
  const getAvailablePackages = () => {
    if (!selectedServiceData) return []

    if (selectedServiceData.pricing) {
      let pricingSection = null

      if (sessionType === "in-person") {
        pricingSection = selectedServiceData.pricing.inPerson
      } else if (sessionType === "distance") {
        pricingSection = selectedServiceData.pricing.distance
      } else if (sessionType === "pet-parent-in-person") {
        pricingSection = selectedServiceData.pricing.petParentInPerson
      } else if (sessionType === "pet-parent-distance") {
        pricingSection = selectedServiceData.pricing.petParentDistance
      }

      return pricingSection?.packages || []
    }

    return selectedServiceData.packages || []
  }

  // Success page
  if (paymentSuccess && bookingConfirmation) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8">
          <Card className="border-green-200">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-serif text-stone-800">Booking Confirmed!</h1>
              <p className="text-stone-600">
                Thank you for booking your healing session. You will receive a confirmation email shortly with all the
                details.
              </p>

              <div className="bg-stone-50 p-6 rounded-lg space-y-3 text-left">
                <h3 className="font-semibold text-stone-800">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Service:</strong> {getCurrentTitle()}
                    </p>
                    <p>
                      <strong>Date:</strong> {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedTime}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Type:</strong> {sessionType === "in-person" ? "In-Person" : "Distance Healing"}
                    </p>
                    <p>
                      <strong>Amount Paid:</strong> ${bookingConfirmation.amount} {bookingConfirmation.currency}
                    </p>
                    <p>
                      <strong>Payment ID:</strong> {bookingConfirmation.paymentIntentId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-stone-800">What's Next?</h3>
                <ul className="text-sm text-stone-600 space-y-2 text-left">
                  <li>• You'll receive a confirmation email within 5 minutes</li>
                  <li>
                    •{" "}
                    {sessionType === "online"
                      ? "Video call link will be sent 24 hours before your session"
                      : "Address and parking details are in your confirmation email"}
                  </li>
                  <li>• If you need to reschedule, please contact us at least 24 hours in advance</li>
                  <li>• Prepare any questions you'd like to discuss during your session</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => (window.location.href = "/")} className="bg-sage-600 hover:bg-sage-700">
                  Return to Home
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/booking/manage")}>
                  Manage Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <Badge className="bg-sage-100 text-sage-700">Book Your Session</Badge>
            <h1 className="text-3xl lg:text-4xl font-serif text-stone-800">Schedule Your Healing Session</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Book your personalized healing session in just a few simple steps. Choose your preferred service, date,
              and time.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 bg-white border-b border-stone-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: "Service & Time", icon: CalendarIcon },
              { step: 2, title: "Your Details", icon: User },
              { step: 3, title: "Health Info", icon: Shield },
              { step: 4, title: "Payment", icon: CreditCard },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div
                  className={`flex items-center gap-3 ${currentStep >= item.step ? "text-sage-600" : "text-stone-400"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= item.step
                        ? "bg-sage-600 border-sage-600 text-white"
                        : "border-stone-300 text-stone-400"
                    }`}
                  >
                    {currentStep > item.step ? <CheckCircle className="h-5 w-5" /> : <item.icon className="h-5 w-5" />}
                  </div>
                  <span className="hidden md:block font-medium">{item.title}</span>
                </div>
                {index < 3 && (
                  <ArrowRight
                    className={`h-5 w-5 mx-4 ${currentStep > item.step ? "text-sage-600" : "text-stone-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Step 1: Service & Time Selection */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-sage-600" />
                      Select Service & Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Service Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-stone-800">Choose Your Service</h3>
                      <div className="grid gap-4">
                        {services.map((service) => (
                          <div key={service.id} className="space-y-4">
                            {/* Main Service */}
                            <Card
                              className={`cursor-pointer transition-all ${
                                selectedService === service.id && !selectedProgram
                                  ? "ring-2 ring-sage-600 border-sage-600"
                                  : "border-stone-200 hover:border-sage-300"
                              }`}
                              onClick={() => {
                                setSelectedService(service.id)
                                setSelectedProgram("")
                                // Reset package selection when changing service
                                setSelectedPackage("")
                              }}
                            >
                              <CardContent className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-sage-100 rounded-lg">
                                    <service.icon className="h-5 w-5 text-sage-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-stone-800 text-sm">{service.title}</h4>
                                    <p className="text-xs text-stone-600">{service.description}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-stone-500">{service.duration}</span>
                                    <span className="font-semibold text-sage-600">From ${service.price}</span>
                                  </div>

                                  {/* Show pricing options */}
                                  {service.pricing && (
                                    <div className="text-xs text-stone-500 space-y-1">
                                      {service.pricing.inPerson && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          <span>In-Person: ${service.pricing.inPerson.single}</span>
                                        </div>
                                      )}
                                      {service.pricing.distance && (
                                        <div className="flex items-center gap-1">
                                          <Globe className="h-3 w-3" />
                                          <span>Distance: ${service.pricing.distance.single}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {service.packages && (
                                    <div className="text-xs text-sage-600">
                                      Package: {service.packages[1]?.sessions} sessions for $
                                      {service.packages[1]?.price}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Special Programs */}
                            {service.specialPrograms && (
                              <div className="ml-4 space-y-2">
                                <h5 className="text-sm font-medium text-stone-700">Special Programs:</h5>
                                <div className="grid gap-2">
                                  {service.specialPrograms.map((program) => (
                                    <Card
                                      key={program.id}
                                      className={`cursor-pointer transition-all ${
                                        selectedService === service.id && selectedProgram === program.id
                                          ? "ring-2 ring-sage-600 border-sage-600"
                                          : "border-stone-200 hover:border-sage-300"
                                      }`}
                                      onClick={() => {
                                        setSelectedService(service.id)
                                        setSelectedProgram(program.id)
                                        setSelectedPackage("")
                                      }}
                                    >
                                      <CardContent className="p-3 space-y-2">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <h6 className="font-medium text-stone-800 text-sm">{program.name}</h6>
                                            <p className="text-xs text-stone-600 mt-1">{program.description}</p>
                                          </div>
                                          <span className="font-semibold text-sage-600 text-sm whitespace-nowrap ml-2">
                                            ${program.price}
                                          </span>
                                        </div>
                                        <div className="text-xs text-stone-500">{program.duration}</div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Session Type Selection */}
                    {selectedService && !selectedProgram && selectedServiceData?.pricing && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-stone-800">Session Type</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* In-Person Option */}
                          {selectedServiceData.pricing.inPerson && (
                            <Card
                              className={`cursor-pointer transition-all ${
                                sessionType === "in-person"
                                  ? "ring-2 ring-sage-600 border-sage-600"
                                  : "border-stone-200 hover:border-sage-300"
                              }`}
                              onClick={() => {
                                setSessionType("in-person")
                                setSelectedPackage("")
                              }}
                            >
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                  <MapPin className="h-5 w-5 text-sage-600" />
                                  <h4 className="font-semibold text-stone-800">In-Person Session</h4>
                                </div>
                                <p className="text-sm text-stone-600">Visit our peaceful practice in Sydney</p>
                                <p className="text-xs text-stone-500">
                                  Suite 12, Level 3, 123 Wellness Street, Sydney NSW
                                </p>
                                <p className="text-sm font-semibold text-sage-600">
                                  ${selectedServiceData.pricing.inPerson.single} per session
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Distance Option */}
                          {selectedServiceData.pricing.distance && (
                            <Card
                              className={`cursor-pointer transition-all ${
                                sessionType === "distance"
                                  ? "ring-2 ring-sage-600 border-sage-600"
                                  : "border-stone-200 hover:border-sage-300"
                              }`}
                              onClick={() => {
                                setSessionType("distance")
                                setSelectedPackage("")
                              }}
                            >
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                  <Globe className="h-5 w-5 text-sage-600" />
                                  <h4 className="font-semibold text-stone-800">Distance Healing</h4>
                                </div>
                                <p className="text-sm text-stone-600">Secure video call from your home</p>
                                <p className="text-xs text-stone-500">Available Australia-wide</p>
                                <p className="text-sm font-semibold text-sage-600">
                                  ${selectedServiceData.pricing.distance.single} per session
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Pet & Parent Options */}
                          {selectedServiceData.pricing.petParentInPerson && (
                            <Card
                              className={`cursor-pointer transition-all ${
                                sessionType === "pet-parent-in-person"
                                  ? "ring-2 ring-sage-600 border-sage-600"
                                  : "border-stone-200 hover:border-sage-300"
                              }`}
                              onClick={() => {
                                setSessionType("pet-parent-in-person")
                                setSelectedPackage("")
                              }}
                            >
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                  <MapPin className="h-5 w-5 text-sage-600" />
                                  <h4 className="font-semibold text-stone-800">Pet & Parent In-Person</h4>
                                </div>
                                <p className="text-sm text-stone-600">Healing for both you and your pet</p>
                                <p className="text-sm font-semibold text-sage-600">
                                  ${selectedServiceData.pricing.petParentInPerson.single} per session
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {selectedServiceData.pricing.petParentDistance && (
                            <Card
                              className={`cursor-pointer transition-all ${
                                sessionType === "pet-parent-distance"
                                  ? "ring-2 ring-sage-600 border-sage-600"
                                  : "border-stone-200 hover:border-sage-300"
                              }`}
                              onClick={() => {
                                setSessionType("pet-parent-distance")
                                setSelectedPackage("")
                              }}
                            >
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-3">
                                  <Globe className="h-5 w-5 text-sage-600" />
                                  <h4 className="font-semibold text-stone-800">Pet & Parent Distance</h4>
                                </div>
                                <p className="text-sm text-stone-600">Remote healing for both you and your pet</p>
                                <p className="text-sm font-semibold text-sage-600">
                                  ${selectedServiceData.pricing.petParentDistance.single} per session
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Package Selection */}
                    {selectedService && !selectedProgram && sessionType && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-stone-800">Choose Package</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          {getAvailablePackages().map((pkg: any) => (
                            <Card
                              key={pkg.id}
                              className={`cursor-pointer transition-all ${
                                selectedPackage === pkg.id
                                  ? "ring-2 ring-sage-600 border-sage-600"
                                  : "border-stone-200 hover:border-sage-300"
                              }`}
                              onClick={() => setSelectedPackage(pkg.id)}
                            >
                              <CardContent className="p-4 space-y-2 text-center">
                                <h4 className="font-semibold text-stone-800">{pkg.name}</h4>
                                <div className="text-2xl font-bold text-sage-600">${pkg.price}</div>
                                {pkg.sessions > 1 && (
                                  <div className="text-xs text-stone-500">
                                    ${Math.round(pkg.price / pkg.sessions)} per session
                                  </div>
                                )}
                                {pkg.savings && (
                                  <div className="text-xs text-green-600 font-medium">Save ${pkg.savings}</div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date & Time Selection */}
                    {(selectedService && selectedProgram) || (selectedService && sessionType && selectedPackage) ? (
                      <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-stone-800">Select Date</h3>
                          <div className="border border-stone-200 rounded-lg bg-white p-4">
                            <div className="calendar-wrapper">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => {
                                  const today = startOfDay(new Date())
                                  const maxDate = addDays(new Date(), 90)
                                  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

                                  // Always disable past dates, future dates beyond 90 days, and Sundays
                                  if (isBefore(date, today) || isAfter(date, maxDate) || isSunday(date)) {
                                    return true
                                  }

                                  // Session type-based availability
                                  if (sessionType === "in-person" || sessionType === "pet-parent-in-person") {
                                    // In-person sessions: only Saturdays (day 6)
                                    return dayOfWeek !== 6
                                  } else {
                                    // Online sessions: Monday-Friday (1-5) and Saturday (6)
                                    return dayOfWeek === 0 // Only disable Sunday (already handled above, but for clarity)
                                  }
                                }}
                                className="w-full"
                                initialFocus
                                fromDate={new Date()}
                                toDate={addDays(new Date(), 90)}
                                showOutsideDays={false}
                              />
                            </div>
                          </div>
                          {selectedDate && (
                            <div className="text-sm text-stone-600 bg-sage-50 p-3 rounded-lg">
                              <strong>Selected:</strong> {format(selectedDate, "EEEE, MMMM d, yyyy")}
                            </div>
                          )}
                          <div className="text-xs text-stone-500 bg-blue-50 p-2 rounded">
                            <strong>Note:</strong>
                            {sessionType === "in-person" || sessionType === "pet-parent-in-person"
                              ? " In-person sessions are only available on Saturdays (9:00 AM - 2:00 PM). Sundays are closed."
                              : " Distance healing sessions are available Monday-Saturday. Saturday hours: 9:00 AM - 2:00 PM. Sundays are closed."}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-stone-800">
                            Available Times
                            {selectedDate && (
                              <span className="text-sm font-normal text-stone-600 ml-2">
                                for {format(selectedDate, "MMM d")}
                              </span>
                            )}
                          </h3>
                          {selectedDate ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-4 border border-stone-200 rounded-lg bg-white">
                                {availableSlots.length > 0 ? (
                                  availableSlots.map((time) => (
                                    <Button
                                      key={time}
                                      variant={selectedTime === time ? "default" : "outline"}
                                      size="sm"
                                      className={`text-sm h-12 ${
                                        selectedTime === time
                                          ? "bg-sage-600 hover:bg-sage-700 text-white"
                                          : "border-stone-300 hover:border-sage-300 hover:bg-sage-50"
                                      }`}
                                      onClick={() => setSelectedTime(time)}
                                    >
                                      <div className="text-center">
                                        <div className="font-medium">{time}</div>
                                        <div className="text-xs opacity-75">90 min</div>
                                      </div>
                                    </Button>
                                  ))
                                ) : (
                                  <div className="col-span-2 text-center py-8 text-stone-500">
                                    <Clock className="h-8 w-8 mx-auto mb-2 text-stone-400" />
                                    <p>No available slots for this date</p>
                                    <p className="text-xs mt-1">Please select another date</p>
                                  </div>
                                )}
                              </div>
                              {selectedDate.getDay() === 6 && (
                                <p className="text-xs text-stone-500 bg-blue-50 p-2 rounded">
                                  <strong>Saturday hours:</strong> 9:00 AM - 2:00 PM
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-stone-500 border border-stone-200 rounded-lg bg-stone-50">
                              <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-stone-400" />
                              <p>Please select a date first</p>
                              <p className="text-xs mt-1">Choose from available dates in the calendar</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Summary */}
                    {(selectedServiceData || selectedProgramData) && selectedDate && selectedTime && (
                      <div className="bg-sage-50 p-6 rounded-lg space-y-3 border border-sage-200">
                        <h4 className="font-semibold text-stone-800 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-sage-600" />
                          Booking Summary
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-stone-600">
                          <div className="space-y-1">
                            <p>
                              <strong>Service:</strong> {getCurrentTitle()}
                            </p>
                            <p>
                              <strong>Duration:</strong> {getCurrentDuration()}
                            </p>
                            <p>
                              <strong>Investment:</strong> ${getCurrentPrice()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p>
                              <strong>Date:</strong> {format(selectedDate, "EEEE, MMMM d, yyyy")}
                            </p>
                            <p>
                              <strong>Time:</strong> {selectedTime}
                            </p>
                            <p>
                              <strong>Type:</strong>{" "}
                              {sessionType.includes("pet-parent")
                                ? "Pet & Parent"
                                : sessionType === "in-person"
                                  ? "In-Person"
                                  : "Distance Healing"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={nextStep} disabled={!canProceedToStep2} className="bg-sage-600 hover:bg-sage-700">
                    Continue to Personal Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-sage-600" />
                      Your Personal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">First Name *</label>
                        <input
                          type="text"
                          required
                          value={bookingData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={bookingData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={bookingData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={bookingData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="+61 xxx xxx xxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        What would you like to work on? *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={bookingData.concerns}
                        onChange={(e) => handleInputChange("concerns", e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="Please describe your goals and what you'd like to achieve through your healing session..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Emergency Contact Name & Phone
                      </label>
                      <input
                        type="text"
                        value={bookingData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="Name and phone number"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={nextStep} disabled={!canProceedToStep3} className="bg-sage-600 hover:bg-sage-700">
                    Continue to Health Information
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Health Information */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-sage-600" />
                      Health & Background Information
                    </CardTitle>
                    <p className="text-sm text-stone-600">
                      This information helps us provide the best possible care. All information is confidential.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Have you had hypnotherapy or counseling before?
                      </label>
                      <textarea
                        rows={3}
                        value={bookingData.previousTherapy}
                        onChange={(e) => handleInputChange("previousTherapy", e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="Please describe any previous therapy experience..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Do you have any medical conditions or take medications?
                      </label>
                      <textarea
                        rows={3}
                        value={bookingData.medicalConditions}
                        onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                        placeholder="Please list any medical conditions, medications, or health concerns..."
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-800 mb-2">Important Note</h4>
                      <p className="text-sm text-amber-700">
                        Our healing services are complementary and not a substitute for medical treatment. If you have
                        serious mental health concerns, please consult with your healthcare provider. We may recommend
                        you seek medical clearance before proceeding.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={nextStep} className="bg-sage-600 hover:bg-sage-700">
                    Continue to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Payment with Stripe */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-sage-600" />
                      Payment & Confirmation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Booking Summary */}
                    <div className="bg-stone-50 p-6 rounded-lg space-y-4">
                      <h4 className="font-semibold text-stone-800">Booking Summary</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p>
                            <strong>Client:</strong> {bookingData.firstName} {bookingData.lastName}
                          </p>
                          <p>
                            <strong>Email:</strong> {bookingData.email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {bookingData.phone}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p>
                            <strong>Service:</strong> {getCurrentTitle()}
                          </p>
                          <p>
                            <strong>Date:</strong> {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </p>
                          <p>
                            <strong>Time:</strong> {selectedTime}
                          </p>
                          <p>
                            <strong>Type:</strong>{" "}
                            {sessionType.includes("pet-parent")
                              ? "Pet & Parent"
                              : sessionType === "in-person"
                                ? "In-Person"
                                : "Distance Healing"}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-stone-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-sage-600">${getCurrentPrice()} AUD</span>
                        </div>
                      </div>
                    </div>

                    {/* Stripe Payment Form */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-stone-800">Payment Details</h4>

                      <Elements stripe={stripePromise}>
                        <PaymentForm
                          bookingData={bookingData}
                          selectedServiceData={{
                            title: getCurrentTitle(),
                            price: getCurrentPrice(),
                          }}
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                          sessionType={sessionType}
                          onPaymentSuccess={handlePaymentSuccess}
                          onPaymentError={handlePaymentError}
                        />
                      </Elements>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">Secure Payment</h4>
                      </div>
                      <p className="text-sm text-green-700">
                        Your payment is processed securely by Stripe. We never store your credit card details.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-start">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <Phone className="h-8 w-8 text-sage-600 mx-auto" />
                <h3 className="font-semibold text-stone-800">Need Help?</h3>
                <p className="text-sm text-stone-600">Call us at +61 429 940 130</p>
              </div>
              <div className="space-y-2">
                <Mail className="h-8 w-8 text-sage-600 mx-auto" />
                <h3 className="font-semibold text-stone-800">Email Support</h3>
                <p className="text-sm text-stone-600">healwithrangika@gmail.com</p>
              </div>
              <div className="space-y-2">
                <Clock className="h-8 w-8 text-sage-600 mx-auto" />
                <h3 className="font-semibold text-stone-800">Booking Hours</h3>
                <p className="text-sm text-stone-600">Mon-Fri: 9AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
