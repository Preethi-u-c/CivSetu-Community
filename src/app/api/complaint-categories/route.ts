import { NextResponse } from "next/server";
import { isPostgresConfigured, getPool, ensurePostgresTables } from "@/lib/db/postgres";

export const dynamic = "force-dynamic";

/**
 * GET /api/complaint-categories
 * Public endpoint: Returns all active municipal complaint categories.
 */
export async function GET() {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query(
      `SELECT id, name, department, description, is_active AS "isActive"
       FROM complaint_categories
       WHERE is_active = true
       ORDER BY name ASC;`
    );

    return NextResponse.json({
      success: true,
      count: res.rows.length,
      data: res.rows,
    });
  } catch (error) {
    console.error("Error in GET /api/complaint-categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve complaint categories." },
      { status: 500 }
    );
  }
}
