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
    const { mobileNumber, purpose } = body;

    if (!mobileNumber) {
      return NextResponse.json(
        { success: false, error: "Mobile number is required." },
        { status: 400 }
      );
    }

    const cleanedMobile = mobileNumber.toString().replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).",
        },
        { status: 400 }
      );
    }

    const validPurpose = purpose === "password_reset" ? "password_reset" : "registration";

    // For registration: check duplicate mobile
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

    // For password_reset: check if account exists
    if (validPurpose === "password_reset") {
      const existing = await citizenDb.findByMobile(cleanedMobile);
      if (!existing) {
        // Prevent enumeration while gracefully rejecting invalid request
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
    });
  } catch (error) {
    console.error("Error in /api/auth/send-otp:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while sending OTP." },
      { status: 500 }
    );
  }
}
