import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms and Conditions
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                By accessing and using the Heal With Rangika website and
                services, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
              </p>
              <p className="text-gray-700">
                These terms apply to all visitors, users, and others who access
                or use our services.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                2. Services Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Heal With Rangika provides professional hypnotherapy services
                including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Individual hypnotherapy sessions (in-person and online)</li>
                <li>Stress and anxiety management</li>
                <li>Weight management support</li>
                <li>Smoking cessation programs</li>
                <li>Sleep improvement therapy</li>
                <li>Confidence building sessions</li>
              </ul>
              <p className="text-gray-700">
                All services are provided by qualified and certified
                hypnotherapists.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                3. Booking and Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold text-gray-900">Booking Policy</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  All bookings must be made through our online booking system
                </li>
                <li>Payment is required at the time of booking</li>
                <li>In-person sessions are available on Saturdays only</li>
                <li>Online sessions are available Monday through Saturday</li>
                <li>No sessions are available on Sundays</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6">
                Payment Terms
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>All payments are processed securely through Stripe</li>
                <li>Prices are listed in AUD and include applicable taxes</li>
                <li>Payment confirmation will be sent via email</li>
                <li>We accept major credit and debit cards</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                4. Cancellation and Refund Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Cancellation by Client
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  Cancellations made 48+ hours before appointment: Full refund
                </li>
                <li>
                  Cancellations made 24-48 hours before appointment: 50% refund
                </li>
                <li>
                  Cancellations made less than 24 hours before appointment: No
                  refund
                </li>
                <li>No-shows: No refund</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6">
                Cancellation by Practitioner
              </h4>
              <p className="text-gray-700">
                If we need to cancel your appointment, you will receive a full
                refund and priority rebooking options.
              </p>

              <h4 className="font-semibold text-gray-900 mt-6">
                Refund Processing
              </h4>
              <p className="text-gray-700">
                Approved refunds will be processed within 5-10 business days to
                the original payment method.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                5. Client Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate and complete health information</li>
                <li>Arrive on time for appointments (in-person sessions)</li>
                <li>Ensure stable internet connection for online sessions</li>
                <li>
                  Inform us of any changes in health status or medications
                </li>
                <li>Follow pre-session preparation guidelines</li>
                <li>Maintain confidentiality of session content</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                6. Health and Safety Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-semibold">
                  Important Medical Disclaimer
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Hypnotherapy is a complementary therapy and not a substitute
                  for medical treatment
                </li>
                <li>
                  Always consult your healthcare provider before starting
                  hypnotherapy
                </li>
                <li>
                  Continue taking prescribed medications unless advised
                  otherwise by your doctor
                </li>
                <li>
                  Inform us of any mental health conditions or medications
                </li>
                <li>Results may vary and are not guaranteed</li>
                <li>Some individuals may not be suitable for hypnotherapy</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                7. Confidentiality and Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We maintain strict confidentiality regarding all client
                information and session content. Your personal data is protected
                in accordance with our Privacy Policy and applicable data
                protection laws.
              </p>
              <p className="text-gray-700">
                Session recordings (if any) are used solely for therapeutic
                purposes and are securely stored and disposed of appropriately.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                8. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Heal With Rangika shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use,
                goodwill, or other intangible losses, resulting from your use of
                our services.
              </p>
              <p className="text-gray-700">
                Our total liability shall not exceed the amount paid for the
                specific service in question.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                9. Modifications to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Changes
                will be posted on this page with an updated revision date.
                Continued use of our services after changes constitutes
                acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          {/* <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                10. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                If you have any questions about these Terms and Conditions,
                please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> info@mindandsoulhypnotherapy.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +44 (0) 123 456 7890
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> 123 Wellness Street, London, UK
                </p>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
