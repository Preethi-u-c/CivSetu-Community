import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { noticeDb } from "@/lib/db/notices";

export const dynamic = "force-dynamic";

/**
 * GET /api/notices
 * Public API endpoint: Returns active published notices and gazette announcements.
 * Accessible by citizens and public portals without authentication.
 */
export async function GET(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const onlyWard = searchParams.get("onlyWard") === "true";
    const priority = searchParams.get("priority") || undefined;
    const isEmergency = searchParams.has("isEmergency")
      ? searchParams.get("isEmergency") === "true"
      : undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const notices = await noticeDb.listPublic({
      category,
      ward,
      onlyWard,
      priority,
      isEmergency,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    console.error("Error in GET /api/notices:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
