import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { auditService } from "@/lib/services/auditService";
import { isPostgresConfigured } from "@/lib/db/postgres";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/audit-logs
 * Retrieves immutable administrative & authority audit log trails.
 * Security: Requires active administrative session.
 */
export async function GET(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Administrative authorization required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const actorId = searchParams.get("actorId") || undefined;
    const targetId = searchParams.get("targetId") || undefined;
    const action = searchParams.get("action") || undefined;
    const targetType = searchParams.get("targetType") || undefined;

    const result = await auditService.listLogs({
      limit,
      offset,
      actorId,
      targetId,
      action,
      targetType,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching audit logs." },
      { status: 500 }
    );
  }
}
