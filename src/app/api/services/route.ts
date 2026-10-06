import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { servicesDb } from "@/lib/db/services";

export const dynamic = "force-dynamic";

/**
 * GET /api/services
 * Public endpoint: Returns active citizen municipal services.
 * Supports category, department, and search keyword filters.
 */
export async function GET(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const department = searchParams.get("department") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const services = await servicesDb.listPublic({
      category,
      department,
      search,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        count: services.length,
        data: services,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/services:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching services." },
      { status: 500 }
    );
  }
}
