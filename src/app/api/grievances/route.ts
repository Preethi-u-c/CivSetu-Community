import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const search = searchParams.get("search") || undefined;

    const list = db.grievances.list({ status, category, ward, search });
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Error retrieving grievances:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error retrieving grievances" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { citizenName, mobileNumber, wardNumber, category, subject, description, priority } = body;

    if (!citizenName || !mobileNumber || !category || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Citizen name, mobile number, category, and description are required fields.",
        },
        { status: 400 }
      );
    }

    // Validate phone number loosely (10 digits)
    const cleanedMobile = mobileNumber.replace(/\D/g, "");
    if (cleanedMobile.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const record = await db.grievances.create({
      citizenName,
      mobileNumber: cleanedMobile,
      wardNumber: wardNumber ? wardNumber.toString() : undefined,
      category,
      subject: subject || `${category.toUpperCase()} issue reported by ${citizenName}`,
      description,
      priority: priority === "HIGH" || priority === "URGENT" ? priority : "NORMAL",
    });

    return NextResponse.json({
      success: true,
      message: "Grievance registered successfully.",
      data: record,
    });
  } catch (error) {
    console.error("Failed to create grievance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register grievance." },
      { status: 500 }
    );
  }
}
