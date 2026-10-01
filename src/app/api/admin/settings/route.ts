import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { adminSettingsDb } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const settings = await adminSettingsDb.getAll();

    // Security check: strictly omit any secrets (case-insensitive check)
    const sanitized: Record<string, { value: string; description: string; category: string; updatedAt: string }> = {};
    for (const [key, data] of Object.entries(settings)) {
      const normalizedKey = key.toUpperCase();
      if (
        normalizedKey.includes("SECRET") ||
        normalizedKey.includes("DATABASE") ||
        normalizedKey.includes("PASSWORD") ||
        normalizedKey.includes("TOKEN")
      ) {
        continue;
      }
      sanitized[key] = data;
    }

    return NextResponse.json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    console.error("Error in /api/admin/settings GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load system settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const settings = body.settings;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { success: false, error: "Valid settings object is required." },
        { status: 400 }
      );
    }

    // Security check: sanitize incoming keys to prevent updating sensitive keys
    const safeSettings: Record<string, string> = {};
    const FORBIDDEN_SUBSTRINGS = ["SECRET", "DATABASE", "PASSWORD", "TOKEN"];
    for (const [key, val] of Object.entries(settings as Record<string, unknown>)) {
      const normalizedKey = key.toUpperCase();
      if (FORBIDDEN_SUBSTRINGS.some((sub) => normalizedKey.includes(sub))) {
        continue;
      }
      safeSettings[key] = String(val);
    }

    await adminSettingsDb.updateSettings(safeSettings);

    return NextResponse.json({
      success: true,
      message: "System settings updated successfully.",
    });
  } catch (error) {
    console.error("Error in /api/admin/settings PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update system settings." },
      { status: 500 }
    );
  }
}
