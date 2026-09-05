import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("all") !== "true";

    const list = db.notices.list(publishedOnly);
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Error retrieving notices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve notices." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, titleKn, category, categoryKn, content, contentKn, fileUrl, isPinned } = body;

    if (!title || !category || !content) {
      return NextResponse.json(
        { success: false, error: "Title, category, and content are required fields." },
        { status: 400 }
      );
    }

    const record = await db.notices.create({
      title,
      titleKn: titleKn || title,
      category,
      categoryKn: categoryKn || category,
      content,
      contentKn: contentKn || content,
      fileUrl,
      isPinned: !!isPinned,
    });

    return NextResponse.json({
      success: true,
      message: "Notice published successfully.",
      data: record,
    });
  } catch (error) {
    console.error("Error publishing notice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish notice." },
      { status: 500 }
    );
  }
}
