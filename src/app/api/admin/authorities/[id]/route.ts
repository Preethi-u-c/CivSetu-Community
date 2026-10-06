import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminAuthoritiesDb } from "@/lib/db/admin";
import { auditDb } from "@/lib/db/audit";
import { getPool } from "@/lib/db/postgres";
import { toSafeAuthorityUser } from "@/lib/db/authority";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const { id } = params;
    const pool = getPool();
    const res = await pool.query("SELECT * FROM authority_users WHERE id = $1 LIMIT 1", [id]);
    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Authority officer not found." },
        { status: 404 }
      );
    }

    const authority = toSafeAuthorityUser({
      id: res.rows[0].id,
      fullName: res.rows[0].full_name,
      designation: res.rows[0].designation,
      department: res.rows[0].department,
      authorityLevel: res.rows[0].authority_level,
      email: res.rows[0].email,
      mobileNumber: res.rows[0].mobile_number,
      passwordHash: res.rows[0].password_hash,
      isActive: res.rows[0].is_active,
      createdAt: res.rows[0].created_at instanceof Date ? res.rows[0].created_at.toISOString() : String(res.rows[0].created_at),
      updatedAt: res.rows[0].updated_at instanceof Date ? res.rows[0].updated_at.toISOString() : String(res.rows[0].updated_at),
    });

    return NextResponse.json({
      success: true,
      data: authority,
    });
  } catch (error) {
    console.error("Error in /api/admin/authorities/[id] GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load authority officer." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    
    const updated = await adminAuthoritiesDb.updateAuthority(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Authority officer not found or update failed." },
        { status: 404 }
      );
    }

    await auditDb.create({
      actorId: admin.id,
      actorName: admin.fullName,
      actorRole: "ADMIN",
      action: "UPDATE_AUTHORITY",
      targetType: "SYSTEM",
      targetId: id,
      details: `Updated details for authority officer ${id}`,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Authority officer updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error in /api/admin/authorities/[id] PUT:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update authority officer." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const { id } = params;
    const success = await adminAuthoritiesDb.deleteAuthority(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Authority officer not found or could not be deleted." },
        { status: 404 }
      );
    }

    await auditDb.create({
      actorId: admin.id,
      actorName: admin.fullName,
      actorRole: "ADMIN",
      action: "DELETE_AUTHORITY",
      targetType: "SYSTEM",
      targetId: id,
      details: `Deleted authority officer ${id}`,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Authority officer deleted successfully.",
    });
  } catch (error) {
    console.error("Error in /api/admin/authorities/[id] DELETE:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete authority officer." },
      { status: 500 }
    );
  }
}
