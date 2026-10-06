import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminAuthoritiesDb } from "@/lib/db/admin";
import { auditDb } from "@/lib/db/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const authorities = await adminAuthoritiesDb.listHierarchical();
    return NextResponse.json({
      success: true,
      data: authorities,
    });
  } catch (error) {
    console.error("Error in /api/admin/authorities GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load authorities hierarchy." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { fullName, designation, department, authorityLevel, email, mobileNumber, password } = body;

    if (!fullName || !designation || !department || !authorityLevel || !email || !password) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided." },
        { status: 400 }
      );
    }

    const newAuthority = await adminAuthoritiesDb.createAuthority({
      fullName,
      designation,
      department,
      authorityLevel,
      email,
      mobileNumber,
      password,
    });

    await auditDb.create({
      actorId: admin.id,
      actorName: admin.fullName,
      actorRole: "ADMIN",
      action: "CREATE_AUTHORITY",
      targetType: "SYSTEM",
      targetId: newAuthority.id,
      details: `Created new authority officer ${newAuthority.fullName} (${newAuthority.designation})`,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Authority officer created successfully.",
      data: newAuthority,
    });
  } catch (error) {
    console.error("Error in /api/admin/authorities POST:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create authority officer." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const id = (body.id || "").trim();
    const isActive = Boolean(body.isActive);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Authority ID is required." },
        { status: 400 }
      );
    }

    const updated = await adminAuthoritiesDb.toggleActive(id, isActive);
    
    await auditDb.create({
      actorId: admin.id,
      actorName: admin.fullName,
      actorRole: "ADMIN",
      action: "UPDATE_AUTHORITY_STATUS",
      targetType: "SYSTEM",
      targetId: id,
      details: `Updated status of authority officer ${id} to ${isActive ? "Active" : "Inactive"}.`,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Authority officer status updated to ${isActive ? "Active" : "Inactive"}.`,
      data: { id, isActive },
    });
  } catch (error) {
    console.error("Error in /api/admin/authorities PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update authority status." },
      { status: 500 }
    );
  }
}
