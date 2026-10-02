import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/authService";
import { notificationDb } from "@/lib/db/authority";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Lists recent notifications targeted specifically to the authenticated citizen.
 * Supports unreadOnly and limit query parameters.
 */
export async function GET(req: NextRequest) {
  try {
    const citizen = await authService.getSessionCitizen();
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view citizen notifications." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    const [notifications, unreadCount] = await Promise.all([
      notificationDb.listRecent({ limit, unreadOnly, citizenId: citizen.id }),
      notificationDb.getUnreadCount({ citizenId: citizen.id }),
    ]);

    return NextResponse.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching notifications." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Marks a specific notification or all notifications as read for the authenticated citizen.
 */
export async function PATCH(req: NextRequest) {
  try {
    const citizen = await authService.getSessionCitizen();
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: "Authentication required to modify notifications." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, id } = body;

    if (action === "mark_read") {
      const numId = Number(id);
      if (isNaN(numId)) {
        return NextResponse.json(
          { success: false, error: "Valid notification ID is required." },
          { status: 400 }
        );
      }

      await notificationDb.markAsRead(numId, citizen.id);
      const unreadCount = await notificationDb.getUnreadCount({ citizenId: citizen.id });

      return NextResponse.json({
        success: true,
        message: "Notification marked as read.",
        unreadCount,
      });
    }

    if (action === "mark_all_read") {
      const count = await notificationDb.markAllAsRead({ citizenId: citizen.id });
      return NextResponse.json({
        success: true,
        message: `${count} notification(s) marked as read.`,
        unreadCount: 0,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported actions: mark_read, mark_all_read." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/notifications:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while updating notifications." },
      { status: 500 }
    );
  }
}
