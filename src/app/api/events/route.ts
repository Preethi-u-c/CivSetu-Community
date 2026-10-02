import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { eventsDb } from "@/lib/db/events";

export const dynamic = "force-dynamic";

/**
 * GET /api/events
 * Public endpoint: Returns published municipal events.
 * Supports timeFilter (upcoming, past, all), category, ward, search.
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
    const timeFilter = (searchParams.get("timeFilter") as "all" | "upcoming" | "past") || "upcoming";
    const category = searchParams.get("category") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const events = await eventsDb.listPublic({
      timeFilter,
      category,
      ward,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error in GET /api/events:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching events." },
      { status: 500 }
    );
  }
}
