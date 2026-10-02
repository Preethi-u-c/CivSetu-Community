import { NextRequest, NextResponse } from "next/server";
import { authorityService } from "@/lib/services/authorityService";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { complaintDb, ComplaintStatus, AuthorityLevel } from "@/lib/db/complaints";
import { notificationService } from "@/lib/services/notificationService";
import { auditService } from "@/lib/services/auditService";
import { enforceRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { isValidComplaintId, sanitizeString } from "@/lib/security/validator";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/authority/complaints/[id]
 * Retrieves comprehensive complaint details, citizen contact info, and full chronological timeline for municipal officers.
 * Security: Strictly enforces authority authentication.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authority credentials required." },
        { status: 401 }
      );
    }

    const complaintId = params.id;
    if (!isValidComplaintId(complaintId)) {
      return NextResponse.json(
        { success: false, error: "A valid complaint ID is required." },
        { status: 400 }
      );
    }

    const complaint = await complaintDb.getById(complaintId);
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found." },
        { status: 404 }
      );
    }

    if (authority.authorityLevel !== complaint.authorityLevel) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to access this complaint." },
        { status: 403 }
      );
    }

    const timeline = await complaintDb.getTimeline(complaintId);

    return NextResponse.json({
      success: true,
      data: {
        ...complaint,
        timeline,
      },
    });
  } catch (error) {
    console.error(`Error in GET /api/authority/complaints/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while fetching complaint details." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/authority/complaints/[id]
 * Performs official municipal actions on a complaint:
 * - Accept
 * - Assign
 * - Change Status
 * - Add Official Remark
 * - Request Information
 * - Escalate
 * - Resolve
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    if (!isPostgresConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 503 }
      );
    }

    const authority = await authorityService.getSessionAuthority();
    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Authority credentials required to perform municipal action." },
        { status: 401 }
      );
    }

    const rateLimit = enforceRateLimit(req, "complaints", {
      identifier: `authority:${authority.id}:${getClientIp(req)}`,
      limit: 30,
      windowMs: 60_000,
    });
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetSeconds) } }
      );
    }

    const complaintId = params.id;
    if (!isValidComplaintId(complaintId)) {
      return NextResponse.json(
        { success: false, error: "A valid complaint ID is required." },
        { status: 400 }
      );
    }
    const complaint = await complaintDb.getById(complaintId);
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found." },
        { status: 404 }
      );
    }

    if (authority.authorityLevel !== complaint.authorityLevel) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to modify this complaint." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, status, assignedAuthority, authorityLevel } = body;
    const cleanText = (value: unknown, maxLength = 2_000) => {
      const text = sanitizeString(value);
      return text.length <= maxLength ? text : null;
    };
    const note = cleanText(body.note || body.notes);
    const reason = cleanText(body.reason || body.note || body.notes);
    const resolutionNotes = cleanText(body.resolutionNotes || body.note || body.notes, 4_000);
    if (note === null || reason === null || resolutionNotes === null) {
      return NextResponse.json(
        { success: false, error: "Text fields exceed the maximum allowed length." },
        { status: 400 }
      );
    }

    const officerSignature = `${authority.fullName} (${authority.designation})`;
    const oldState = {
      status: complaint.status,
      assignedAuthority: complaint.assignedAuthority,
      authorityLevel: complaint.authorityLevel,
    };
    const logAction = async (actionName: string, updated: typeof complaint, details?: string) => {
      await auditService.logComplaintAction({
        actorId: authority.id,
        actorName: authority.fullName,
        actorRole: authority.designation,
        action: actionName,
        complaintId,
        oldState,
        newState: {
          status: updated.status,
          assignedAuthority: updated.assignedAuthority,
          authorityLevel: updated.authorityLevel,
          resolutionNotes: updated.resolutionNotes || undefined,
        },
        details,
        ipAddress: getClientIp(req),
      });
    };

    // Safety & Lifecycle: Prevent invalid workflow transitions on resolved/closed complaints
    if ((complaint.status === "Resolved" || complaint.status === "Closed") && action !== "remark") {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid workflow transition: Grievance #${complaintId} is already ${complaint.status}. Official workflow actions are locked.`,
        },
        { status: 400 }
      );
    }

    // Action 1: Accept Complaint
    if (action === "accept") {
      const updated = await complaintDb.updateStatus(complaintId, {
        status: "Under Review",
        note: note || "Grievance accepted for formal verification and field assessment by Lakshmeshwar TMC.",
        updatedBy: officerSignature,
      });

      await notificationService.notifyComplaintAccepted(
        complaintId,
        complaint.citizenId,
        officerSignature,
        note || "Grievance accepted for formal verification and field assessment by Lakshmeshwar TMC."
      );
      await logAction("ACCEPT_COMPLAINT", updated, note || undefined);

      return NextResponse.json({
        success: true,
        message: "Grievance accepted successfully.",
        data: updated,
      });
    }

    // Action 2: Assign Department / Authority
    if (action === "assign") {
      if (!assignedAuthority || typeof assignedAuthority !== "string" || !assignedAuthority.trim()) {
        return NextResponse.json(
          { success: false, error: "Target department or authority name is required for assignment." },
          { status: 400 }
        );
      }

      const targetLevel: AuthorityLevel = authorityLevel || complaint.authorityLevel;
      const targetStatus: ComplaintStatus = complaint.status === "Submitted" ? "Assigned" : complaint.status;

      const updated = await complaintDb.updateStatus(complaintId, {
        status: targetStatus,
        assignedAuthority: assignedAuthority.trim(),
        authorityLevel: targetLevel,
        note: note || `Assigned to ${assignedAuthority.trim()} by ${officerSignature}.`,
        updatedBy: officerSignature,
      });

      await notificationService.notifyComplaintAssigned(
        complaintId,
        assignedAuthority.trim(),
        complaint.citizenId,
        targetLevel,
        note || `Assigned to ${assignedAuthority.trim()} by ${officerSignature}.`
      );
      await logAction("ASSIGN_COMPLAINT", updated, note || `Assigned to ${assignedAuthority.trim()}.`);

      return NextResponse.json({
        success: true,
        message: `Grievance successfully assigned to ${assignedAuthority.trim()}.`,
        data: updated,
      });
    }

    // Action 3: Change Status
    if (action === "status") {
      const validStatuses: ComplaintStatus[] = [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Near Deadline",
        "Escalated",
        "Resolved",
        "Reopened",
        "Closed",
      ];

      if (!status || !validStatuses.includes(status as ComplaintStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Valid values: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }

      const updated = await complaintDb.updateStatus(complaintId, {
        status: status as ComplaintStatus,
        note: note || `Status updated to "${status}" by ${officerSignature}.`,
        updatedBy: officerSignature,
      });

      if (status === "Resolved") {
        await notificationService.notifyComplaintResolved(complaintId, note || "Grievance marked as Resolved", complaint.citizenId);
      } else {
        await notificationService.notifyStatusUpdated(
          complaintId,
          status,
          note,
          complaint.citizenId,
          complaint.assignedAuthority
        );
      }
      await logAction("UPDATE_COMPLAINT_STATUS", updated, note || `Status changed to ${status}.`);

      return NextResponse.json({
        success: true,
        message: `Status updated to ${status}.`,
        data: updated,
      });
    }

    // Action 4: Add Official Remark
    if (action === "remark") {
      if (!note || typeof note !== "string" || !note.trim()) {
        return NextResponse.json(
          { success: false, error: "Remark text cannot be empty." },
          { status: 400 }
        );
      }

      await complaintDb.addTimelineEvent({
        complaintId,
        status: complaint.status,
        action: "Official Remark Added",
        note: note.trim(),
        updatedBy: officerSignature,
        authorityLevel: complaint.authorityLevel,
        assignedTo: complaint.assignedAuthority,
      });

      await notificationService.notifyRemarkAdded(complaintId, note.trim(), officerSignature, complaint.citizenId);
      await logAction("ADD_COMPLAINT_REMARK", complaint, note.trim());

      const refreshed = await complaintDb.getById(complaintId);
      const timeline = await complaintDb.getTimeline(complaintId);

      return NextResponse.json({
        success: true,
        message: "Official remark recorded successfully.",
        data: {
          ...refreshed,
          timeline,
        },
      });
    }

    // Action 5: Request Clarifying Information
    if (action === "request_info") {
      if (!note || typeof note !== "string" || !note.trim()) {
        return NextResponse.json(
          { success: false, error: "Please specify the clarification needed from the citizen." },
          { status: 400 }
        );
      }

      await complaintDb.addTimelineEvent({
        complaintId,
        status: complaint.status,
        action: "Clarification Requested",
        note: note.trim(),
        updatedBy: officerSignature,
        authorityLevel: complaint.authorityLevel,
        assignedTo: complaint.assignedAuthority,
      });

      await notificationService.notifyInformationRequested(
        complaintId,
        note.trim(),
        officerSignature,
        complaint.citizenId,
        complaint.assignedAuthority,
        complaint.authorityLevel
      );
      await logAction("REQUEST_COMPLAINT_INFORMATION", complaint, note.trim());

      return NextResponse.json({
        success: true,
        message: "Clarification request logged in grievance history.",
      });
    }

    // Action 6: Escalate Complaint
    if (action === "escalate") {
      if (!reason || typeof reason !== "string" || !reason.trim()) {
        return NextResponse.json(
          { success: false, error: "Escalation reason is required." },
          { status: 400 }
        );
      }

      const updated = await complaintDb.escalateComplaint(complaintId, reason.trim(), officerSignature);

      await notificationService.notifyComplaintEscalated(
        complaintId,
        updated.authorityLevel,
        updated.assignedAuthority,
        reason.trim(),
        complaint.citizenId
      );
      await logAction("ESCALATE_COMPLAINT", updated, reason.trim());

      return NextResponse.json({
        success: true,
        message: `Complaint escalated to ${updated.authorityLevel} (${updated.assignedAuthority}).`,
        data: updated,
      });
    }

    // Action 7: Resolve Complaint
    if (action === "resolve") {
      const cleanNotes = (resolutionNotes || note || "").toString().trim();
      if (!cleanNotes || cleanNotes.length < 5) {
        return NextResponse.json(
          { success: false, error: "Detailed resolution notes (minimum 5 characters) are required to resolve a complaint." },
          { status: 400 }
        );
      }

      const updated = await complaintDb.updateStatus(complaintId, {
        status: "Resolved",
        resolutionNotes: cleanNotes,
        note: `Grievance resolved: ${cleanNotes}`,
        updatedBy: officerSignature,
      });

      await notificationService.notifyComplaintResolved(complaintId, cleanNotes, complaint.citizenId);
      await logAction("RESOLVE_COMPLAINT", updated, cleanNotes);

      return NextResponse.json({
        success: true,
        message: "Grievance marked as Resolved successfully.",
        data: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unrecognized action "${action}". Valid actions: accept, assign, status, remark, request_info, escalate, resolve.` },
      { status: 400 }
    );
  } catch (error) {
    console.error(`Error in PATCH /api/authority/complaints/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
