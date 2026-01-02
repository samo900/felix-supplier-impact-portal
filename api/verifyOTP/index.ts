import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

// Share this with sendOTP (use external storage in production)
const otpStore = new Map<string, { code: string; expiresAt: number; accountId: string }>();

interface VerifyOTPRequest {
  email: string;
  code: string;
}

export async function verifyOTP(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Processing verifyOTP request');

  try {
    const body = await request.json() as VerifyOTPRequest;
    const { email, code } = body;

    if (!email || !code) {
      return {
        status: 400,
        jsonBody: { error: "Email and code are required" }
      };
    }

    const emailLower = email.toLowerCase();
    const storedOTP = otpStore.get(emailLower);

    if (!storedOTP) {
      return {
        status: 401,
        jsonBody: { error: "Invalid or expired OTP" }
      };
    }

    // Check expiration
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(emailLower);
      return {
        status: 401,
        jsonBody: { error: "OTP has expired" }
      };
    }

    // Verify code
    if (storedOTP.code !== code) {
      return {
        status: 401,
        jsonBody: { error: "Invalid OTP code" }
      };
    }

    // OTP is valid - delete it and create session token
    otpStore.delete(emailLower);

    const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
    const token = jwt.sign(
      {
        email: emailLower,
        accountId: storedOTP.accountId,
        role: 'supplier'
      },
      sessionSecret,
      { expiresIn: '8h' }
    );

    return {
      status: 200,
      jsonBody: {
        success: true,
        token,
        accountId: storedOTP.accountId,
        email: emailLower
      }
    };

  } catch (error) {
    context.error('Error verifying OTP:', error);
    return {
      status: 500,
      jsonBody: { error: "Failed to verify OTP" }
    };
  }
}

app.http('verifyOTP', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: verifyOTP
});
