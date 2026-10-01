import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminCitizensDb } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const citizenId = params.id;
    if (!citizenId) {
      return NextResponse.json(
        { success: false, error: "Citizen ID is required." },
        { status: 400 }
      );
    }

    const citizen = await adminCitizensDb.getDetails(citizenId);
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: "Citizen record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: citizen,
    });
  } catch (error) {
    console.error("Error in /api/admin/citizens/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load citizen details." },
      { status: 500 }
    );
  }
}
