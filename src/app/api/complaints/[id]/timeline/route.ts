import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/authService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { complaintDb } from "@/lib/db/complaints";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/complaints/[id]/timeline
 * Returns chronological status & escalation audit timeline for a complaint.
 * Security: Enforces authenticated citizen ownership check.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const citizen = await authService.getSessionCitizen();
    if (!citizen) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view complaint timeline." },
        { status: 401 }
      );
    }

    const complaintId = params.id;
    const complaint = await complaintDb.getById(complaintId);
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found." },
        { status: 404 }
      );
    }

    // Security Check: Citizen Ownership
    if (complaint.citizenId !== citizen.id) {
      return NextResponse.json(
        { success: false, error: "Access denied. You are not authorized to view this complaint timeline." },
        { status: 403 }
      );
    }

    const timeline = await complaintDb.getTimeline(complaintId);

    return NextResponse.json({
      success: true,
      complaintId,
      status: complaint.status,
      authorityLevel: complaint.authorityLevel,
      assignedAuthority: complaint.assignedAuthority,
      deadline: complaint.deadline,
      count: timeline.length,
      data: timeline,
    });
  } catch (error) {
    console.error(`Error retrieving timeline for complaint ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while retrieving timeline." },
      { status: 500 }
    );
  }
}
