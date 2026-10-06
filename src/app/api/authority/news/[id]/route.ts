import { NextRequest, NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { newsDb, UpdateNewsArticleParams } from "@/lib/db/news";
import { notificationService } from "@/lib/services/notificationService";

export const dynamic = "force-dynamic";

/**
 * GET /api/authority/news/[id]
 */
export async function GET(
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
        { success: false, error: "Unauthorized officer access." },
        { status: 401 }
      );
    }

    const article = await newsDb.getById(params.id);
    if (!article) {
      return NextResponse.json(
        { success: false, error: "News article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error(`Error in GET /api/authority/news/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve news article." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/authority/news/[id]
 */
export async function PUT(
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
        { success: false, error: "Unauthorized officer access." },
        { status: 401 }
      );
    }

    const existing = await newsDb.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "News article not found." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateParams: UpdateNewsArticleParams = {
      headline: body.headline?.trim(),
      imageUrl: body.imageUrl?.trim(),
      summary: body.summary?.trim(),
      article: body.article?.trim(),
      category: body.category?.trim(),
      wardRelevance: body.wardRelevance?.trim(),
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
      publishedAt: body.publishedAt,
      readTimeMinutes: body.readTimeMinutes ? Number(body.readTimeMinutes) : undefined,
    };

    const updated = await newsDb.update(params.id, updateParams);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update news article." },
        { status: 500 }
      );
    }

    // If transitioned from draft to published, notify citizens
    if (!existing.isPublished && updated.isPublished) {
      notificationService.notifyNewsPublished({
        id: updated.id,
        headline: updated.headline,
        summary: updated.summary,
        category: updated.category,
        wardRelevance: updated.wardRelevance,
        authorName: updated.authorName,
        imageUrl: updated.imageUrl,
      }).catch((err) => console.error("Failed to dispatch news notification:", err));
    }

    return NextResponse.json({
      success: true,
      message: "News article updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(`Error in PUT /api/authority/news/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update news article." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/authority/news/[id]
 */
export async function DELETE(
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
        { success: false, error: "Unauthorized officer access." },
        { status: 401 }
      );
    }

    const success = await newsDb.delete(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "News article not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "News article deleted successfully.",
    });
  } catch (error) {
    console.error(`Error in DELETE /api/authority/news/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete news article." },
      { status: 500 }
    );
  }
}
