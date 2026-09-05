import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Tracking ID or phone number is required." },
        { status: 400 }
      );
    }

    const record = db.grievances.getById(id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: `Grievance reference '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Error looking up grievance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to look up grievance." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, priority, assignedDepartment, officialRemarks, note, updatedBy } = body;

    const updated = await db.grievances.update(id, {
      status,
      priority,
      assignedDepartment,
      officialRemarks,
      note,
      updatedBy,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Grievance '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Grievance updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating grievance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update grievance." },
      { status: 500 }
    );
  }
}
