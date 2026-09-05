import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const record = db.notices.getBySlug(slug);

    if (!record) {
      return NextResponse.json(
        { success: false, error: `Notice with slug '${slug}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Error retrieving notice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve notice." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const existing = db.notices.getBySlug(slug);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Notice not found" }, { status: 404 });
    }

    const updated = await db.notices.togglePublished(existing.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error toggling notice publish state:", error);
    return NextResponse.json({ success: false, error: "Failed to toggle notice" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const existing = db.notices.getBySlug(slug);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Notice not found" }, { status: 404 });
    }

    const deleted = await db.notices.delete(existing.id);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("Error deleting notice:", error);
    return NextResponse.json({ success: false, error: "Failed to delete notice" }, { status: 500 });
  }
}
