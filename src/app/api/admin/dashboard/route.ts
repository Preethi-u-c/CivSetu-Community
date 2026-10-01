import { NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminDashboardDb } from "@/lib/db/admin";

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

    const [counts, recentActivity] = await Promise.all([
      adminDashboardDb.getSummaryCounts(),
      adminDashboardDb.getRecentActivity(10),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        counts,
        metrics: {
          ...counts,
          registeredAuthorities: counts.activeAuthorities,
          activeWards: counts.totalWards,
          criticalBreaches: counts.escalatedComplaints,
        },
        recentActivity,
        recentAuditActivity: recentActivity,
      },
    });
  } catch (error) {
    console.error("Error in /api/admin/dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load admin dashboard summary." },
      { status: 500 }
    );
  }
}
