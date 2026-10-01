import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/adminService";
import { getPool, ensurePostgresTables } from "@/lib/db/postgres";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await adminService.getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access. Please log in." },
        { status: 401 }
      );
    }

    const complaintId = params.id;
    if (!complaintId) {
      return NextResponse.json(
        { success: false, error: "Complaint ID is required." },
        { status: 400 }
      );
    }

    await ensurePostgresTables();
    const pool = getPool();

    const complaintRes = await pool.query(
      `SELECT
         c.id, c.title, c.description, c.category, c.ward, c.address,
         c.latitude, c.longitude, c.photo_url, c.status, c.priority,
         c.assigned_authority, c.authority_level, c.deadline,
         c.resolution_notes, c.resolved_at, c.closed_at,
         c.reopened_reason, c.escalation_reason, c.escalated_at,
         c.created_at, c.updated_at,
         cit.id AS citizen_id, cit.full_name AS citizen_name,
         cit.mobile_number AS citizen_mobile, cit.email AS citizen_email
       FROM complaints c
       LEFT JOIN citizens cit ON c.citizen_id = cit.id
       WHERE c.id = $1 LIMIT 1;`,
      [complaintId]
    );

    if (complaintRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Complaint not found." },
        { status: 404 }
      );
    }

    const r = complaintRes.rows[0];

    const timelineRes = await pool.query(
      `SELECT id, status, action, note, updated_by, authority_level, assigned_to, created_at
       FROM complaint_timeline
       WHERE complaint_id = $1
       ORDER BY created_at ASC;`,
      [complaintId]
    );

    const timeline = timelineRes.rows.map((t) => ({
      id: t.id,
      status: t.status,
      action: t.action,
      note: t.note,
      updatedBy: t.updated_by,
      authorityLevel: t.authority_level,
      assignedTo: t.assigned_to,
      createdAt: t.created_at instanceof Date ? t.created_at.toISOString() : String(t.created_at),
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        ward: r.ward,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        photoUrl: r.photo_url,
        status: r.status,
        priority: r.priority,
        assignedAuthority: r.assigned_authority,
        authorityLevel: r.authority_level,
        deadline: r.deadline instanceof Date ? r.deadline.toISOString() : String(r.deadline),
        resolutionNotes: r.resolution_notes,
        resolvedAt: r.resolved_at ? (r.resolved_at instanceof Date ? r.resolved_at.toISOString() : String(r.resolved_at)) : null,
        closedAt: r.closed_at ? (r.closed_at instanceof Date ? r.closed_at.toISOString() : String(r.closed_at)) : null,
        reopenedReason: r.reopened_reason,
        escalationReason: r.escalation_reason,
        escalatedAt: r.escalated_at ? (r.escalated_at instanceof Date ? r.escalated_at.toISOString() : String(r.escalated_at)) : null,
        createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
        updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
        citizen: {
          id: r.citizen_id,
          name: r.citizen_name,
          mobile: r.citizen_mobile,
          email: r.citizen_email,
        },
        timeline,
      },
    });
  } catch (error) {
    console.error("Error in /api/admin/complaints/[id] GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve complaint details." },
      { status: 500 }
    );
  }
}
