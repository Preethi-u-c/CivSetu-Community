import { NextRequest, NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
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
    const identifier = (body.identifier || body.email || "").trim();
    const password = body.password || "";

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Officer email/Staff ID and password are required." },
        { status: 400 }
      );
    }

    const result = await authorityService.login(identifier, password);
    if (!result.success || !result.authority) {
      return NextResponse.json(
        { success: false, error: result.error || "Authentication failed. Please verify officer credentials." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authority authentication successful.",
      data: result.authority,
    });
  } catch (error) {
    console.error("Error in /api/authority/auth/login:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during authority login." },
      { status: 500 }
    );
  }
}
