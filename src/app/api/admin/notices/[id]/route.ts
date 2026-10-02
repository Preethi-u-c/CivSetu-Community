import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { noticeDb } from "@/lib/db/notices";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notices/[id]
 * Fetch a single notice by ID
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

    const notice = await noticeDb.getById(params.id);
    if (!notice) {
      return NextResponse.json(
        { success: false, error: "Notice not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error("Error in GET /api/admin/notices/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notice." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/notices/[id]
 * Update a notice's fields or status
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

    const body = await req.json().catch(() => ({}));
    const updates: Parameters<typeof noticeDb.update>[1] = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.targetScope !== undefined) updates.targetScope = body.targetScope;
    if (body.targetWards !== undefined) {
      updates.targetWards = Array.isArray(body.targetWards)
        ? body.targetWards.join(", ")
        : body.targetWards;
    }
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.isEmergency !== undefined) updates.isEmergency = Boolean(body.isEmergency);
    if (body.status !== undefined) updates.status = body.status;
    if (body.publishDate !== undefined) updates.publishDate = body.publishDate;
    if (body.expiryDate !== undefined) {
      updates.expiryDate = body.expiryDate ? body.expiryDate : null;
    }

    const updated = await noticeDb.update(params.id, updates);

    return NextResponse.json({
      success: true,
      message: `Notice #${params.id} updated successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/notices/[id]:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update notice." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/notices/[id]
 * Delete a notice
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

    const deleted = await noticeDb.delete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Notice not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notice #${params.id} deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/notices/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notice." },
      { status: 500 }
    );
  }
}
