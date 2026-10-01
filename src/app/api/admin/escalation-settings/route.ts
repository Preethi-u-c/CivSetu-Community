import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminEscalationDb } from "@/lib/db/admin";

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

    const settings = await adminEscalationDb.list();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error in /api/admin/escalation-settings GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load escalation settings." },
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
    const tierLevel = (body.tierLevel || "").trim();

    if (!tierLevel) {
      return NextResponse.json(
        { success: false, error: "Tier Level is required for update." },
        { status: 400 }
      );
    }

    const updated = await adminEscalationDb.updateTier(tierLevel, {
      title: body.title,
      targetAuthority: body.targetAuthority,
      slaHours: body.slaHours !== undefined ? Number(body.slaHours) : undefined,
      nextTier: body.nextTier,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Escalation tier not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Escalation tier '${tierLevel}' updated successfully.`,
      data: updated,
    });
  } catch (error) {
    console.error("Error in /api/admin/escalation-settings PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update escalation tier." },
      { status: 500 }
    );
  }
}
