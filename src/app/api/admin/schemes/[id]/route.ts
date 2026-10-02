import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { schemesDb, UpdateSchemeParams, SchemeCategory, SCHEME_CATEGORIES } from "@/lib/db/schemes";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/schemes/[id]
 * Fetch a single scheme by ID (any status)
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

    const scheme = await schemesDb.getById(params.id);
    if (!scheme) {
      return NextResponse.json(
        { success: false, error: "Government scheme not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: scheme });
  } catch (error) {
    console.error("Error in GET /api/admin/schemes/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch government scheme." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/schemes/[id]
 * Update a scheme's details or status
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

    const existing = await schemesDb.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Government scheme not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    const updateParams: UpdateSchemeParams = {};
    if (body.name !== undefined) updateParams.name = body.name;
    if (body.department !== undefined) updateParams.department = body.department;
    if (body.category !== undefined) {
      if (!SCHEME_CATEGORIES.includes(body.category as SchemeCategory)) {
        return NextResponse.json(
          { success: false, error: "Invalid scheme category." },
          { status: 400 }
        );
      }
      updateParams.category = body.category;
    }
    if (body.description !== undefined) updateParams.description = body.description;
    if (body.eligibility !== undefined) updateParams.eligibility = body.eligibility;
    if (body.documentsRequired !== undefined) {
      if (Array.isArray(body.documentsRequired)) {
        updateParams.documentsRequired = body.documentsRequired;
      } else if (typeof body.documentsRequired === "string") {
        updateParams.documentsRequired = body.documentsRequired.split("\n").map((d: string) => d.trim()).filter(Boolean);
      }
    }
    if (body.applicationProcess !== undefined) updateParams.applicationProcess = body.applicationProcess;
    if (body.benefits !== undefined) updateParams.benefits = body.benefits;
    if (body.deadline !== undefined) updateParams.deadline = body.deadline;
    if (body.officialLink !== undefined) updateParams.officialLink = body.officialLink;
    if (body.contactInfo !== undefined) updateParams.contactInfo = body.contactInfo;
    if (body.status !== undefined) {
      if (!["Active", "Draft", "Closed"].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "Status must be Active, Draft, or Closed." },
          { status: 400 }
        );
      }
      updateParams.status = body.status;
    }

    const updated = await schemesDb.update(params.id, updateParams);

    return NextResponse.json({
      success: true,
      message: "Government scheme updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/schemes/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update government scheme." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/schemes/[id]
 * Delete a scheme
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

    const existing = await schemesDb.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Government scheme not found." },
        { status: 404 }
      );
    }

    const deleted = await schemesDb.delete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete government scheme." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Government scheme #${params.id} has been deleted.`,
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/schemes/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete government scheme." },
      { status: 500 }
    );
  }
}
