import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { eventsDb, CreateEventParams, EventCategory, EVENT_CATEGORIES } from "@/lib/db/events";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/events
 * Admin endpoint: List all events with stats, status, ward, category filters, and search.
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
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as "ALL" | "Published" | "Draft" | "Cancelled") || undefined;
    const timeFilter = (searchParams.get("timeFilter") as "all" | "upcoming" | "past") || "all";
    const category = searchParams.get("category") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const [listResult, stats] = await Promise.all([
      eventsDb.list({
        status,
        timeFilter,
        category,
        ward,
        search,
        limit,
        offset,
      }),
      eventsDb.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: listResult.events,
      total: listResult.total,
      stats,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve events." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Admin endpoint: Create a new municipal event.
 */
export async function POST(req: NextRequest) {
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
        { success: false, error: "Unauthorized administrative access." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      wardRelevance,
      imageUrl,
      category,
      organizer,
      isRegistrationRequired,
      registrationLink,
      capacity,
      status,
    } = body;

    // Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Event title is required." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { success: false, error: "Event description is required." },
        { status: 400 }
      );
    }

    if (!eventDate || typeof eventDate !== "string" || !eventDate.trim()) {
      return NextResponse.json(
        { success: false, error: "Event date is required." },
        { status: 400 }
      );
    }

    if (!startTime || typeof startTime !== "string" || !startTime.trim()) {
      return NextResponse.json(
        { success: false, error: "Event start time is required." },
        { status: 400 }
      );
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      return NextResponse.json(
        { success: false, error: "Event location is required." },
        { status: 400 }
      );
    }

    if (!category || !EVENT_CATEGORIES.includes(category as EventCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: `Category must be one of: ${EVENT_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const createParams: CreateEventParams = {
      title: title.trim(),
      description: description.trim(),
      eventDate: eventDate.trim(),
      startTime: startTime.trim(),
      endTime: endTime?.trim() || null,
      location: location.trim(),
      wardRelevance: wardRelevance?.trim() || "All Wards",
      imageUrl: imageUrl?.trim() || undefined,
      category: category as EventCategory,
      organizer: organizer?.trim() || "Lakshmeshwar Town Municipal Council",
      isRegistrationRequired: Boolean(isRegistrationRequired),
      registrationLink: registrationLink?.trim() || null,
      capacity: capacity !== undefined && capacity !== null && capacity !== "" ? Number(capacity) : null,
      status: status || "Published",
    };

    const createdEvent = await eventsDb.create(createParams);

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully.",
        data: createdEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event." },
      { status: 500 }
    );
  }
}
