import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminDb } from "@/lib/db/admin";
import { getPool } from "@/lib/db/postgres";
import { auditDb } from "@/lib/db/audit";
import { validateStrongPassword } from "@/lib/security/validator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionAdmin = await adminService.getSessionAdmin();
    if (!sessionAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmNewPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    // Load full admin user including password hash
    const adminRecord = await adminDb.findById(sessionAdmin.id);
    if (!adminRecord) {
      return NextResponse.json(
        { success: false, error: "Administrator record not found." },
        { status: 404 }
      );
    }

    const isCurrentValid = await adminService.verifyPassword(currentPassword, adminRecord.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Strong password validation with no sequential numbers (e.g. 123, 1234)
    const validation = validateStrongPassword(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors[0] },
        { status: 400 }
      );
    }

    // Hash and update
    const newHash = await adminService.hashPassword(newPassword);
    const pool = getPool();
    await pool.query(
      "UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;",
      [newHash, sessionAdmin.id]
    );

    // Audit log
    await auditDb.create({
      actorId: sessionAdmin.id,
      actorName: sessionAdmin.fullName,
      actorRole: "ADMIN",
      action: "UPDATE_ADMIN_PASSWORD",
      targetType: "SYSTEM",
      targetId: sessionAdmin.id,
      details: `Administrator ${sessionAdmin.username} updated their security credentials.`,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Administrator password updated successfully.",
    });
  } catch (error) {
    console.error("Error in /api/admin/auth/change-password:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while updating administrative password." },
      { status: 500 }
    );
  }
}
