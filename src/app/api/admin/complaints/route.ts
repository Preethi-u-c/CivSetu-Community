import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { getPool, ensurePostgresTables } from "@/lib/db/postgres";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    await ensurePostgresTables();
    const pool = getPool();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const ward = searchParams.get("ward") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    const conditions: string[] = ["1=1"];
    const queryParams: unknown[] = [];
    let pIdx = 1;

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(
        `(c.id ILIKE $${pIdx} OR c.title ILIKE $${pIdx} OR c.description ILIKE $${pIdx} OR cit.full_name ILIKE $${pIdx} OR cit.mobile_number ILIKE $${pIdx})`
      );
      queryParams.push(q);
      pIdx++;
    }

    if (status && status !== "ALL") {
      conditions.push(`c.status = $${pIdx}`);
      queryParams.push(status);
      pIdx++;
    }

    if (category && category !== "ALL") {
      conditions.push(`c.category = $${pIdx}`);
      queryParams.push(category);
      pIdx++;
    }

    if (ward && ward !== "ALL") {
      conditions.push(`(c.ward = $${pIdx} OR c.ward ILIKE $${pIdx})`);
      queryParams.push(ward);
      pIdx++;
    }

    if (priority && priority !== "ALL") {
      conditions.push(`c.priority = $${pIdx}`);
      queryParams.push(priority);
      pIdx++;
    }

    const whereClause = conditions.join(" AND ");

    const countRes = await pool.query(
      `SELECT COUNT(*) AS total
       FROM complaints c
       LEFT JOIN citizens cit ON c.citizen_id = cit.id
       WHERE ${whereClause};`,
      queryParams
    );
    const total = parseInt(countRes.rows[0]?.total || "0", 10);

    const dataRes = await pool.query(
      `SELECT
         c.id, c.title, c.description, c.category, c.ward, c.address, c.status, c.priority,
         c.assigned_authority, c.authority_level, c.deadline,
         c.resolution_notes, c.resolved_at, c.created_at,
         cit.full_name AS citizen_name, cit.mobile_number AS citizen_mobile
       FROM complaints c
       LEFT JOIN citizens cit ON c.citizen_id = cit.id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${pIdx} OFFSET $${pIdx + 1};`,
      [...queryParams, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: {
        complaints: dataRes.rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          ward: r.ward,
          address: r.address,
          status: r.status,
          priority: r.priority,
          assignedAuthority: r.assigned_authority,
          authorityLevel: r.authority_level,
          deadline: r.deadline instanceof Date ? r.deadline.toISOString() : String(r.deadline),
          resolutionNotes: r.resolution_notes,
          resolvedAt: r.resolved_at ? (r.resolved_at instanceof Date ? r.resolved_at.toISOString() : String(r.resolved_at)) : null,
          createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
          citizenName: r.citizen_name,
          citizenMobile: r.citizen_mobile,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error in /api/admin/complaints GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load complaints." },
      { status: 500 }
    );
  }
}
