import { NextRequest, NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { complaintDb } from "@/lib/db/complaints";

export const dynamic = "force-dynamic";

/**
 * GET /api/authority/complaints
 * Returns municipal complaint queue and real-time summary statistics.
 * Security: Strictly enforces authority authentication (HTTP 401 for citizens or unauthenticated).
 */
export async function GET(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authority authentication required to access municipal queue." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const assignedAuthority = searchParams.get("assignedAuthority") || undefined;
    const authorityLevel = searchParams.get("authorityLevel") || undefined;
    const search = searchParams.get("search") || undefined;
    const slaState = searchParams.get("slaState") || undefined;
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || undefined;
    const nearDeadline = searchParams.get("nearDeadline") === "true";
    const overdueOnly = searchParams.get("overdueOnly") === "true";
    const escalatedOnly = searchParams.get("escalatedOnly") === "true";
    const assignedToMe = searchParams.get("assignedToMe") === "true" ? authority.department : undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    // Fetch complaints list with active filters
    const listResult = await complaintDb.listForAuthority({
      status,
      category,
      ward,
      priority,
      assignedAuthority,
      authorityLevel,
      search,
      slaState,
      nearDeadline,
      overdueOnly,
      escalatedOnly,
      sortOrder,
      assignedToMe,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    // Fetch live summary stats across all municipal complaints
    const stats = await complaintDb.getAuthorityStats();

    return NextResponse.json({
      success: true,
      stats,
      count: listResult.complaints.length,
      total: listResult.total,
      data: listResult.complaints,
    });
  } catch (error) {
    console.error("Error in GET /api/authority/complaints:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching authority complaints." },
      { status: 500 }
    );
  }
}
