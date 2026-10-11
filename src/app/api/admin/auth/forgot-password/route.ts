import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { adminDb } from "@/lib/db/admin";
import { otpService } from "@/lib/services/otpService";

export const dynamic = "force-dynamic";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const first2 = local.slice(0, 2);
  const last2 = local.slice(-2);
  return `${first2}****${last2}@${domain}`;
}

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

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Please enter your administrator email address." },
        { status: 400 }
      );
    }

    const admin = await adminDb.findByUsernameOrEmail(identifier);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "No administrator account found matching this email address." },
        { status: 404 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: "Administrator account is deactivated. Contact municipal authorities." },
        { status: 403 }
      );
    }

    const result = await otpService.sendOtp(admin.email, "password_reset");
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to dispatch verification code." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email: maskEmail(admin.email),
      rawEmail: admin.email,
      message: `A secure 6-digit verification code has been sent to ${maskEmail(admin.email)}.`,
    });
  } catch (error) {
    console.error("Error in /api/admin/auth/forgot-password:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while initiating password recovery." },
      { status: 500 }
    );
  }
}
