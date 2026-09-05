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
        { success: false, error: "Application tracking ID is required." },
        { status: 400 }
      );
    }

    const record = db.applications.getById(id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: `Application reference '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Error retrieving application details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to look up application." },
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
    const { status, officialRemarks, updatedBy, note } = body;

    const updated = await db.applications.update(id, {
      status,
      officialRemarks,
      updatedBy,
      note,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Application '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update application." },
      { status: 500 }
    );
  }
}
