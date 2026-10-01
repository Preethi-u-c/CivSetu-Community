import { NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
import { authorityDb } from "@/lib/db/authority";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Authority authentication required." },
        { status: 401 }
      );
    }

    const departments = authorityDb.getDepartments();
    const officers = await authorityDb.listAll();

    return NextResponse.json({
      success: true,
      data: {
        departments,
        officers,
      },
    });
  } catch (error) {
    console.error("Error in /api/authority/departments:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
