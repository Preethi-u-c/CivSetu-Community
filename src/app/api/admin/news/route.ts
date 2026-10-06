import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { newsDb, CreateNewsArticleParams } from "@/lib/db/news";
import { notificationService } from "@/lib/services/notificationService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/news
 * Admin endpoint: List all news articles (drafts & published) with stats, category filter, and search.
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
    const status = (searchParams.get("status") as "ALL" | "Published" | "Draft") || undefined;
    const category = searchParams.get("category") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const [listResult, stats] = await Promise.all([
      newsDb.list({
        status,
        category,
        ward,
        search,
        limit,
        offset,
      }),
      newsDb.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: listResult.articles,
      total: listResult.total,
      stats,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/news:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve news articles." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/news
 * Admin endpoint: Create a new news article.
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
        { success: false, error: "Unauthorized administrative access." },
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
      publishedAt,
      authorName,
      readTimeMinutes,
    } = body;

    // Validation
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

    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { success: false, error: "Category is required." },
        { status: 400 }
      );
    }

    const createParams: CreateNewsArticleParams = {
      headline: headline.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      summary: summary.trim(),
      article: article.trim(),
      category: category.trim(),
      wardRelevance: wardRelevance?.trim() || "All Wards",
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      publishedAt: publishedAt || new Date().toISOString(),
      authorName: authorName?.trim() || admin.fullName || "CivSetu News Desk",
      readTimeMinutes: Number(readTimeMinutes) || undefined,
    };

    const createdArticle = await newsDb.create(createParams);

    if (createdArticle.isPublished) {
      notificationService.notifyNewsPublished({
        id: createdArticle.id,
        headline: createdArticle.headline,
        summary: createdArticle.summary,
        category: createdArticle.category,
        wardRelevance: createdArticle.wardRelevance,
        authorName: createdArticle.authorName,
        imageUrl: createdArticle.imageUrl,
      }).catch((err) => console.error("Failed to dispatch news notification:", err));
    }

    return NextResponse.json(
      {
        success: true,
        message: "News article created successfully.",
        data: createdArticle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/news:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create news article." },
      { status: 500 }
    );
  }
}
