import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { servicesDb } from "@/lib/db/services";

export const dynamic = "force-dynamic";

/**
 * GET /api/services/[id]
 * Public endpoint: Returns details of an active citizen service.
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

    const service = await servicesDb.getById(params.id);
    if (!service || service.status !== "Active") {
      return NextResponse.json(
        { success: false, error: "Citizen service not found or currently suspended." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error in GET /api/services/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch citizen service." },
      { status: 500 }
    );
  }
}
