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
        { success: false, error: "Please enter your registered email address or mobile number." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.toString().trim();
    const citizen = await citizenDb.findByIdentifier(cleanIdentifier);

    if (!citizen) {
      return NextResponse.json(
        {
          success: false,
          error: "No registered citizen account found with this email or mobile number.",
        },
        { status: 404 }
      );
    }

    // Send reset OTP directly to the citizen's registered email
    const result = await otpService.sendOtp(citizen.email, "password_reset");
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to dispatch password reset OTP." },
        { status: 400 }
      );
    }

    const emailParts = citizen.email.split("@");
    const maskedEmail = `${emailParts[0].slice(0, 2)}***@${emailParts[1]}`;

    return NextResponse.json({
      success: true,
      message: `Password reset verification code sent to your registered email (${maskedEmail}).`,
      emailMasked: maskedEmail,
      targetIdentifier: citizen.email,
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
