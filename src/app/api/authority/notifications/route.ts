import { NextRequest, NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
import { adminService } from "@/lib/services/adminService";
import { notificationDb } from "@/lib/db/authority";

export const dynamic = "force-dynamic";

/**
 * GET /api/authority/notifications
 * Lists recent authority event notifications with optional unread-only filtering.
 */
export async function GET(req: NextRequest) {
  try {
    const [authority, admin] = await Promise.all([
      authorityService.getSessionAuthority(),
      adminService.getSessionAdmin(),
    ]);

    if (!authority && !admin) {
      return NextResponse.json(
        { success: false, error: "Authority or Administrator authorization required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    const [notifications, unreadCount] = await Promise.all([
      notificationDb.listRecent({ limit, unreadOnly }),
      notificationDb.getUnreadCount(),
    ]);

    return NextResponse.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Error in GET /api/authority/notifications:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/authority/notifications
 * Marks specific notification or all notifications as read.
 */
export async function PATCH(req: NextRequest) {
  try {
    const [authority, admin] = await Promise.all([
      authorityService.getSessionAuthority(),
      adminService.getSessionAdmin(),
    ]);

    if (!authority && !admin) {
      return NextResponse.json(
        { success: false, error: "Authority or Administrator authorization required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, id } = body;

    if (action === "mark_read") {
      const numId = Number(id);
      if (isNaN(numId)) {
        return NextResponse.json(
          { success: false, error: "Valid notification ID required." },
          { status: 400 }
        );
      }
      await notificationDb.markAsRead(numId);
      const unreadCount = await notificationDb.getUnreadCount();
      return NextResponse.json({
        success: true,
        message: "Notification marked as read.",
        unreadCount,
      });
    }

    if (action === "mark_all_read") {
      const count = await notificationDb.markAllAsRead();
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
    console.error("Error in PATCH /api/authority/notifications:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
