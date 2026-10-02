import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import {
  servicesDb,
  CreateServiceParams,
  ServiceCategory,
  SERVICE_CATEGORIES,
} from "@/lib/db/services";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/services
 * Admin endpoint: List all citizen services with stats, category, department, and status filters.
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
    const status = (searchParams.get("status") as "ALL" | "Active" | "Draft" | "Suspended") || undefined;
    const category = searchParams.get("category") || undefined;
    const department = searchParams.get("department") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const [listResult, stats] = await Promise.all([
      servicesDb.list({
        status,
        category,
        department,
        search,
        limit,
        offset,
      }),
      servicesDb.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: listResult.services,
      total: listResult.total,
      stats,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/services:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve citizen services." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/services
 * Admin endpoint: Create a new municipal citizen service.
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
      name,
      category,
      department,
      description,
      eligibility,
      requiredDocuments,
      procedure,
      expectedTimeline,
      contact,
      onlineApplicationLink,
      fee,
      status,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Service name is required." },
        { status: 400 }
      );
    }

    if (!category || !SERVICE_CATEGORIES.includes(category as ServiceCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: `Category must be one of: ${SERVICE_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!department || typeof department !== "string" || !department.trim()) {
      return NextResponse.json(
        { success: false, error: "Department is required." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { success: false, error: "Description is required." },
        { status: 400 }
      );
    }

    if (!eligibility || typeof eligibility !== "string" || !eligibility.trim()) {
      return NextResponse.json(
        { success: false, error: "Eligibility criteria is required." },
        { status: 400 }
      );
    }

    if (!procedure || typeof procedure !== "string" || !procedure.trim()) {
      return NextResponse.json(
        { success: false, error: "Procedure is required." },
        { status: 400 }
      );
    }

    if (!expectedTimeline || typeof expectedTimeline !== "string" || !expectedTimeline.trim()) {
      return NextResponse.json(
        { success: false, error: "Expected timeline (SLA) is required." },
        { status: 400 }
      );
    }

    if (!contact || typeof contact !== "string" || !contact.trim()) {
      return NextResponse.json(
        { success: false, error: "Contact information is required." },
        { status: 400 }
      );
    }

    let docs: string[] = [];
    if (Array.isArray(requiredDocuments)) {
      docs = requiredDocuments.map((d: string) => String(d).trim()).filter(Boolean);
    } else if (typeof requiredDocuments === "string" && requiredDocuments.trim()) {
      docs = requiredDocuments.split("\n").map((d: string) => d.trim()).filter(Boolean);
    }

    const createParams: CreateServiceParams = {
      name: name.trim(),
      category: category as ServiceCategory,
      department: department.trim(),
      description: description.trim(),
      eligibility: eligibility.trim(),
      requiredDocuments: docs,
      procedure: procedure.trim(),
      expectedTimeline: expectedTimeline.trim(),
      contact: contact.trim(),
      onlineApplicationLink: onlineApplicationLink?.trim() || null,
      fee: fee?.trim() || null,
      status: status || "Active",
    };

    const createdService = await servicesDb.create(createParams);

    return NextResponse.json(
      {
        success: true,
        message: "Citizen service created successfully.",
        data: createdService,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/services:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create citizen service." },
      { status: 500 }
    );
  }
}
