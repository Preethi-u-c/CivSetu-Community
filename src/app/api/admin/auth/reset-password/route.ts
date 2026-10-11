import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured, getPool } from "@/lib/db/postgres";
import { adminDb } from "@/lib/db/admin";
import { adminService } from "@/lib/services/adminService";
import { otpService } from "@/lib/services/otpService";
import { auditDb } from "@/lib/db/audit";
import { validateStrongPassword } from "@/lib/security/validator";

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
    const newPassword = body.newPassword || "";
    const confirmNewPassword = body.confirmNewPassword || "";

    if (!identifier || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Identifier and new password are required." },
        { status: 400 }
      );
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    // Strong password validation (disallows series numbers like 123, 1234, etc.)
    const validation = validateStrongPassword(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors[0] },
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

    // Ensure OTP was verified
    const isVerified = await otpService.hasVerifiedOtp(admin.email, "password_reset");
    if (!isVerified) {
      return NextResponse.json(
        { success: false, error: "OTP verification required before resetting password. Please verify the code first." },
        { status: 403 }
      );
    }

    // Hash new password securely with bcrypt
    const passwordHash = await adminService.hashPassword(newPassword);
    const pool = getPool();

    // Update admin user password
    await pool.query(
      "UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;",
      [passwordHash, admin.id]
    );

    // Revoke all prior admin sessions for security
    await pool.query("DELETE FROM admin_sessions WHERE admin_id = $1;", [admin.id]);

    // Consume the verified OTP
    await otpService.consumeVerifiedOtp(admin.email, "password_reset");

    // Audit log
    await auditDb.create({
      actorId: admin.id,
      actorName: admin.fullName,
      actorRole: "ADMIN",
      action: "ADMIN_PASSWORD_RESET_RECOVERY",
      targetType: "SYSTEM",
      targetId: admin.id,
      details: `Administrator account ${admin.email} successfully completed password reset recovery.`,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Administrator password reset successfully. You can now log in with your updated credentials.",
    });
  } catch (error) {
    console.error("Error in /api/admin/auth/reset-password:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while resetting the administrator password." },
      { status: 500 }
    );
  }
}
