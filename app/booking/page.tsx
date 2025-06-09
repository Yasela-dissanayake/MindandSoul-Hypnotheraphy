"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  Brain,
  Heart,
  Leaf,
  CheckCircle,
  Star,
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
} from "lucide-react"
import { format } from "date-fns"

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [sessionType, setSessionType] = useState<string>("in-person")
  const [currentStep, setCurrentStep] = useState(1)
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

  const services = [
    {
      id: "anxiety",
      icon: Brain,
      title: "Anxiety & Stress Relief",
      duration: "90 minutes",
      price: 120,
      description: "Reduce anxiety and develop coping strategies",
    },
    {
      id: "confidence",
      icon: Heart,
      title: "Confidence Building",
      duration: "90 minutes",
      price: 120,
      description: "Build self-confidence and self-esteem",
    },
    {
      id: "habits",
      icon: Leaf,
      title: "Habit Change",
      duration: "90 minutes",
      price: 120,
      description: "Break unwanted habits and create positive patterns",
    },
    {
      id: "weight",
      icon: CheckCircle,
      title: "Weight Management",
      duration: "90 minutes",
      price: 120,
      description: "Develop healthy relationship with food",
    },
    {
      id: "sleep",
      icon: Star,
      title: "Sleep Improvement",
      duration: "90 minutes",
      price: 120,
      description: "Overcome insomnia and improve sleep quality",
    },
    {
      id: "pain",
      icon: CalendarIcon,
      title: "Pain Management",
      duration: "90 minutes",
      price: 120,
      description: "Manage chronic pain naturally",
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
  const unavailableSlots = ["10:30", "14:00", "15:30"]

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : []
  const availableSlots = timeSlots.filter((slot) => !unavailableSlots.includes(slot))

  const selectedServiceData = services.find((s) => s.id === selectedService)

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

  const canProceedToStep2 = selectedService && selectedDate && selectedTime && sessionType
  const canProceedToStep3 = bookingData.firstName && bookingData.lastName && bookingData.email && bookingData.phone
  const canProceedToStep4 = true // All fields in step 3 are optional

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <Badge className="bg-sage-100 text-sage-700">Book Your Session</Badge>
            <h1 className="text-3xl lg:text-4xl font-serif text-stone-800">Schedule Your Hypnotherapy Session</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Book your personalized hypnotherapy session in just a few simple steps. Choose your preferred service,
              date, and time.
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
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map((service) => (
                          <Card
                            key={service.id}
                            className={`cursor-pointer transition-all ${
                              selectedService === service.id
                                ? "ring-2 ring-sage-600 border-sage-600"
                                : "border-stone-200 hover:border-sage-300"
                            }`}
                            onClick={() => setSelectedService(service.id)}
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
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-stone-500">{service.duration}</span>
                                <span className="font-semibold text-sage-600">${service.price}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Session Type */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-stone-800">Session Type</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card
                          className={`cursor-pointer transition-all ${
                            sessionType === "in-person"
                              ? "ring-2 ring-sage-600 border-sage-600"
                              : "border-stone-200 hover:border-sage-300"
                          }`}
                          onClick={() => setSessionType("in-person")}
                        >
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-5 w-5 text-sage-600" />
                              <h4 className="font-semibold text-stone-800">In-Person Session</h4>
                            </div>
                            <p className="text-sm text-stone-600">Visit our peaceful practice in Perth</p>
                            <p className="text-xs text-stone-500">Suite 12, Level 3, 123 Wellness Street, Perth NSW</p>
                          </CardContent>
                        </Card>

                        <Card
                          className={`cursor-pointer transition-all ${
                            sessionType === "online"
                              ? "ring-2 ring-sage-600 border-sage-600"
                              : "border-stone-200 hover:border-sage-300"
                          }`}
                          onClick={() => setSessionType("online")}
                        >
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-3">
                              <User className="h-5 w-5 text-sage-600" />
                              <h4 className="font-semibold text-stone-800">Online Session</h4>
                            </div>
                            <p className="text-sm text-stone-600">Secure video call from your home</p>
                            <p className="text-xs text-stone-500">Available Australia-wide</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>  

                    {/* Date & Time Selection */}
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-stone-800">Select Date</h3>
                        <div className="border border-stone-200 rounded-lg p-4 bg-white">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={(date) => {
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return date < today || date.getDay() === 0 // Disable past dates and Sundays
                            }}
                            className="w-full"
                            autoFocus
                          />
                        </div>
                        {selectedDate && (
                          <div className="text-sm text-stone-600 bg-sage-50 p-3 rounded-lg">
                            <strong>Selected:</strong> {format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </div>
                        )}
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
                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border border-stone-200 rounded-lg bg-white">
                              {availableSlots.length > 0 ? (
                                availableSlots.map((time) => (
                                  <Button
                                    key={time}
                                    variant={selectedTime === time ? "default" : "outline"}
                                    size="sm"
                                    className={`text-sm ${
                                      selectedTime === time
                                        ? "bg-sage-600 hover:bg-sage-700 text-white"
                                        : "border-stone-300 hover:border-sage-300 hover:bg-sage-50"
                                    }`}
                                    onClick={() => setSelectedTime(time)}
                                  >
                                    {time}
                                  </Button>
                                ))
                              ) : (
                                <div className="col-span-2 text-center py-4 text-stone-500">
                                  No available slots for this date
                                </div>
                              )}
                            </div>
                            {selectedDate.getDay() === 6 && (
                              <p className="text-xs text-stone-500">Saturday hours: 9:00 AM - 2:00 PM</p>
                            )}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-stone-500 border border-stone-200 rounded-lg bg-stone-50">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-stone-400" />
                            <p>Please select a date first</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedServiceData && selectedDate && selectedTime && (
                      <div className="bg-sage-50 p-4 rounded-lg space-y-2">
                        <h4 className="font-semibold text-stone-800">Booking Summary</h4>
                        <div className="text-sm text-stone-600 space-y-1">
                          <p>
                            <strong>Service:</strong> {selectedServiceData.title}
                          </p>
                          <p>
                            <strong>Date:</strong> {format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </p>
                          <p>
                            <strong>Time:</strong> {selectedTime}
                          </p>
                          <p>
                            <strong>Duration:</strong> {selectedServiceData.duration}
                          </p>
                          <p>
                            <strong>Type:</strong> {sessionType === "in-person" ? "In-Person" : "Online"}
                          </p>
                          <p>
                            <strong>Investment:</strong> ${selectedServiceData.price}
                          </p>
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
                        placeholder="Please describe your goals and what you'd like to achieve through hypnotherapy..."
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
                        Hypnotherapy is not a substitute for medical treatment. If you have serious mental health
                        concerns, please consult with your healthcare provider. We may recommend you seek medical
                        clearance before proceeding.
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

            {/* Step 4: Payment */}
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
                            <strong>Service:</strong> {selectedServiceData?.title}
                          </p>
                          <p>
                            <strong>Date:</strong> {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </p>
                          <p>
                            <strong>Time:</strong> {selectedTime}
                          </p>
                          <p>
                            <strong>Type:</strong> {sessionType === "in-person" ? "In-Person" : "Online"}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-stone-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-sage-600">${selectedServiceData?.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-stone-800">Payment Options</h4>

                      <Tabs defaultValue="card" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="card">Credit Card</TabsTrigger>
                          <TabsTrigger value="paypal">PayPal</TabsTrigger>
                          <TabsTrigger value="afterpay">Afterpay</TabsTrigger>
                        </TabsList>

                        <TabsContent value="card" className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">Card Number</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                                placeholder="1234 5678 9012 3456"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">Cardholder Name</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                                placeholder="John Smith"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">Expiry Date</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">CVV</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="paypal" className="space-y-4">
                          <div className="text-center py-8">
                            <p className="text-stone-600 mb-4">
                              You will be redirected to PayPal to complete your payment
                            </p>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Continue with PayPal</Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="afterpay" className="space-y-4">
                          <div className="text-center py-8">
                            <p className="text-stone-600 mb-4">
                              Pay in 4 interest-free installments of $
                              {selectedServiceData ? selectedServiceData.price / 4 : 0}
                            </p>
                            <Button className="bg-mint-600 hover:bg-mint-700 text-white">Continue with Afterpay</Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" id="terms" className="mt-1" />
                        <label htmlFor="terms" className="text-sm text-stone-600">
                          I agree to the{" "}
                          <a href="#" className="text-sage-600 hover:underline">
                            Terms and Conditions
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-sage-600 hover:underline">
                            Privacy Policy
                          </a>
                        </label>
                      </div>

                      <div className="flex items-start gap-3">
                        <input type="checkbox" id="cancellation" className="mt-1" />
                        <label htmlFor="cancellation" className="text-sm text-stone-600">
                          I understand the{" "}
                          <a href="#" className="text-sage-600 hover:underline">
                            cancellation policy
                          </a>{" "}
                          (24-hour notice required for cancellations)
                        </label>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">Secure Payment</h4>
                      </div>
                      <p className="text-sm text-green-700">
                        Your payment information is encrypted and secure. We never store your credit card details.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button className="bg-sage-600 hover:bg-sage-700 text-white px-8">
                    Complete Booking - ${selectedServiceData?.price}
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
                <p className="text-sm text-stone-600">Call us at +61 2 1234 5678</p>
              </div>
              <div className="space-y-2">
                <Mail className="h-8 w-8 text-sage-600 mx-auto" />
                <h3 className="font-semibold text-stone-800">Email Support</h3>
                <p className="text-sm text-stone-600">hello@mindandsoul.com.au</p>
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
