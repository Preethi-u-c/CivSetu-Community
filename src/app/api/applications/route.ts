import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceCode = searchParams.get("serviceCode") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const mobile = searchParams.get("mobile") || undefined;

    let list = db.applications.list({ serviceCode, status, search });
    if (mobile) {
      const cleanMobile = mobile.replace(/\D/g, "");
      list = list.filter((a) => a.mobileNumber.replace(/\D/g, "").includes(cleanMobile));
    }
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error("Error retrieving applications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve service applications." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceCode,
      serviceName,
      applicantName,
      mobileNumber,
      email,
      wardNumber,
      address,
      details,
    } = body;

    if (!serviceCode || !applicantName || !mobileNumber || !address) {
      return NextResponse.json(
        {
          success: false,
          error: "Service code, applicant name, mobile number, and address are required.",
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

    const record = await db.applications.create({
      serviceCode,
      serviceName: serviceName || serviceCode,
      applicantName,
      mobileNumber: cleanedMobile,
      email,
      wardNumber: wardNumber?.toString(),
      address,
      details: details || {},
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully.",
      data: record,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit municipal application." },
      { status: 500 }
    );
  }
}
