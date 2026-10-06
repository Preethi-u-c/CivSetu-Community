import { NextRequest, NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { newsDb, CreateNewsArticleParams } from "@/lib/db/news";
import { notificationService } from "@/lib/services/notificationService";

export const dynamic = "force-dynamic";

/**
 * GET /api/authority/news
 * Authority endpoint: List news articles with optional filters.
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
        { success: false, error: "Unauthorized officer access. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const search = searchParams.get("search") || undefined;
    const statusParam = searchParams.get("status") || "ALL";

    const filterStatus =
      statusParam === "Published"
        ? "Published"
        : statusParam === "Draft"
        ? "Draft"
        : "ALL";

    const [articles, stats] = await Promise.all([
      newsDb.list({
        category: category && category !== "ALL" ? category : undefined,
        ward: ward && ward !== "ALL" ? ward : undefined,
        search: search && search.trim() ? search.trim() : undefined,
        status: filterStatus,
      }),
      newsDb.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: articles,
      stats,
    });
  } catch (error) {
    console.error("Error in GET /api/authority/news:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve news articles." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/authority/news
 * Authority endpoint: Create and publish local news bulletins (Requirement 3).
 * Triggers dual notification to citizens (Requirement 7).
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
        { success: false, error: "Unauthorized officer access." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      headline,
      imageUrl,
      summary,
      article,
      category,
      wardRelevance,
      isPublished,
      readTimeMinutes,
    } = body;

    if (!headline || typeof headline !== "string" || !headline.trim()) {
      return NextResponse.json(
        { success: false, error: "Headline is required." },
        { status: 400 }
      );
    }

    if (!summary || typeof summary !== "string" || !summary.trim()) {
      return NextResponse.json(
        { success: false, error: "Article summary is required." },
        { status: 400 }
      );
    }

    if (!article || typeof article !== "string" || !article.trim()) {
      return NextResponse.json(
        { success: false, error: "Full article content is required." },
        { status: 400 }
      );
    }

    const officerAuthor = `${authority.fullName} (${authority.designation})`;

    const createParams: CreateNewsArticleParams = {
      headline: headline.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      summary: summary.trim(),
      article: article.trim(),
      category: (category && category.trim()) || "Civic Development",
      wardRelevance: wardRelevance?.trim() || "All Wards",
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      publishedAt: new Date().toISOString(),
      authorName: officerAuthor,
      readTimeMinutes: Number(readTimeMinutes) || undefined,
    };

    const createdArticle = await newsDb.create(createParams);

    // Notify citizens of newly published local news (Requirement 7)
    if (createdArticle.isPublished) {
      notificationService.notifyNewsPublished({
        id: createdArticle.id,
        headline: createdArticle.headline,
        summary: createdArticle.summary,
        category: createdArticle.category,
        wardRelevance: createdArticle.wardRelevance,
        authorName: createdArticle.authorName,
        imageUrl: createdArticle.imageUrl,
      }).catch((err) => console.error("Failed to dispatch authority news notification:", err));
    }

    return NextResponse.json(
      {
        success: true,
        message: "News bulletin created successfully.",
        data: createdArticle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/authority/news:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create news bulletin." },
      { status: 500 }
    );
  }
}
