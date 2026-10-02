import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { schemesDb, CreateSchemeParams, SchemeCategory, SCHEME_CATEGORIES } from "@/lib/db/schemes";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/schemes
 * Admin endpoint: List all government schemes with stats, category, department, and status filtering.
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
    const status = (searchParams.get("status") as "ALL" | "Active" | "Draft" | "Closed") || undefined;
    const category = searchParams.get("category") || undefined;
    const department = searchParams.get("department") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const [listResult, stats] = await Promise.all([
      schemesDb.list({
        status,
        category,
        department,
        search,
        limit,
        offset,
      }),
      schemesDb.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: listResult.schemes,
      total: listResult.total,
      stats,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/schemes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve schemes." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/schemes
 * Admin endpoint: Create a new government scheme.
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
      department,
      category,
      description,
      eligibility,
      documentsRequired,
      applicationProcess,
      benefits,
      deadline,
      officialLink,
      contactInfo,
      status,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Scheme name is required." },
        { status: 400 }
      );
    }

    if (!department || typeof department !== "string" || !department.trim()) {
      return NextResponse.json(
        { success: false, error: "Department is required." },
        { status: 400 }
      );
    }

    if (!category || !SCHEME_CATEGORIES.includes(category as SchemeCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: `Category must be one of: ${SCHEME_CATEGORIES.join(", ")}`,
        },
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

    if (!applicationProcess || typeof applicationProcess !== "string" || !applicationProcess.trim()) {
      return NextResponse.json(
        { success: false, error: "Application process is required." },
        { status: 400 }
      );
    }

    if (!benefits || typeof benefits !== "string" || !benefits.trim()) {
      return NextResponse.json(
        { success: false, error: "Scheme benefits are required." },
        { status: 400 }
      );
    }

    if (!contactInfo || typeof contactInfo !== "string" || !contactInfo.trim()) {
      return NextResponse.json(
        { success: false, error: "Contact information is required." },
        { status: 400 }
      );
    }

    let docs: string[] = [];
    if (Array.isArray(documentsRequired)) {
      docs = documentsRequired.map((d: string) => String(d).trim()).filter(Boolean);
    } else if (typeof documentsRequired === "string" && documentsRequired.trim()) {
      docs = documentsRequired.split("\n").map((d: string) => d.trim()).filter(Boolean);
    }

    const createParams: CreateSchemeParams = {
      name: name.trim(),
      department: department.trim(),
      category: category as SchemeCategory,
      description: description.trim(),
      eligibility: eligibility.trim(),
      documentsRequired: docs,
      applicationProcess: applicationProcess.trim(),
      benefits: benefits.trim(),
      deadline: deadline?.trim() || null,
      officialLink: officialLink?.trim() || null,
      contactInfo: contactInfo.trim(),
      status: status || "Active",
    };

    const createdScheme = await schemesDb.create(createParams);

    return NextResponse.json(
      {
        success: true,
        message: "Government scheme created successfully.",
        data: createdScheme,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/schemes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create government scheme." },
      { status: 500 }
    );
  }
}
