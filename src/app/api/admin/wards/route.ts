import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminWardsDb } from "@/lib/db/admin";

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

    const wards = await adminWardsDb.listWithStats();
    return NextResponse.json({
      success: true,
      data: wards,
    });
  } catch (error) {
    console.error("Error in /api/admin/wards GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load wards." },
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
    const wardNumber = Number(body.wardNumber);
    const isActive = Boolean(body.isActive);

    if (isNaN(wardNumber) || wardNumber < 1 || wardNumber > 23) {
      return NextResponse.json(
        { success: false, error: "Invalid ward number. Must be between 1 and 23." },
        { status: 400 }
      );
    }

    const updated = await adminWardsDb.toggleActive(wardNumber, isActive);
    return NextResponse.json({
      success: true,
      message: `Ward ${wardNumber} status updated to ${isActive ? "Active" : "Inactive"}.`,
      data: { wardNumber, isActive },
    });
  } catch (error) {
    console.error("Error in /api/admin/wards PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update ward status." },
      { status: 500 }
    );
  }
}
