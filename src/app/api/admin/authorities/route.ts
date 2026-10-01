import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminAuthoritiesDb } from "@/lib/db/admin";

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
