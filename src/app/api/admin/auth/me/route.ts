import { NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, authenticated: false, admin: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      admin,
    });
  } catch (error) {
    console.error("Error in /api/admin/auth/me:", error);
    return NextResponse.json(
      { success: false, authenticated: false, admin: null },
      { status: 500 }
    );
  }
}
