import { NextRequest, NextResponse } from "next/server";
import { citizenDb, isPostgresConfigured } from "@/lib/db/postgres";
import { authService } from "@/lib/services/authService";
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
    const { identifier, otp, newPassword, confirmNewPassword } = body;

    if (!identifier || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Identifier and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (confirmNewPassword && confirmNewPassword !== newPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.toString().trim();
    const citizen = await citizenDb.findByIdentifier(cleanIdentifier);
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: "Citizen account not found." },
        { status: 404 }
      );
    }

    // Server-side verification check
    let verified = await otpService.hasVerifiedOtp(citizen.mobileNumber, "password_reset");
    if (!verified && otp) {
      const verifyRes = await otpService.verifyOtp(
        citizen.mobileNumber,
        otp.toString(),
        "password_reset"
      );
      if (verifyRes.success) {
        verified = true;
      }
    }

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification code has not been verified. Please verify your OTP first.",
        },
        { status: 400 }
      );
    }

    // Hash new password securely with bcrypt
    const passwordHash = await authService.hashPassword(newPassword);

    // Update in PostgreSQL
    await citizenDb.updatePassword(citizen.id, passwordHash);

    // Revoke all existing sessions for this citizen
    await authService.revokeAllSessions(citizen.id);

    // Consume the verified OTP
    await otpService.consumeVerifiedOtp(citizen.mobileNumber, "password_reset");

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new credentials.",
    });
  } catch (error) {
    console.error("Error in /api/auth/reset-password:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while resetting your password." },
      { status: 500 }
    );
  }
}
