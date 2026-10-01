import { NextRequest, NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { noticeDb } from "@/lib/db/notices";
import { notificationService } from "@/lib/services/notificationService";

export const dynamic = "force-dynamic";

/**
 * GET /api/authority/notices
 * Lists notices and gazette announcements with filtering and summary statistics.
 * Security: Strict authority session required.
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
        { success: false, error: "Unauthorized: Authority authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const targetScope = searchParams.get("targetScope") || undefined;
    const isEmergency = searchParams.has("isEmergency")
      ? searchParams.get("isEmergency") === "true"
      : undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const [listResult, stats] = await Promise.all([
      noticeDb.list({
        status,
        category,
        priority,
        targetScope,
        isEmergency,
        search,
        limit,
        offset,
      }),
      noticeDb.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      count: listResult.notices.length,
      total: listResult.total,
      data: listResult.notices,
    });
  } catch (error) {
    console.error("Error in GET /api/authority/notices:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching notices." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/authority/notices
 * Creates and optionally publishes a new official municipal notice.
 * Security: Strict authority session required. Server-side validation enforced.
 */
export async function POST(req: NextRequest) {
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
        { success: false, error: "Unauthorized: Authority authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      description,
      category,
      targetScope,
      targetWards,
      priority,
      isEmergency,
      status,
      publishDate,
      expiryDate,
    } = body;

    // 1. Validation: Title
    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Notice title must be at least 5 characters long." },
        { status: 400 }
      );
    }

    // 2. Validation: Description / Content
    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Notice description must be at least 10 characters long." },
        { status: 400 }
      );
    }

    // 3. Validation: Category
    const cleanCategory = (category && typeof category === "string" ? category.trim() : "") || "Public Notice";

    // 4. Validation: Target Scope
    const validScopes = ["Entire Municipality", "Specific Wards"];
    const cleanScope = validScopes.includes(targetScope) ? targetScope : "Entire Municipality";

    // 5. Validation: Priority
    const validPriorities = ["Normal", "High", "Urgent"];
    const cleanPriority = validPriorities.includes(priority) ? priority : "Normal";

    // 6. Validation: Status
    const validStatuses = ["Draft", "Published", "Archived"];
    const cleanStatus = validStatuses.includes(status) ? status : "Published";

    // 7. Persist to PostgreSQL
    const notice = await noticeDb.create({
      title: title.trim(),
      description: description.trim(),
      category: cleanCategory,
      targetScope: cleanScope as "Entire Municipality" | "Specific Wards",
      targetWards: targetWards && typeof targetWards === "string" ? targetWards.trim() : null,
      priority: cleanPriority as "Normal" | "High" | "Urgent",
      isEmergency: Boolean(isEmergency),
      status: cleanStatus as "Draft" | "Published" | "Archived",
      publishDate: publishDate || undefined,
      expiryDate: expiryDate || null,
      issuedById: authority.id,
      issuedByName: `${authority.fullName} (${authority.designation})`,
      issuedByDepartment: authority.department,
    });

    // 8. If published, notify authorities
    if (notice.status === "Published") {
      await notificationService.notifyNoticePublished(
        notice.id,
        notice.title,
        notice.category,
        authority.fullName
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Notice #${notice.id} ${notice.status === "Published" ? "published" : "saved as draft"} successfully.`,
        data: notice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/authority/notices:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
