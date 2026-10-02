import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { newsDb } from "@/lib/db/news";

export const dynamic = "force-dynamic";

/**
 * GET /api/news/[id]
 * Public endpoint: Returns a single published news article by ID and increments view count.
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

    const article = await newsDb.getById(params.id, true);
    if (!article || !article.isPublished) {
      return NextResponse.json(
        { success: false, error: "News article not found or not published." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("Error in GET /api/news/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news article." },
      { status: 500 }
    );
  }
}
