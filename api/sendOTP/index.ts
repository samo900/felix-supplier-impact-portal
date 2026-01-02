import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { EmailClient } from "@azure/communication-email";
import * as crypto from "crypto";

// In-memory OTP storage (use Redis or Azure Table Storage in production)
const otpStore = new Map<string, { code: string; expiresAt: number; accountId: string }>();

interface SendOTPRequest {
  email: string;
}

export async function sendOTP(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Processing sendOTP request');

  try {
    const body = await request.json() as SendOTPRequest;
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return {
        status: 400,
        jsonBody: { error: "Valid email is required" }
      };
    }

    // TODO: Verify email exists in supplier database and get accountId
    // For now, we'll use email as accountId
    const accountId = await getAccountIdForEmail(email);
    
    if (!accountId) {
      return {
        status: 404,
        jsonBody: { error: "Supplier not found. Please contact support." }
      };
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email.toLowerCase(), {
      code: otpCode,
      expiresAt,
      accountId
    });

    // Send email via Azure Communication Services
    const connectionString = process.env.COMMUNICATION_SERVICES_CONNECTION_STRING;
    
    if (!connectionString) {
      context.error("COMMUNICATION_SERVICES_CONNECTION_STRING not configured");
      // In development, just log the OTP
      context.log(`OTP for ${email}: ${otpCode}`);
      return {
        status: 200,
        jsonBody: { 
          message: "OTP sent successfully",
          dev_otp: otpCode // Remove in production!
        }
      };
    }

    const emailClient = new EmailClient(connectionString);
    
    const emailMessage = {
      senderAddress: process.env.SENDER_EMAIL || "noreply@yourdomain.com",
      content: {
        subject: "Your Supplier Portal Access Code",
        plainText: `Your one-time password is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Supplier Portal Access</h2>
              <p>Your one-time password is:</p>
              <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${otpCode}
              </div>
              <p style="color: #666;">This code will expire in 10 minutes.</p>
              <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
            </body>
          </html>
        `
      },
      recipients: {
        to: [{ address: email }]
      }
    };

    const poller = await emailClient.beginSend(emailMessage);
    await poller.pollUntilDone();

    return {
      status: 200,
      jsonBody: { message: "OTP sent successfully" }
    };

  } catch (error) {
    context.error('Error sending OTP:', error);
    return {
      status: 500,
      jsonBody: { error: "Failed to send OTP" }
    };
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function getAccountIdForEmail(email: string): Promise<string | null> {
  // TODO: Query your database to get the accountId for this supplier email
  // This is where you'd check if the email exists in your supplier table
  // and return the associated accountId
  
  // For now, return email as accountId (replace with actual DB query)
  // Example with SQL:
  // const result = await db.query('SELECT accountId FROM suppliers WHERE email = ?', [email]);
  // return result.rows[0]?.accountId || null;
  
  return email; // Placeholder
}

module.exports = sendOTP;
