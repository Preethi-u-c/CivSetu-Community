import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { isPostgresConfigured } from "@/lib/db/postgres";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const identifier = (body.identifier || body.username || body.email || body.usernameOrEmail || "").trim();
    const password = body.password || "";

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Administrator username/email and password are required." },
        { status: 400 }
      );
    }

    const result = await adminService.login(identifier, password);
    if (!result.success || !result.admin) {
      return NextResponse.json(
        { success: false, error: result.error || "Authentication failed. Invalid administrator credentials." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Administrator authentication successful.",
      data: result.admin,
      admin: result.admin,
    });
  } catch (error) {
    console.error("Error in /api/admin/auth/login:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during admin login." },
      { status: 500 }
    );
  }
}
