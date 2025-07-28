import nodemailer from "nodemailer";
import { format } from "date-fns";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    return { success: true, message: "Email configuration is valid" };
  } catch (error) {
    console.error("Email configuration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Test email function
export async function sendTestEmail(to?: string, customData?: any) {
  try {
    const recipient = to || process.env.EMAIL_FROM || "test@example.com";

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient,
      subject: "Test Email from Mind & Soul Hypnotherapy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B7280;">Test Email</h2>
          <p>This is a test email from your Mind & Soul Hypnotherapy booking system.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          ${
            customData
              ? `
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Custom Data:</h3>
              <pre style="white-space: pre-wrap;">${JSON.stringify(
                customData,
                null,
                2
              )}</pre>
            </div>
          `
              : ""
          }
          <p style="color: #6B7280; font-size: 14px;">
            If you received this email, your email configuration is working correctly!
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: result.messageId,
      recipient: recipient,
    };
  } catch (error) {
    console.error("Error sending test email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Client booking confirmation email
export async function sendClientBookingConfirmation({
  clientName,
  clientEmail,
  service,
  date,
  time,
  sessionType,
  amount,
  currency,
  paymentIntentId,
  concerns,
}: {
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  sessionType: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  concerns: string;
}) {
  try {
    const formattedDate = format(new Date(date), "EEEE, MMMM d, yyyy");
    const isInPerson = sessionType === "in-person";

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: clientEmail,
      subject: `Booking Confirmed - ${service} Session`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #8B9A8B 0%, #A4B4A4 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Mind & Soul Hypnotherapy</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Booking Confirmation</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 24px;">Hello ${clientName}!</h2>
                <p style="color: #4a5568; line-height: 1.6; margin: 0; font-size: 16px;">
                  Thank you for booking your hypnotherapy session. Your booking has been confirmed and payment processed successfully.
                </p>
              </div>

              <!-- Booking Details Card -->
              <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #8B9A8B; padding-bottom: 10px;">
                  📅 Your Session Details
                </h3>
                
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #4a5568; font-weight: 600;">Service:</span>
                    <span style="color: #2d3748;">${service}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #4a5568; font-weight: 600;">Date:</span>
                    <span style="color: #2d3748;">${formattedDate}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #4a5568; font-weight: 600;">Time:</span>
                    <span style="color: #2d3748;">${time} (90 minutes)</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #4a5568; font-weight: 600;">Session Type:</span>
                    <span style="color: #2d3748;">${
                      isInPerson ? "In-Person" : "Online Video Call"
                    }</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #4a5568; font-weight: 600;">Investment:</span>
                    <span style="color: #2d3748; font-weight: 600;">$${amount} ${currency.toUpperCase()}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="color: #4a5568; font-weight: 600;">Payment ID:</span>
                    <span style="color: #718096; font-size: 14px;">${paymentIntentId}</span>
                  </div>
                </div>
              </div>

              ${
                isInPerson
                  ? `
                <!-- Location Details -->
                <div style="background-color: #edf2f7; border-left: 4px solid #8B9A8B; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 16px;">📍 Location & Directions</h3>
                  <p style="color: #4a5568; margin: 0 0 10px 0; line-height: 1.5;">
                    <strong>Mind & Soul Hypnotherapy</strong><br>
                    Suite 12, Level 3<br>
                    123 Wellness Street<br>
                    Sydney NSW 2000
                  </p>
                  <p style="color: #4a5568; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>Parking:</strong> Street parking available or Wilson Parking (2 blocks away)<br>
                    <strong>Public Transport:</strong> 5-minute walk from Central Station<br>
                    <strong>Building Access:</strong> Enter through main lobby, take elevator to Level 3
                  </p>
                </div>
              `
                  : `
                <!-- Online Session Details -->
                <div style="background-color: #e6fffa; border-left: 4px solid #38b2ac; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 16px;">💻 Online Session Details</h3>
                  <p style="color: #4a5568; margin: 0; line-height: 1.5;">
                    Your secure video call link will be sent to you <strong>24 hours before your session</strong>. 
                    Please ensure you have a quiet, private space and a stable internet connection.
                  </p>
                </div>
              `
              }

              <!-- Preparation Tips -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 16px;">💡 Preparing for Your Session</h3>
                <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>Arrive 5-10 minutes early ${
                    isInPerson
                      ? "to find parking and get settled"
                      : "to test your video connection"
                  }</li>
                  <li>Wear comfortable clothing</li>
                  <li>Avoid caffeine 2 hours before your session</li>
                  <li>Bring any questions or concerns you'd like to discuss</li>
                  <li>Come with an open mind and positive expectations</li>
                </ul>
              </div>

              <!-- Important Information -->
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 16px;">⚠️ Important Information</h3>
                <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li><strong>Cancellation Policy:</strong> 24-hour notice required for cancellations or rescheduling</li>
                  <li><strong>Late Arrivals:</strong> Sessions may be shortened if you arrive late</li>
                  <li><strong>Health:</strong> Please inform us of any changes to your health status before the session</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="text-align: center; padding: 20px; background-color: #f7fafc; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 16px;">Need to Contact Us?</h3>
                <p style="color: #4a5568; margin: 0 0 10px 0;">
                  📞 <strong>Phone:</strong> +61 429 940 130<br>
                  📧 <strong>Email:</strong> healwithrangika@gmail.com
                </p>
                <p style="color: #718096; margin: 0; font-size: 14px;">
                  Office Hours: Monday-Friday 9:00 AM - 6:00 PM
                </p>
              </div>

              <!-- Closing -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
                  We're looking forward to supporting you on your journey to positive change. 
                  If you have any questions before your session, please don't hesitate to reach out.
                </p>
                <p style="color: #2d3748; font-weight: 600; margin: 0;">
                  Warm regards,<br>
                  The Mind & Soul Hypnotherapy Team
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #2d3748; padding: 20px 30px; text-align: center;">
              <p style="color: #a0aec0; margin: 0; font-size: 14px;">
                Mind & Soul Hypnotherapy | Suite 12, Level 3, 123 Wellness Street, Sydney NSW 2000
              </p>
              <p style="color: #718096; margin: 10px 0 0 0; font-size: 12px;">
                This email was sent regarding your booking confirmation. Please keep this email for your records.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Client confirmation email sent:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
      recipient: clientEmail,
    };
  } catch (error) {
    console.error("❌ Error sending client confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Practitioner booking notification email
export async function sendPractitionerBookingNotification({
  clientName,
  clientEmail,
  clientPhone,
  service,
  date,
  time,
  sessionType,
  amount,
  currency,
  paymentIntentId,
  concerns,
  previousTherapy,
  emergencyContact,
  medicalConditions,
}: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  sessionType: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  concerns: string;
  previousTherapy?: string;
  emergencyContact?: string;
  medicalConditions?: string;
}) {
  try {
    const formattedDate = format(new Date(date), "EEEE, MMMM d, yyyy");
    const practitionerEmail =
      process.env.PRACTITIONER_EMAIL || process.env.EMAIL_FROM;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: practitionerEmail,
      subject: `New Booking: ${clientName} - ${service}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Booking Notification</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Mind & Soul Hypnotherapy</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 30px;">
              
              <!-- Alert -->
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
                <p style="color: #1e40af; margin: 0; font-weight: 600;">
                  🎉 New booking received and payment confirmed!
                </p>
              </div>

              <!-- Client Information -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #4a5568; padding-bottom: 8px;">
                  👤 Client Information
                </h3>
                <div style="display: grid; gap: 8px;">
                  <p style="margin: 0; color: #4a5568;"><strong>Name:</strong> ${clientName}</p>
                  <p style="margin: 0; color: #4a5568;"><strong>Email:</strong> <a href="mailto:${clientEmail}" style="color: #3b82f6;">${clientEmail}</a></p>
                  <p style="margin: 0; color: #4a5568;"><strong>Phone:</strong> <a href="tel:${clientPhone}" style="color: #3b82f6;">${clientPhone}</a></p>
                  ${
                    emergencyContact
                      ? `<p style="margin: 0; color: #4a5568;"><strong>Emergency Contact:</strong> ${emergencyContact}</p>`
                      : ""
                  }
                </div>
              </div>

              <!-- Session Details -->
              <div style="background-color: #f0fff4; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
                  📅 Session Details
                </h3>
                <div style="display: grid; gap: 8px;">
                  <p style="margin: 0; color: #4a5568;"><strong>Service:</strong> ${service}</p>
                  <p style="margin: 0; color: #4a5568;"><strong>Date:</strong> ${formattedDate}</p>
                  <p style="margin: 0; color: #4a5568;"><strong>Time:</strong> ${time} (90 minutes)</p>
                  <p style="margin: 0; color: #4a5568;"><strong>Type:</strong> ${
                    sessionType === "in-person"
                      ? "In-Person"
                      : "Online Video Call"
                  }</p>
                  <p style="margin: 0; color: #4a5568;"><strong>Amount:</strong> $${amount} ${currency.toUpperCase()}</p>
                  <p style="margin: 0; color: #718096; font-size: 14px;"><strong>Payment ID:</strong> ${paymentIntentId}</p>
                </div>
              </div>

              <!-- Client Goals & Concerns -->
              <div style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
                  🎯 Client Goals & Concerns
                </h3>
                <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b;">
                  <p style="margin: 0; color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${concerns}</p>
                </div>
              </div>

              <!-- Health & Background Information -->
              ${
                previousTherapy || medicalConditions
                  ? `
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                  <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #ef4444; padding-bottom: 8px;">
                    🏥 Health & Background Information
                  </h3>
                  
                  ${
                    previousTherapy
                      ? `
                    <div style="margin-bottom: 15px;">
                      <h4 style="color: #4a5568; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Previous Therapy Experience:</h4>
                      <div style="background-color: white; padding: 12px; border-radius: 6px; border-left: 3px solid #ef4444;">
                        <p style="margin: 0; color: #4a5568; line-height: 1.5; white-space: pre-wrap;">${previousTherapy}</p>
                      </div>
                    </div>
                  `
                      : ""
                  }
                  
                  ${
                    medicalConditions
                      ? `
                    <div>
                      <h4 style="color: #4a5568; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Medical Conditions & Medications:</h4>
                      <div style="background-color: white; padding: 12px; border-radius: 6px; border-left: 3px solid #ef4444;">
                        <p style="margin: 0; color: #4a5568; line-height: 1.5; white-space: pre-wrap;">${medicalConditions}</p>
                      </div>
                    </div>
                  `
                      : ""
                  }
                </div>
              `
                  : ""
              }

              <!-- Action Items -->
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px;">
                  ✅ Next Steps
                </h3>
                <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>Add appointment to your calendar</li>
                  <li>Review client information and prepare session plan</li>
                  <li>Send reminder email 24 hours before session</li>
                  ${
                    sessionType === "online"
                      ? "<li>Send video call link 24 hours before session</li>"
                      : "<li>Prepare in-person session room</li>"
                  }
                  <li>Follow up after session for feedback</li>
                </ul>
              </div>

              <!-- Quick Actions -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #4a5568; margin: 0 0 15px 0;">Quick Actions:</p>
                <div style="display: inline-block; margin: 0 10px;">
                  <a href="mailto:${clientEmail}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Email Client
                  </a>
                </div>
                <div style="display: inline-block; margin: 0 10px;">
                  <a href="tel:${clientPhone}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Call Client
                  </a>
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #2d3748; padding: 20px; text-align: center;">
              <p style="color: #a0aec0; margin: 0; font-size: 14px;">
                Mind & Soul Hypnotherapy Booking System
              </p>
              <p style="color: #718096; margin: 5px 0 0 0; font-size: 12px;">
                Booking received at ${new Date().toLocaleString()}
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Practitioner notification email sent:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
      recipient: practitionerEmail,
    };
  } catch (error) {
    console.error("❌ Error sending practitioner notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
