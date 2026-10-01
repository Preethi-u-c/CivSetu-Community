import { NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminAnalyticsDb } from "@/lib/db/admin";

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

    const data = await adminAnalyticsDb.getAnalyticsData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in /api/admin/analytics GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate administrative analytics." },
      { status: 500 }
    );
  }
}
