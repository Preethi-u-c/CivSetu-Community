import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { schemesDb } from "@/lib/db/schemes";

export const dynamic = "force-dynamic";

/**
 * GET /api/schemes/[id]
 * Public endpoint: Returns details of an active government scheme.
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

    const scheme = await schemesDb.getById(params.id);
    if (!scheme || scheme.status !== "Active") {
      return NextResponse.json(
        { success: false, error: "Government scheme not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    console.error("Error in GET /api/schemes/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch government scheme." },
      { status: 500 }
    );
  }
}
