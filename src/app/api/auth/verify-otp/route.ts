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
    const { identifier, otp, purpose } = body;

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, error: "Mobile number/email and OTP are required." },
        { status: 400 }
      );
    }

    const rawId = identifier.toString().trim();
    const cleanIdentifier = rawId.includes("@") ? rawId.toLowerCase() : rawId.replace(/\D/g, "");
    const cleanOtp = otp.toString().trim();
    const validPurpose = purpose === "password_reset" ? "password_reset" : "registration";

    let targetIdentifier = cleanIdentifier;
    if (validPurpose === "password_reset" && rawId.includes("@")) {
      const citizen = await citizenDb.findByEmail(cleanIdentifier);
      if (citizen) {
        targetIdentifier = citizen.mobileNumber;
      }
    }

    const result = await otpService.verifyOtp(targetIdentifier, cleanOtp, validPurpose);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to verify OTP." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mobile number verified successfully.",
    });
  } catch (error) {
    console.error("Error in /api/auth/verify-otp:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while verifying OTP." },
      { status: 500 }
    );
  }
}
