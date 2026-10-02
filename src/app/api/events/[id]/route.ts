import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { eventsDb } from "@/lib/db/events";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]
 * Public endpoint: Returns details of a single event if published.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const event = await eventsDb.getById(params.id);
    if (!event || event.status !== "Published") {
      return NextResponse.json(
        { success: false, error: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error in GET /api/events/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event." },
      { status: 500 }
    );
  }
}
