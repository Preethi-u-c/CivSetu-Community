import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminCategoriesDb } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const categories = await adminCategoriesDb.listComplaintCategories();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error in /api/admin/complaint-categories GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load complaint categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const id = (body.id || "").trim();
    const name = (body.name || "").trim();
    const department = (body.department || "").trim();
    const description = (body.description || "").trim();

    if (!id || !name || !department) {
      return NextResponse.json(
        { success: false, error: "Category ID, Name, and Department are required." },
        { status: 400 }
      );
    }

    const category = await adminCategoriesDb.addComplaintCategory({
      id,
      name,
      department,
      description,
    });

    return NextResponse.json({
      success: true,
      message: "Complaint category added successfully.",
      data: category,
    }, { status: 201 });
  } catch (error) {
    console.error("Error in /api/admin/complaint-categories POST:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add complaint category." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const id = (body.id || "").trim();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required for update." },
        { status: 400 }
      );
    }

    const updated = await adminCategoriesDb.updateComplaintCategory(id, {
      name: body.name,
      department: body.department,
      description: body.description,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Complaint category not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Complaint category updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error in /api/admin/complaint-categories PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update complaint category." },
      { status: 500 }
    );
  }
}
