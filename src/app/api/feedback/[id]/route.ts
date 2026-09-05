import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, officialNote } = body;

    const updated = await db.feedback.updateStatus(id, status, officialNote);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Suggestion '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feedback status updated.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update feedback status." },
      { status: 500 }
    );
  }
}
