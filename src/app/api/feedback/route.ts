import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;

    const list = db.feedback.list({ status, category });
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve suggestions." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { citizenName, mobileNumber, wardNumber, category, suggestion } = body;

    if (!citizenName || !mobileNumber || !category || !suggestion) {
      return NextResponse.json(
        {
          success: false,
          error: "Citizen name, mobile number, category, and suggestion are required.",
        },
        { status: 400 }
      );
    }

    const cleanedMobile = mobileNumber.replace(/\D/g, "");
    if (cleanedMobile.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const record = await db.feedback.create({
      citizenName,
      mobileNumber: cleanedMobile,
      wardNumber: wardNumber?.toString(),
      category,
      suggestion,
    });

    return NextResponse.json({
      success: true,
      message: "Suggestion submitted successfully to Lakshmeshwar TMC.",
      data: record,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit suggestion." },
      { status: 500 }
    );
  }
}
