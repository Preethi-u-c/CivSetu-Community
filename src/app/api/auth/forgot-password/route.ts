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
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Please enter your registered mobile number or email address." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.toString().trim();
    const citizen = await citizenDb.findByIdentifier(cleanIdentifier);

    if (!citizen) {
      return NextResponse.json(
        {
          success: false,
          error: "No registered citizen account found with this mobile number or email.",
        },
        { status: 404 }
      );
    }

    // Send reset OTP to the citizen's verified mobile number
    const result = await otpService.sendOtp(citizen.mobileNumber, "password_reset");
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to dispatch password reset OTP." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset OTP dispatched to your registered mobile number.",
      mobileMasked: `+91 ******${citizen.mobileNumber.slice(-4)}`,
      expiresInSeconds: result.expiresInSeconds,
    });
  } catch (error) {
    console.error("Error in /api/auth/forgot-password:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during password recovery." },
      { status: 500 }
    );
  }
}
