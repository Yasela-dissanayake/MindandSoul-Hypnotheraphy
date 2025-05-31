"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, MapPin, User, Phone, Mail, Edit, Trash2, Download, MessageCircle } from "lucide-react"
import { format, addDays } from "date-fns"

export default function ManageBookingPage() {
  const [searchEmail, setSearchEmail] = useState("")
  const [searchBookingId, setSearchBookingId] = useState("")

  // Mock booking data
  const mockBookings = [
    {
      id: "BK001",
      service: "Anxiety & Stress Relief",
      date: addDays(new Date(), 7),
      time: "10:00",
      duration: "90 minutes",
      type: "in-person",
      status: "confirmed",
      client: {
        name: "Sarah Mitchell",
        email: "sarah.mitchell@email.com",
        phone: "+61 2 1234 5678",
      },
      price: 120,
      paymentStatus: "paid",
    },
    {
      id: "BK002",
      service: "Weight Management",
      date: addDays(new Date(), 14),
      time: "14:00",
      duration: "90 minutes",
      type: "online",
      status: "confirmed",
      client: {
        name: "James Thompson",
        email: "james.thompson@email.com",
        phone: "+61 3 9876 5432",
      },
      price: 120,
      paymentStatus: "paid",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-stone-100 text-stone-700"
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-stone-100 to-sage-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl font-serif text-stone-800">Manage Your Booking</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
              View, modify, or cancel your hypnotherapy appointments. Need help? Contact us anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Find Your Booking</CardTitle>
                <p className="text-sm text-stone-600">
                  Enter your email address or booking ID to view and manage your appointments.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="text-center text-stone-500">or</div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Booking ID</label>
                  <input
                    type="text"
                    value={searchBookingId}
                    onChange={(e) => setSearchBookingId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                    placeholder="BK001"
                  />
                </div>

                <Button className="w-full bg-sage-600 hover:bg-sage-700">Find My Bookings</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bookings Display */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-serif text-stone-800">Your Bookings</h2>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past Sessions</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6">
                {mockBookings.map((booking) => (
                  <Card key={booking.id} className="border-stone-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-stone-800">{booking.service}</h3>
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          </div>
                          <p className="text-sm text-stone-600">Booking ID: {booking.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-sage-600">${booking.price}</p>
                          <p className="text-sm text-stone-500">{booking.paymentStatus}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-sage-600" />
                            <div>
                              <p className="font-medium text-stone-800">{format(booking.date, "EEEE, MMMM d, yyyy")}</p>
                              <p className="text-sm text-stone-600">
                                {booking.time} ({booking.duration})
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-sage-600" />
                            <div>
                              <p className="font-medium text-stone-800">
                                {booking.type === "in-person" ? "In-Person Session" : "Online Session"}
                              </p>
                              <p className="text-sm text-stone-600">
                                {booking.type === "in-person"
                                  ? "Suite 12, Level 3, 123 Wellness Street, Sydney"
                                  : "Video call link will be sent 24 hours before"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-sage-600" />
                            <div>
                              <p className="font-medium text-stone-800">{booking.client.name}</p>
                              <p className="text-sm text-stone-600">{booking.client.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-sage-600" />
                            <p className="text-stone-600">{booking.client.phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-stone-200">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Reschedule
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reschedule Appointment</DialogTitle>
                              <DialogDescription>
                                Select a new date and time for your appointment. Changes must be made at least 24 hours
                                in advance.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-stone-600">
                                Current appointment: {format(booking.date, "EEEE, MMMM d, yyyy")} at {booking.time}
                              </p>
                              {/* Add calendar and time selection here */}
                              <div className="flex gap-2">
                                <Button className="bg-sage-600 hover:bg-sage-700">Confirm Reschedule</Button>
                                <Button variant="outline">Cancel</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cancel Appointment</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to cancel this appointment? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h4 className="font-semibold text-amber-800 mb-2">Cancellation Policy</h4>
                                <ul className="text-sm text-amber-700 space-y-1">
                                  <li>• 24+ hours notice: Full refund</li>
                                  <li>• Less than 24 hours: 50% cancellation fee</li>
                                  <li>• No-show: Full session fee applies</li>
                                </ul>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="destructive">Confirm Cancellation</Button>
                                <Button variant="outline">Keep Appointment</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </Button>

                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Practitioner
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="past">
                <div className="text-center py-12">
                  <p className="text-stone-600">No past sessions found.</p>
                </div>
              </TabsContent>

              <TabsContent value="cancelled">
                <div className="text-center py-12">
                  <p className="text-stone-600">No cancelled bookings found.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-serif text-stone-800">Need Assistance?</h2>
              <p className="text-stone-600">Our team is here to help with any booking questions or concerns.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <Card className="border-stone-200">
                <CardContent className="p-6 space-y-3">
                  <Phone className="h-8 w-8 text-sage-600 mx-auto" />
                  <h3 className="font-semibold text-stone-800">Phone Support</h3>
                  <p className="text-sm text-stone-600">+61 2 1234 5678</p>
                  <p className="text-xs text-stone-500">Mon-Fri: 9AM-6PM</p>
                </CardContent>
              </Card>

              <Card className="border-stone-200">
                <CardContent className="p-6 space-y-3">
                  <Mail className="h-8 w-8 text-sage-600 mx-auto" />
                  <h3 className="font-semibold text-stone-800">Email Support</h3>
                  <p className="text-sm text-stone-600">hello@mindandsoul.com.au</p>
                  <p className="text-xs text-stone-500">Response within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="border-stone-200">
                <CardContent className="p-6 space-y-3">
                  <MessageCircle className="h-8 w-8 text-sage-600 mx-auto" />
                  <h3 className="font-semibold text-stone-800">Live Chat</h3>
                  <p className="text-sm text-stone-600">Instant assistance</p>
                  <Button size="sm" className="bg-sage-600 hover:bg-sage-700">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
