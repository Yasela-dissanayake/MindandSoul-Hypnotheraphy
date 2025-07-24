import nodemailer from "nodemailer";
import { format } from "date-fns";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
export const generateConfirmationEmailHTML = (bookingData: any) => {
  const {
    clientName,
    service,
    date,
    time,
    sessionType,
    amount,
    currency,
    paymentIntentId,
    clientEmail,
    clientPhone,
    concerns,
    previousTherapy,
    emergencyContact,
    medicalConditions,
  } = bookingData;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - Mind and Soul Works</title>
      <style>
        body {
          font-family: Georgia, serif;
          line-height: 1.6;
          color: #292524;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fafaf9;
        }
        .header {
          background: linear-gradient(135deg, #f5f5f4 0%, #e3e7e3 100%);
          padding: 30px;
          text-align: center;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .logo {
          color: #5c735c;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .confirmation-badge {
          background-color: #dcfce7;
          color: #166534;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 20px;
        }
        .booking-details {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e7e5e4;
        }
        .detail-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: #5c735c;
        }
        .detail-label {
          font-weight: 600;
          color: #57534e;
        }
        .detail-value {
          color: #292524;
        }
        .next-steps {
          background: #f6f7f6;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .next-steps h3 {
          color: #292524;
          margin-bottom: 15px;
          font-size: 20px;
        }
        .next-steps ul {
          margin: 0;
          padding-left: 20px;
        }
        .next-steps li {
          margin-bottom: 10px;
          color: #57534e;
        }
        .location-info {
          background: #e3e7e3;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .contact-info {
          background: white;
          padding: 25px;
          border-radius: 12px;
          text-align: center;
        }
        .contact-info h3 {
          color: #5c735c;
          margin-bottom: 15px;
        }
        .contact-details {
          color: #57534e;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e7e5e4;
          color: #78716c;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #5c735c;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 10px 5px;
        }
        .preparation-section {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .header, .booking-details, .next-steps, .location-info, .contact-info {
            padding: 20px;
          }
          .detail-row {
            flex-direction: column;
            gap: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🌿 Mind and Soul Works</div>
        <div class="confirmation-badge">✓ Booking Confirmed</div>
        <h1 style="margin: 0; color: #292524;">Your Session is Booked!</h1>
        <p style="margin: 10px 0 0 0; color: #57534e;">Thank you for choosing Mind and Soul Works for your healing journey.</p>
      </div>

      <div class="booking-details">
        <h2 style="color: #5c735c; margin-bottom: 20px;">Booking Details</h2>
        <div class="detail-row">
          <span class="detail-label">Client Name:</span>
          <span class="detail-value">${clientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${service}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${format(
            new Date(date),
            "EEEE, MMMM d, yyyy"
          )}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${time} (90 minutes)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Session Type:</span>
          <span class="detail-value">${
            sessionType === "in-person" ? "In-Person" : "Online Session"
          }</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount Paid:</span>
          <span class="detail-value">$${amount} ${currency.toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment ID:</span>
          <span class="detail-value">${paymentIntentId}</span>
        </div>
      </div>

      <div class="preparation-section">
        <h3 style="color: #92400e; margin-bottom: 15px;">🎯 Preparing for Your Session</h3>
        <p style="color: #92400e; margin-bottom: 10px;"><strong>What to expect:</strong></p>
        <ul style="color: #92400e; margin: 0; padding-left: 20px;">
          <li>We'll discuss your goals and concerns</li>
          <li>I'll explain the hypnotherapy process</li>
          <li>You'll experience a gentle, relaxing session</li>
          <li>You'll leave feeling calm and optimistic</li>
        </ul>
        <p style="color: #92400e; margin-top: 15px;"><strong>Tips:</strong> Wear comfortable clothes, avoid caffeine beforehand, and come with an open mind.</p>
      </div>

      ${
        sessionType === "in-person"
          ? `
        <div class="location-info">
          <h3 style="color: #5c735c; margin-bottom: 15px;">📍 Location Details</h3>
          <p><strong>Address:</strong><br>
          Suite 12, Level 3<br>
          123 Wellness Street<br>
          Sydney NSW 2000</p>
          
          <p><strong>Parking:</strong> Secure parking available in building ($5/hour)</p>
          <p><strong>Public Transport:</strong> 2-minute walk from Town Hall Station</p>
          <p><strong>Accessibility:</strong> Wheelchair accessible with lift access</p>
          
          <p style="margin-top: 15px; padding: 10px; background: rgba(92, 115, 92, 0.1); border-radius: 8px;">
            <strong>Please arrive 10 minutes early</strong> to complete any remaining paperwork and settle in.
          </p>
        </div>
      `
          : `
        <div class="location-info">
          <h3 style="color: #5c735c; margin-bottom: 15px;">💻 Online Session Details</h3>
          <p><strong>Video Call Link:</strong> Will be sent 24 hours before your session</p>
          <p><strong>Platform:</strong> Secure, encrypted video call</p>
          <p><strong>Technical Requirements:</strong></p>
          <ul>
            <li>Stable internet connection</li>
            <li>Quiet, private space</li>
            <li>Computer, tablet, or smartphone with camera and microphone</li>
            <li>Comfortable seating</li>
          </ul>
          
          <p style="margin-top: 15px; padding: 10px; background: rgba(92, 115, 92, 0.1); border-radius: 8px;">
            <strong>Test your setup</strong> 30 minutes before the session. We'll send a test link with your session details.
          </p>
        </div>
      `
      }

      <div class="next-steps">
        <h3>What's Next?</h3>
        <ul>
          <li><strong>Confirmation received:</strong> Keep this email for your records</li>
          <li><strong>${
            sessionType === "online" ? "Video call link" : "Final reminders"
          }:</strong> Will be sent 24 hours before your session</li>
          <li><strong>Rescheduling:</strong> Contact us at least 24 hours in advance if needed</li>
          <li><strong>Preparation:</strong> Come with an open mind and any questions you'd like to discuss</li>
          <li><strong>Cancellation policy:</strong> 24+ hours notice for full refund, less than 24 hours incurs 50% fee</li>
        </ul>
      </div>

      <div class="contact-info">
        <h3>Need to Contact Us?</h3>
        <div class="contact-details">
          <strong>Phone:</strong> +61 2 1234 5678<br>
          <strong>Email:</strong> hello@mindandsoul.com.au<br>
          <strong>Hours:</strong> Mon-Fri 9AM-6PM, Sat 9AM-2PM
        </div>
        
        <div style="margin-top: 20px;">
          <a href="mailto:hello@mindandsoul.com.au" class="button">Contact Us</a>
          <a href="${
            process.env.NEXT_PUBLIC_SITE_URL
          }/booking/manage" class="button">Manage Booking</a>
        </div>
      </div>

      <div class="footer">
        <p>This email was sent to ${clientEmail}</p>
        <p>Mind and Soul Works Australia | Holistic Healing for Mind, Body & Soul</p>
        <p style="margin-top: 15px;">
          <a href="${
            process.env.NEXT_PUBLIC_SITE_URL
          }" style="color: #5c735c;">Visit our website</a> | 
          <a href="${
            process.env.NEXT_PUBLIC_SITE_URL
          }/contact" style="color: #5c735c;">Contact us</a>
        </p>
      </div>
    </body>
    </html>
  `;
};

// Send confirmation email to client
export async function sendConfirmationEmail(bookingData: any) {
  try {
    const mailOptions = {
      from: {
        name: "Mind and Soul Works",
        address:
          process.env.SMTP_FROM ||
          process.env.SMTP_USER ||
          "noreply@mindandsoul.com.au",
      },
      to: bookingData.clientEmail,
      subject: `Booking Confirmed - ${bookingData.service} on ${format(
        new Date(bookingData.date),
        "MMM d, yyyy"
      )}`,
      html: generateConfirmationEmailHTML(bookingData),
      text: `
        Booking Confirmation - Mind and Soul Works
        
        Dear ${bookingData.clientName},
        
        Your hypnotherapy session has been confirmed!
        
        Booking Details:
        - Service: ${bookingData.service}
        - Date: ${format(new Date(bookingData.date), "EEEE, MMMM d, yyyy")}
        - Time: ${bookingData.time}
        - Type: ${
          bookingData.sessionType === "in-person"
            ? "In-Person"
            : "Online Session"
        }
        - Amount: $${bookingData.amount} ${bookingData.currency.toUpperCase()}
        - Payment ID: ${bookingData.paymentIntentId}
        
        ${
          bookingData.sessionType === "in-person"
            ? "Location: Suite 12, Level 3, 123 Wellness Street, Sydney NSW 2000"
            : "Video call link will be sent 24 hours before your session"
        }
        
        What's Next:
        - Keep this email for your records
        - You'll receive session details 24 hours before your appointment
        - Contact us at least 24 hours in advance if you need to reschedule
        - Prepare any questions you'd like to discuss
        
        Contact us: +61 2 1234 5678 | hello@mindandsoul.com.au
        
        Thank you for choosing Mind and Soul Works!
        
        Best regards,
        Rangika Mathew
        Mind and Soul Works Australia
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return { success: false, error: error.message };
  }
}

// Send notification email to practitioner
export async function sendPractitionerNotification(bookingData: any) {
  try {
    const mailOptions = {
      from: {
        name: "Mind and Soul Works Booking System",
        address:
          process.env.SMTP_FROM ||
          process.env.SMTP_USER ||
          "bookings@mindandsoul.com.au",
      },
      to: process.env.PRACTITIONER_EMAIL || "rangika@mindandsoul.com.au",
      subject: `New Booking: ${bookingData.service} - ${bookingData.clientName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #5c735c;">🎉 New Booking Received</h2>
          
          <div style="background: #f6f7f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>👤 Client Information</h3>
            <p><strong>Name:</strong> ${bookingData.clientName}</p>
            <p><strong>Email:</strong> ${bookingData.clientEmail}</p>
            <p><strong>Phone:</strong> ${bookingData.clientPhone}</p>
            ${
              bookingData.emergencyContact
                ? `<p><strong>Emergency Contact:</strong> ${bookingData.emergencyContact}</p>`
                : ""
            }
          </div>
          
          <div style="background: #e3e7e3; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📅 Session Details</h3>
            <p><strong>Service:</strong> ${bookingData.service}</p>
            <p><strong>Date:</strong> ${format(
              new Date(bookingData.date),
              "EEEE, MMMM d, yyyy"
            )}</p>
            <p><strong>Time:</strong> ${bookingData.time}</p>
            <p><strong>Type:</strong> ${
              bookingData.sessionType === "in-person"
                ? "In-Person"
                : "Online Session"
            }</p>
            <p><strong>Amount:</strong> $${
              bookingData.amount
            } ${bookingData.currency.toUpperCase()}</p>
          </div>

          ${
            bookingData.concerns
              ? `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🎯 Client's Goals & Concerns</h3>
            <p>${bookingData.concerns}</p>
          </div>
          `
              : ""
          }

          ${
            bookingData.previousTherapy
              ? `
          <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Previous Therapy Experience</h3>
            <p>${bookingData.previousTherapy}</p>
          </div>
          `
              : ""
          }

          ${
            bookingData.medicalConditions
              ? `
          <div style="background: #fce7f3; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🏥 Medical Information</h3>
            <p>${bookingData.medicalConditions}</p>
          </div>
          `
              : ""
          }
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>💳 Payment Information</h3>
            <p><strong>Status:</strong> ✅ Paid</p>
            <p><strong>Payment ID:</strong> ${bookingData.paymentIntentId}</p>
            <p><strong>Processed:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e7e5e4;">
            <p><strong>📝 Next Steps:</strong></p>
            <ul>
              <li>Add to calendar</li>
              <li>Prepare session materials</li>
              <li>Send session reminder 24 hours before</li>
              ${
                bookingData.sessionType === "online"
                  ? "<li>Send video call link</li>"
                  : "<li>Prepare in-person session room</li>"
              }
              <li>Review client's goals and medical information</li>
            </ul>
          </div>
        </div>
      `,
      text: `
        New Booking Received - Mind and Soul Works
        
        Client: ${bookingData.clientName}
        Email: ${bookingData.clientEmail}
        Phone: ${bookingData.clientPhone}
        ${
          bookingData.emergencyContact
            ? `Emergency Contact: ${bookingData.emergencyContact}`
            : ""
        }
        
        Service: ${bookingData.service}
        Date: ${format(new Date(bookingData.date), "EEEE, MMMM d, yyyy")}
        Time: ${bookingData.time}
        Type: ${
          bookingData.sessionType === "in-person"
            ? "In-Person"
            : "Online Session"
        }
        
        ${bookingData.concerns ? `Goals/Concerns: ${bookingData.concerns}` : ""}
        ${
          bookingData.previousTherapy
            ? `Previous Therapy: ${bookingData.previousTherapy}`
            : ""
        }
        ${
          bookingData.medicalConditions
            ? `Medical Info: ${bookingData.medicalConditions}`
            : ""
        }
        
        Payment: $${
          bookingData.amount
        } ${bookingData.currency.toUpperCase()} (Paid)
        Payment ID: ${bookingData.paymentIntentId}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Practitioner notification sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending practitioner notification:", error);
    return { success: false, error: error.message };
  }
}

// Test email configuration
export async function testEmailConfiguration() {
  try {
    await transporter.verify();
    console.log("Email configuration is valid");
    return { success: true };
  } catch (error: any) {
    console.error("Email configuration error:", error);
    return { success: false, error: error.message };
  }
}
