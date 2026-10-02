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
    const { email, identifier, mobileNumber, otp, purpose } = body;

    const rawTarget = (email || identifier || mobileNumber || "").toString().trim();

    if (!rawTarget || !otp) {
      return NextResponse.json(
        { success: false, error: "Email/Mobile and verification OTP are required." },
        { status: 400 }
      );
    }

    const isEmail = rawTarget.includes("@");
    const cleanIdentifier = isEmail ? rawTarget.toLowerCase() : rawTarget.replace(/\D/g, "");
    const cleanOtp = otp.toString().trim();
    const validPurpose = purpose === "password_reset" ? "password_reset" : "registration";

    let targetIdentifier = cleanIdentifier;
    if (validPurpose === "password_reset" && isEmail) {
      const citizen = await citizenDb.findByEmail(cleanIdentifier);
      if (citizen) {
        targetIdentifier = citizen.email;
      }
    }

    const result = await otpService.verifyOtp(targetIdentifier, cleanOtp, validPurpose);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to verify code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isEmail ? "Email address verified successfully." : "Mobile number verified successfully.",
    });
  } catch (error) {
    console.error("Error in /api/auth/verify-otp:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while verifying OTP." },
      { status: 500 }
    );
  }
}
