import { NextRequest, NextResponse } from "next/server";
import { citizenDb, isPostgresConfigured } from "@/lib/db/postgres";
import { otpService } from "@/lib/services/otpService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PostgreSQL database is not configured. Please define DATABASE_URL in your .env.local file.",
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, mobileNumber, identifier, purpose } = body;

    const rawTarget = (email || identifier || mobileNumber || "").toString().trim();

    if (!rawTarget) {
      return NextResponse.json(
        { success: false, error: "Email address is required to receive verification OTP." },
        { status: 400 }
      );
    }

    const isEmail = rawTarget.includes("@");
    const validPurpose = purpose === "password_reset" ? "password_reset" : "registration";

    if (isEmail) {
      const cleanEmail = rawTarget.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      // Registration check
      if (validPurpose === "registration") {
        const existing = await citizenDb.findByEmail(cleanEmail);
        if (existing) {
          return NextResponse.json(
            {
              success: false,
              error: "This email address is already registered. Please proceed to Login.",
            },
            { status: 409 }
          );
        }
      }

      // Password reset check
      if (validPurpose === "password_reset") {
        const existing = await citizenDb.findByEmail(cleanEmail);
        if (!existing) {
          return NextResponse.json(
            {
              success: false,
              error: "No registered citizen account found with this email address.",
            },
            { status: 404 }
          );
        }
      }

      const result = await otpService.sendOtp(cleanEmail, validPurpose);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Failed to send verification email." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent successfully to your email address.",
        expiresInSeconds: result.expiresInSeconds,
        channel: result.deliveryChannel,
      });
    }

    // Fallback if a mobile number is provided
    const cleanedMobile = rawTarget.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address or 10-digit Indian mobile number.",
        },
        { status: 400 }
      );
    }

    if (validPurpose === "registration") {
      const existing = await citizenDb.findByMobile(cleanedMobile);
      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: "This mobile number is already registered. Please proceed to Login.",
          },
          { status: 409 }
        );
      }
    }

    if (validPurpose === "password_reset") {
      const existing = await citizenDb.findByMobile(cleanedMobile);
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            error: "No registered citizen account found with this mobile number.",
          },
          { status: 404 }
        );
      }
    }

    const result = await otpService.sendOtp(cleanedMobile, validPurpose);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send OTP." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your mobile number.",
      expiresInSeconds: result.expiresInSeconds,
      channel: result.deliveryChannel,
    });
  } catch (error) {
    console.error("Error in /api/auth/send-otp:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while sending OTP." },
      { status: 500 }
    );
  }
}
