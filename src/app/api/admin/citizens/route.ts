import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminCitizensDb } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    const result = await adminCitizensDb.list({ search, ward, page, limit });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/admin/citizens:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve citizen records." },
      { status: 500 }
    );
  }
}
