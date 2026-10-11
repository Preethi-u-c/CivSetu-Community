import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { adminDb } from "@/lib/db/admin";
import { otpService } from "@/lib/services/otpService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const identifier = (body.identifier || body.username || body.email || "").toString().trim();
    const otp = (body.otp || "").toString().trim();

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, error: "Identifier and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const admin = await adminDb.findByUsernameOrEmail(identifier);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Administrator account not found." },
        { status: 404 }
      );
    }

    const result = await otpService.verifyOtp(admin.email, otp, "password_reset");
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code confirmed successfully. Please set your new administrative password.",
    });
  } catch (error) {
    console.error("Error in /api/admin/auth/verify-otp:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while verifying the code." },
      { status: 500 }
    );
  }
}
