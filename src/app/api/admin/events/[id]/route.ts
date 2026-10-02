import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { eventsDb, UpdateEventParams, EventCategory, EVENT_CATEGORIES } from "@/lib/db/events";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/events/[id]
 * Fetch a single event by ID (any status)
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

    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access." },
        { status: 401 }
      );
    }

    const event = await eventsDb.getById(params.id);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Error in GET /api/admin/events/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/events/[id]
 * Update an event's fields or status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existing = await eventsDb.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Event not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    const updateParams: UpdateEventParams = {};
    if (body.title !== undefined) updateParams.title = body.title;
    if (body.description !== undefined) updateParams.description = body.description;
    if (body.eventDate !== undefined) updateParams.eventDate = body.eventDate;
    if (body.startTime !== undefined) updateParams.startTime = body.startTime;
    if (body.endTime !== undefined) updateParams.endTime = body.endTime;
    if (body.location !== undefined) updateParams.location = body.location;
    if (body.wardRelevance !== undefined) updateParams.wardRelevance = body.wardRelevance;
    if (body.imageUrl !== undefined) updateParams.imageUrl = body.imageUrl;
    if (body.category !== undefined) {
      if (!EVENT_CATEGORIES.includes(body.category as EventCategory)) {
        return NextResponse.json(
          { success: false, error: "Invalid event category." },
          { status: 400 }
        );
      }
      updateParams.category = body.category;
    }
    if (body.organizer !== undefined) updateParams.organizer = body.organizer;
    if (body.isRegistrationRequired !== undefined) updateParams.isRegistrationRequired = Boolean(body.isRegistrationRequired);
    if (body.registrationLink !== undefined) updateParams.registrationLink = body.registrationLink;
    if (body.capacity !== undefined) updateParams.capacity = body.capacity !== null && body.capacity !== "" ? Number(body.capacity) : null;
    if (body.status !== undefined) {
      if (!["Published", "Draft", "Cancelled"].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "Status must be Published, Draft, or Cancelled." },
          { status: 400 }
        );
      }
      updateParams.status = body.status;
    }

    const updated = await eventsDb.update(params.id, updateParams);

    return NextResponse.json({
      success: true,
      message: "Event updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/events/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Delete an event
 */
export async function DELETE(
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

    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access." },
        { status: 401 }
      );
    }

    const existing = await eventsDb.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Event not found." },
        { status: 404 }
      );
    }

    const deleted = await eventsDb.delete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete event." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Event #${params.id} has been deleted.`,
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/events/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event." },
      { status: 500 }
    );
  }
}
