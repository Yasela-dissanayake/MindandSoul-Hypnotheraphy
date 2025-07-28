import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Heal With Rangika ("we," "our," or "us") is committed
                to protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                visit our website and use our services.
              </p>
              <p className="text-gray-700">
                This policy applies to all information collected through our
                website, services, and any related services, sales, marketing,
                or events.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Personal Information
              </h4>
              <p className="text-gray-700">
                We may collect the following personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  Name and contact information (email, phone number, address)
                </li>
                <li>Date of birth and age</li>
                <li>Health information relevant to hypnotherapy treatment</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Session preferences and goals</li>
                <li>Communication records and session notes</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6">
                Technical Information
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>IP address and browser information</li>
                <li>Device information and operating system</li>
                <li>Website usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6">
                Health Information
              </h4>
              <p className="text-gray-700">
                We collect health information necessary for providing safe and
                effective hypnotherapy services, including medical history,
                current medications, and mental health status.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Providing hypnotherapy services and treatment</li>
                <li>Processing bookings and payments</li>
                <li>Communicating about appointments and services</li>
                <li>Maintaining treatment records and session notes</li>
                <li>Improving our services and website functionality</li>
                <li>
                  Sending appointment reminders and follow-up communications
                </li>
                <li>Complying with legal and regulatory requirements</li>
                <li>Protecting against fraud and ensuring security</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                4. Legal Basis for Processing (GDPR)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Under GDPR, we process your personal data based on:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Consent:</strong> You have given clear consent for
                  processing your personal data
                </li>
                <li>
                  <strong>Contract:</strong> Processing is necessary for
                  performing our services
                </li>
                <li>
                  <strong>Legal Obligation:</strong> Processing is required by
                  law
                </li>
                <li>
                  <strong>Vital Interests:</strong> Processing is necessary to
                  protect health and safety
                </li>
                <li>
                  <strong>Legitimate Interests:</strong> Processing is necessary
                  for our legitimate business interests
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                5. Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                We DO NOT sell your personal information.
              </h4>

              <h4 className="font-semibold text-gray-900 mt-6">
                We may share information with:
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Service Providers:</strong> Stripe for payment
                  processing, email services for communications
                </li>
                <li>
                  <strong>Healthcare Professionals:</strong> With your consent,
                  for coordinated care
                </li>
                <li>
                  <strong>Legal Authorities:</strong> When required by law or to
                  protect rights and safety
                </li>
                <li>
                  <strong>Professional Bodies:</strong> For regulatory
                  compliance and professional standards
                </li>
              </ul>

              <h4 className="font-semibold text-gray-900 mt-6">
                Third-Party Services
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Stripe:</strong> Secure payment processing (PCI DSS
                  compliant)
                </li>
                <li>
                  <strong>Email Services:</strong> For appointment confirmations
                  and communications
                </li>
                <li>
                  <strong>Analytics:</strong> Website usage analytics
                  (anonymized data)
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                6. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We implement appropriate security measures to protect your
                information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>SSL encryption for data transmission</li>
                <li>Secure servers and databases</li>
                <li>Regular security updates and monitoring</li>
                <li>Access controls and authentication</li>
                <li>Staff training on data protection</li>
                <li>Regular security audits and assessments</li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                <p className="text-blue-800">
                  <strong>Note:</strong> While we strive to protect your
                  information, no method of transmission over the internet is
                  100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                7. Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We retain your information for the following periods:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Treatment Records:</strong> 7 years after last session
                  (professional requirement)
                </li>
                <li>
                  <strong>Payment Records:</strong> 6 years (tax and accounting
                  requirements)
                </li>
                <li>
                  <strong>Marketing Communications:</strong> Until you
                  unsubscribe
                </li>
                <li>
                  <strong>Website Analytics:</strong> 26 months (anonymized)
                </li>
                <li>
                  <strong>Session Recordings:</strong> Deleted immediately after
                  session (if applicable)
                </li>
              </ul>

              <p className="text-gray-700 mt-4">
                After retention periods expire, we securely delete or anonymize
                your information.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                8. Your Rights (GDPR)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Under GDPR, you have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Right to Access:</strong> Request copies of your
                  personal data
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Request correction of
                  inaccurate data
                </li>
                <li>
                  <strong>Right to Erasure:</strong> Request deletion of your
                  data (subject to legal requirements)
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> Request
                  limitation of data processing
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Request transfer
                  of your data
                </li>
                <li>
                  <strong>Right to Object:</strong> Object to processing based
                  on legitimate interests
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Withdraw consent
                  at any time
                </li>
              </ul>

              <p className="text-gray-700 mt-4">
                To exercise these rights, please contact us using the
                information provided below.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                9. Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                Types of Cookies We Use:
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Essential Cookies:</strong> Required for website
                  functionality
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand website
                  usage
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings
                  and preferences
                </li>
              </ul>

              <p className="text-gray-700 mt-4">
                You can control cookies through your browser settings. Disabling
                certain cookies may affect website functionality.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                10. International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Your information may be transferred to and processed in
                countries outside the UK/EU. We ensure appropriate safeguards
                are in place, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Adequacy decisions by the European Commission</li>
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                11. Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Our services are not intended for children under 16. We do not
                knowingly collect personal information from children under 16.
                If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us.
              </p>
              <p className="text-gray-700">
                For clients aged 16-18, we require parental consent before
                providing services.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                12. Changes to This Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending email notifications for significant changes</li>
              </ul>

              <p className="text-gray-700 mt-4">
                You are advised to review this Privacy Policy periodically for
                any changes.
              </p>
            </CardContent>
          </Card>

          {/* <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-[#3c4a3c]">
                13. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or wish to
                exercise your rights, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Data Protection Officer:</strong>{" "}
                  privacy@mindandsoulhypnotherapy.com
                </p>
                <p className="text-gray-700">
                  <strong>General Inquiries:</strong>{" "}
                  info@mindandsoulhypnotherapy.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +44 (0) 123 456 7890
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> 123 Wellness Street, London, UK
                </p>
              </div>

              <h4 className="font-semibold text-gray-900 mt-6">
                Supervisory Authority
              </h4>
              <p className="text-gray-700">
                You have the right to lodge a complaint with the Information
                Commissioner's Office (ICO) if you believe we have not handled
                your personal data appropriately.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-2">
                <p className="text-gray-700">
                  <strong>ICO Website:</strong> ico.org.uk
                </p>
                <p className="text-gray-700">
                  <strong>ICO Helpline:</strong> 0303 123 1113
                </p>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
