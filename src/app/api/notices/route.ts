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
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;

    const notices = await noticeDb.listPublic(limit);

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
