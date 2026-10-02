import crypto from "crypto";
import nodemailer from "nodemailer";
import { otpDb, isPostgresConfigured } from "@/lib/db/postgres";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_SECONDS = 60;

// In-memory rate limiting map: identifier -> lastRequestedTimestamp (ms)
const rateLimitMap = new Map<string, number>();

/**
 * Generates a SHA-256 hash of the OTP combined with salt
 */
function hashOtp(otp: string, identifier: string): string {
  const secret = process.env.AUTH_SECRET || "civsetu_default_otp_salt";
  return crypto
    .createHmac("sha256", secret)
    .update(`${identifier.trim().toLowerCase()}:${otp.trim()}`)
    .digest("hex");
}

/**
 * Verifies if Gmail SMTP environment variables are configured.
 */
export function isEmailConfigured(): boolean {
  return !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
}

/**
 * Verifies if Twilio environment variables are configured.
 */
export function isTwilioConfigured(): boolean {
  return (
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_PHONE_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID.startsWith("AC") &&
    !process.env.TWILIO_ACCOUNT_SID.includes("XXXXX")
  );
}

/**
 * Dispatches an email OTP via Gmail SMTP.
 */
async function sendGmailOtp(toEmail: string, rawOtp: string, purpose: "registration" | "password_reset"): Promise<boolean> {
  const user = process.env.EMAIL_USER!;
  const pass = process.env.EMAIL_PASS!.replace(/\s+/g, "");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const isReg = purpose === "registration";
  const subject = isReg
    ? "CivSetu - Your Citizen Registration OTP"
    : "CivSetu - Password Reset Verification Code";

  const actionText = isReg
    ? "verify and complete your citizen registration"
    : "reset your citizen portal password";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <tr>
      <td style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">CivSetu • ಸಿವ್‌ಸೇತು</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Lakshmeshwar Town Municipal Council (TMC)</p>
      </td>
    </tr>
    <!-- Content Body -->
    <tr>
      <td style="padding: 32px 32px 24px 32px; color: #1e293b;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #0f172a;">Citizen Identity Verification</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
          Please use the following One-Time Password (OTP) to ${actionText} on the CivSetu civic portal:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 16px 36px;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1e40af; font-family: monospace;">${rawOtp}</span>
          </div>
        </div>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #dc2626; font-weight: 500; text-align: center;">
          ⏱️ This code is valid for ${OTP_EXPIRY_MINUTES} minutes.
        </p>
        <p style="margin: 16px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
          <strong>Security Notice:</strong> If you did not initiate this request, please disregard this email. Never share your verification code with anyone.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.4;">
        Government of Karnataka • Lakshmeshwar Town Municipal Council<br/>
        Public Information Grievance Redressal System (PIGRS Helpline: 1902)
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"CivSetu Portal" <${user}>`,
    to: toEmail,
    subject,
    html: htmlContent,
    text: `Your CivSetu portal OTP is ${rawOtp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share with anyone.`,
  });

  return true;
}

/**
 * Dispatches an SMS via Twilio REST API.
 */
async function sendTwilioSms(toMobile: string, messageBody: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER!;

  let formattedTo = toMobile.trim();
  if (!formattedTo.startsWith("+")) {
    formattedTo = `+91${formattedTo}`;
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const formBody = new URLSearchParams();
  formBody.append("To", formattedTo);
  formBody.append("From", fromPhone);
  formBody.append("Body", messageBody);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
  });

  if (!res.ok) {
    console.error("Twilio SMS dispatch failed with status:", res.status);
    throw new Error(`Failed to send SMS via Twilio: HTTP ${res.status}`);
  }

  return true;
}

export interface SendOtpResult {
  success: boolean;
  error?: string;
  expiresInSeconds?: number;
  deliveryChannel?: "email" | "sms" | "mock";
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

export const otpService = {
  /**
   * Generates and dispatches a secure 6-digit OTP (via Gmail or SMS).
   */
  async sendOtp(
    identifier: string,
    purpose: "registration" | "password_reset"
  ): Promise<SendOtpResult> {
    if (!isPostgresConfigured()) {
      return {
        success: false,
        error:
          "Database connection is not configured. Please define DATABASE_URL in your environment.",
      };
    }

    const rawId = identifier.trim();
    const isEmail = rawId.includes("@");
    const cleanIdentifier = isEmail ? rawId.toLowerCase() : rawId.replace(/\D/g, "");

    // 1. Rate Limiting Check
    const now = Date.now();
    const lastSent = rateLimitMap.get(cleanIdentifier);
    if ((isEmailConfigured() || isTwilioConfigured()) && lastSent && now - lastSent < RATE_LIMIT_SECONDS * 1000) {
      const waitSeconds = Math.ceil((RATE_LIMIT_SECONDS * 1000 - (now - lastSent)) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
      };
    }

    // 2. Generate 6-digit cryptographically secure OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHashed = hashOtp(rawOtp, cleanIdentifier);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // 3. Persist OTP hash to database
    await otpDb.saveOtp({
      identifier: cleanIdentifier,
      purpose,
      otpHash: otpHashed,
      expiresAt,
    });

    rateLimitMap.set(cleanIdentifier, now);

    // 4. Dispatch via Gmail SMTP if identifier is email (or if email configured)
    if (isEmail && isEmailConfigured()) {
      try {
        await sendGmailOtp(cleanIdentifier, rawOtp, purpose);
        return {
          success: true,
          expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
          deliveryChannel: "email",
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error sending email OTP";
        console.error("Gmail OTP dispatch error:", err);
        return {
          success: false,
          error: `Failed to deliver email: ${message}`,
        };
      }
    }

    // 5. Dispatch via Twilio SMS if mobile
    if (!isEmail && isTwilioConfigured()) {
      try {
        const smsText =
          purpose === "registration"
            ? `Your CivSetu portal registration OTP is ${rawOtp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`
            : `Your CivSetu password reset OTP is ${rawOtp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`;

        await sendTwilioSms(cleanIdentifier, smsText);
        return {
          success: true,
          expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
          deliveryChannel: "sms",
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error dispatching SMS";
        return {
          success: false,
          error: message,
        };
      }
    }

    // 6. Development mock fallback
    console.log(`[CivSetu Mock OTP] Generated OTP for ${cleanIdentifier} (${purpose}): ${rawOtp}`);
    return {
      success: true,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      deliveryChannel: "mock",
    };
  },

  /**
   * Verifies the submitted OTP against the database hash.
   */
  async verifyOtp(
    identifier: string,
    rawOtp: string,
    purpose: "registration" | "password_reset"
  ): Promise<VerifyOtpResult> {
    if (!isPostgresConfigured()) {
      return {
        success: false,
        error: "Database is not configured. Please define DATABASE_URL in your environment.",
      };
    }

    const rawId = identifier.trim();
    const cleanIdentifier = rawId.includes("@") ? rawId.toLowerCase() : rawId.replace(/\D/g, "");
    const cleanOtp = rawOtp.trim();

    if (!cleanOtp || cleanOtp.length < 4 || cleanOtp.length > 6) {
      return { success: false, error: "Please provide a valid numerical OTP." };
    }

    const record = await otpDb.getLatestOtp(cleanIdentifier, purpose);
    if (!record) {
      // In development / mock mode without email or Twilio configured, allow 123456
      if (!isEmailConfigured() && !isTwilioConfigured() && cleanOtp === "123456") {
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        const otpHashed = hashOtp("123456", cleanIdentifier);
        const newId = await otpDb.saveOtp({
          identifier: cleanIdentifier,
          purpose,
          otpHash: otpHashed,
          expiresAt,
        });
        await otpDb.markVerified(newId);
        return { success: true };
      }
      return {
        success: false,
        error: "No active verification request found. Please request a new OTP.",
      };
    }

    if (record.verified) {
      return { success: true };
    }

    // Check expiration
    if (new Date() > new Date(record.expiresAt)) {
      return {
        success: false,
        error: "The OTP has expired. Please request a new OTP.",
      };
    }

    // Check attempts limit
    if (record.attempts >= MAX_ATTEMPTS) {
      return {
        success: false,
        error: "Maximum verification attempts exceeded. Please request a new OTP.",
      };
    }

    // Increment attempts count
    await otpDb.incrementAttempts(record.id);

    // Verify hash comparison using timingSafeEqual
    const computedHash = hashOtp(cleanOtp, cleanIdentifier);
    const isHashValid = crypto.timingSafeEqual(
      Buffer.from(computedHash, "utf-8"),
      Buffer.from(record.otpHash, "utf-8")
    );

    const isMockValid = cleanOtp === "123456" && (process.env.NODE_ENV !== "production" || (!isEmailConfigured() && !isTwilioConfigured()));

    if (!isHashValid && !isMockValid) {
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      return {
        success: false,
        error:
          remaining > 0
            ? `Invalid OTP. You have ${remaining} attempt(s) remaining.`
            : "Invalid OTP. Maximum verification attempts exceeded. Please request a new OTP.",
      };
    }

    // Mark verified in DB
    await otpDb.markVerified(record.id);
    return { success: true };
  },

  /**
   * Checks if an OTP was verified on the server within recent minutes.
   */
  async hasVerifiedOtp(
    identifier: string,
    purpose: "registration" | "password_reset"
  ): Promise<boolean> {
    if (!isPostgresConfigured()) return false;
    const cleanIdentifier = identifier.includes("@") ? identifier.trim().toLowerCase() : identifier.trim();
    return otpDb.isVerifiedRecently(cleanIdentifier, purpose, 15);
  },

  /**
   * Consumes the verified OTP so it cannot be re-used.
   */
  async consumeVerifiedOtp(
    identifier: string,
    purpose: "registration" | "password_reset"
  ): Promise<void> {
    if (!isPostgresConfigured()) return;
    const cleanIdentifier = identifier.includes("@") ? identifier.trim().toLowerCase() : identifier.trim();
    await otpDb.consumeVerifiedOtp(cleanIdentifier, purpose);
  },
};
