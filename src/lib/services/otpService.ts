import crypto from "crypto";
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
    .update(`${identifier.trim()}:${otp.trim()}`)
    .digest("hex");
}

/**
 * Verifies if Twilio environment variables are configured.
 */
export function isTwilioConfigured(): boolean {
  return (
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_PHONE_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID.startsWith("AC")
  );
}

/**
 * Dispatches an SMS via Twilio REST API.
 */
async function sendTwilioSms(toMobile: string, messageBody: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER!;

  // Format mobile with +91 if not present
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
    const errText = await res.text();
    console.error("Twilio SMS dispatch failed with status:", res.status);
    throw new Error(`Failed to send SMS via Twilio: HTTP ${res.status}`);
  }

  return true;
}

export interface SendOtpResult {
  success: boolean;
  error?: string;
  expiresInSeconds?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

export const otpService = {
  /**
   * Generates and dispatches a secure 6-digit OTP.
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

    const cleanIdentifier = identifier.trim();

    // 1. Rate Limiting Check (enforced when Twilio SMS is configured)
    const now = Date.now();
    const lastSent = rateLimitMap.get(cleanIdentifier);
    if (isTwilioConfigured() && lastSent && now - lastSent < RATE_LIMIT_SECONDS * 1000) {
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

    // 4. SMS Delivery via Twilio or Development Mock
    if (!isTwilioConfigured()) {
      // In development / mock mode, log OTP for developers and return success
      console.log(`[CivSetu Mock OTP] Generated OTP for ${cleanIdentifier} (${purpose}): ${rawOtp}`);
      return {
        success: true,
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      };
    }

    try {
      const smsText =
        purpose === "registration"
          ? `Your CivSetu citizen portal registration OTP is ${rawOtp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share with anyone.`
          : `Your CivSetu citizen account password reset OTP is ${rawOtp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share with anyone.`;

      await sendTwilioSms(cleanIdentifier, smsText);

      return {
        success: true,
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error dispatching SMS";
      return {
        success: false,
        error: message,
      };
    }
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

    const cleanIdentifier = identifier.trim();
    const cleanOtp = rawOtp.trim();

    if (!cleanOtp || cleanOtp.length < 4 || cleanOtp.length > 6) {
      return { success: false, error: "Please provide a valid numerical OTP." };
    }

    const record = await otpDb.getLatestOtp(cleanIdentifier, purpose);
    if (!record) {
      // In development / mock mode without Twilio, allow 123456 as automatic dev OTP
      if (!isTwilioConfigured() && cleanOtp === "123456") {
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

    const isMockValid = !isTwilioConfigured() && cleanOtp === "123456";

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
    return otpDb.isVerifiedRecently(identifier, purpose, 15);
  },

  /**
   * Consumes the verified OTP so it cannot be re-used.
   */
  async consumeVerifiedOtp(
    identifier: string,
    purpose: "registration" | "password_reset"
  ): Promise<void> {
    if (!isPostgresConfigured()) return;
    await otpDb.consumeVerifiedOtp(identifier, purpose);
  },
};
