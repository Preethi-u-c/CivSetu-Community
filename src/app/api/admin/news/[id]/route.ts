import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { newsDb, UpdateNewsArticleParams } from "@/lib/db/news";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/news/[id]
 * Fetch a single news article by ID
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

    const article = await newsDb.getById(params.id, false);
    if (!article) {
      return NextResponse.json(
        { success: false, error: "News article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("Error in GET /api/admin/news/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news article." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/news/[id]
 * Update a news article's fields or publication state
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

    const existing = await newsDb.getById(params.id, false);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "News article not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Check if togglePublish action
    if (body.togglePublish === true) {
      const updated = await newsDb.togglePublish(params.id);
      return NextResponse.json({
        success: true,
        message: `Article ${updated.isPublished ? "published" : "unpublished"} successfully.`,
        data: updated,
      });
    }

    const updateParams: UpdateNewsArticleParams = {};
    if (body.headline !== undefined) updateParams.headline = body.headline;
    if (body.imageUrl !== undefined) updateParams.imageUrl = body.imageUrl;
    if (body.summary !== undefined) updateParams.summary = body.summary;
    if (body.article !== undefined) updateParams.article = body.article;
    if (body.category !== undefined) updateParams.category = body.category;
    if (body.wardRelevance !== undefined) updateParams.wardRelevance = body.wardRelevance;
    if (body.isPublished !== undefined) updateParams.isPublished = Boolean(body.isPublished);
    if (body.publishedAt !== undefined) updateParams.publishedAt = body.publishedAt;
    if (body.authorName !== undefined) updateParams.authorName = body.authorName;
    if (body.readTimeMinutes !== undefined) updateParams.readTimeMinutes = Number(body.readTimeMinutes);

    const updated = await newsDb.update(params.id, updateParams);

    return NextResponse.json({
      success: true,
      message: "News article updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/news/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update news article." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/news/[id]
 * Delete a news article
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

    const existing = await newsDb.getById(params.id, false);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "News article not found." },
        { status: 404 }
      );
    }

    const deleted = await newsDb.delete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete news article." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `News article #${params.id} has been deleted.`,
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/news/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete news article." },
      { status: 500 }
    );
  }
}
