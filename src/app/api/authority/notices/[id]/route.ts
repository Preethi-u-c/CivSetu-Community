import { NextRequest, NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { noticeDb } from "@/lib/db/notices";

export const dynamic = "force-dynamic";

/**
 * GET /api/authority/notices/[id]
 * Retrieves full notice details.
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

    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authority authentication required." },
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

    return NextResponse.json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error(`Error in GET /api/authority/notices/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/authority/notices/[id]
 * Updates notice details, priority, or publication status.
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

    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authority authentication required." },
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

    const body = await req.json().catch(() => ({}));
    const updated = await noticeDb.update(params.id, body);

    return NextResponse.json({
      success: true,
      message: `Notice #${params.id} updated successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error(`Error in PATCH /api/authority/notices/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/authority/notices/[id]
 * Deletes notice from PostgreSQL.
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

    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authority authentication required." },
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

    await noticeDb.delete(params.id);

    return NextResponse.json({
      success: true,
      message: `Notice #${params.id} deleted successfully.`,
    });
  } catch (error) {
    console.error(`Error in DELETE /api/authority/notices/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
