import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import {
  servicesDb,
  UpdateServiceParams,
  ServiceCategory,
  SERVICE_CATEGORIES,
} from "@/lib/db/services";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/services/[id]
 * Fetch a single citizen service by ID (any status)
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

    const service = await servicesDb.getById(params.id);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Citizen service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    console.error("Error in GET /api/admin/services/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch citizen service." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/services/[id]
 * Update a citizen service's details or status
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

    const existing = await servicesDb.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Citizen service not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    const updateParams: UpdateServiceParams = {};
    if (body.name !== undefined) updateParams.name = body.name;
    if (body.category !== undefined) {
      if (!SERVICE_CATEGORIES.includes(body.category as ServiceCategory)) {
        return NextResponse.json(
          { success: false, error: "Invalid service category." },
          { status: 400 }
        );
      }
      updateParams.category = body.category;
    }
    if (body.department !== undefined) updateParams.department = body.department;
    if (body.description !== undefined) updateParams.description = body.description;
    if (body.eligibility !== undefined) updateParams.eligibility = body.eligibility;
    if (body.requiredDocuments !== undefined) {
      if (Array.isArray(body.requiredDocuments)) {
        updateParams.requiredDocuments = body.requiredDocuments;
      } else if (typeof body.requiredDocuments === "string") {
        updateParams.requiredDocuments = body.requiredDocuments.split("\n").map((d: string) => d.trim()).filter(Boolean);
      }
    }
    if (body.procedure !== undefined) updateParams.procedure = body.procedure;
    if (body.expectedTimeline !== undefined) updateParams.expectedTimeline = body.expectedTimeline;
    if (body.contact !== undefined) updateParams.contact = body.contact;
    if (body.onlineApplicationLink !== undefined) updateParams.onlineApplicationLink = body.onlineApplicationLink;
    if (body.fee !== undefined) updateParams.fee = body.fee;
    if (body.status !== undefined) {
      if (!["Active", "Draft", "Suspended"].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "Status must be Active, Draft, or Suspended." },
          { status: 400 }
        );
      }
      updateParams.status = body.status;
    }

    const updated = await servicesDb.update(params.id, updateParams);

    return NextResponse.json({
      success: true,
      message: "Citizen service updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/admin/services/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update citizen service." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/services/[id]
 * Delete a citizen service
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

    const existing = await servicesDb.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Citizen service not found." },
        { status: 404 }
      );
    }

    const deleted = await servicesDb.delete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete citizen service." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Citizen service #${params.id} has been deleted.`,
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/services/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete citizen service." },
      { status: 500 }
    );
  }
}
