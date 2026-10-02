import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { noticeDb } from "@/lib/db/notices";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notices
 * Admin endpoint: List notices with multi-filtering, stats, and search.
 * Protected by admin session.
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
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const targetScope = searchParams.get("targetScope") || undefined;
    const targetWard = searchParams.get("targetWard") || undefined;
    const onlyWard = searchParams.get("onlyWard") === "true";
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
        targetWard,
        onlyWard,
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
    console.error("Error in GET /api/admin/notices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notices." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notices
 * Admin endpoint: Create a new municipal announcement / gazette circular.
 * Protected by admin session.
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
        { success: false, error: "Unauthorized administrative access. Please log in." },
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

    // 2. Validation: Description
    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Notice description must be at least 10 characters long." },
        { status: 400 }
      );
    }

    // 3. Validation: Category
    const cleanCategory = (category && typeof category === "string" ? category.trim() : "") || "Municipal Announcements";

    // 4. Validation: Target Scope & Wards
    const validScopes = [
      "All citizens",
      "Specific ward(s)",
      "Entire municipality",
      "Emergency / city-wide",
      "Entire Municipality",
      "Specific Wards",
    ];
    let cleanScope = validScopes.includes(targetScope) ? targetScope : "Entire municipality";
    let formattedWards: string | null = null;
    let cleanPriority = priority;
    let cleanEmergency = Boolean(isEmergency);

    if (cleanScope === "Specific ward(s)" || cleanScope === "Specific Wards") {
      cleanScope = "Specific ward(s)";
      if (Array.isArray(targetWards)) {
        formattedWards = targetWards.join(", ");
      } else if (typeof targetWards === "string" && targetWards.trim()) {
        formattedWards = targetWards.trim();
      }
    } else if (cleanScope === "All citizens") {
      formattedWards = "All Citizens (01 - 23)";
    } else if (cleanScope === "Entire municipality" || cleanScope === "Entire Municipality") {
      cleanScope = "Entire municipality";
      formattedWards = "Entire Municipality (City-Wide)";
    } else if (cleanScope === "Emergency / city-wide") {
      formattedWards = "All Wards (Emergency Broadcast)";
      cleanEmergency = true;
      cleanPriority = "Urgent";
    }

    // 5. Validation: Priority
    const validPriorities = ["Normal", "High", "Urgent"];
    const finalPriority = validPriorities.includes(cleanPriority) ? cleanPriority : "Normal";

    // 6. Validation: Status
    const validStatuses = ["Draft", "Published", "Archived"];
    const cleanStatus = validStatuses.includes(status) ? status : "Published";

    // 7. Persist to PostgreSQL
    const notice = await noticeDb.create({
      title: title.trim(),
      description: description.trim(),
      category: cleanCategory,
      targetScope: cleanScope as any,
      targetWards: formattedWards,
      priority: finalPriority as "Normal" | "High" | "Urgent",
      isEmergency: cleanEmergency,
      status: cleanStatus as "Draft" | "Published" | "Archived",
      publishDate: publishDate || undefined,
      expiryDate: expiryDate ? expiryDate : null,
      issuedById: null,
      issuedByName: `${admin.fullName} (${admin.role})`,
      issuedByDepartment: "Municipal Administration & Governance",
    });

    return NextResponse.json(
      {
        success: true,
        message: `Notice #${notice.id} ${notice.status === "Published" ? "published" : "drafted"} successfully.`,
        data: notice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/notices:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create notice." },
      { status: 500 }
    );
  }
}
