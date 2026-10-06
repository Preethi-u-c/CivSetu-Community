import { notificationDb } from "@/lib/db/authority";
import { citizenDb } from "@/lib/db/postgres";
import { complaintDb } from "@/lib/db/complaints";
import {
  sendComplaintSubmittedEmail,
  sendComplaintUpdatedEmail,
  sendComplaintResolvedEmail,
  sendEmergencyNoticeEmail,
  sendMunicipalAnnouncementEmail,
  sendLocalNewsEmail,
} from "./emailNotificationService";
import { broadcastRealtimeEvent } from "./realtimeEvents";

export type ComplaintEventType =
  | "COMPLAINT_REGISTERED"
  | "COMPLAINT_ACCEPTED"
  | "STATUS_UPDATED"
  | "ASSIGNED"
  | "ESCALATED"
  | "RESOLVED"
  | "REMARK_ADDED"
  | "INFO_REQUESTED"
  | "SLA_WARNING"
  | "NOTICE_PUBLISHED"
  | "NEWS_PUBLISHED";

export interface DispatchNotificationParams {
  eventType: ComplaintEventType;
  complaintId?: string | null;
  citizenId?: string | null;
  authorityId?: string | null;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

async function resolveCitizenContact(
  citizenId?: string | null,
  complaintId?: string | null
): Promise<{ email?: string; name?: string }> {
  try {
    if (citizenId) {
      const citizen = await citizenDb.findById(citizenId);
      if (citizen && citizen.email) {
        return { email: citizen.email, name: citizen.fullName };
      }
    }
    if (complaintId) {
      const complaint = await complaintDb.getById(complaintId);
      if (complaint && complaint.citizenEmail) {
        return { email: complaint.citizenEmail, name: complaint.citizenName };
      }
    }
  } catch (err) {
    console.error("Warning: Failed to resolve citizen email for notification:", err);
  }
  return {};
}

/**
 * Delivers a complaint email only to the citizen who owns that complaint.
 * Keeping this in one place prevents an authority action accidentally being
 * emailed to another citizen or silently detached from the request lifecycle.
 */
async function sendToComplaintCitizen(
  citizenId: string | undefined,
  complaintId: string,
  send: (email: string, name?: string) => Promise<unknown>,
  eventName: string
): Promise<void> {
  const { email, name } = await resolveCitizenContact(citizenId, complaintId);
  if (!email) {
    console.warn(`[EMAIL DISPATCH] No citizen email available for ${eventName} on complaint ${complaintId}.`);
    return;
  }

  try {
    await send(email, name);
  } catch (error) {
    console.error(`Failed to send ${eventName} email for complaint ${complaintId}:`, error);
  }
}

export const notificationService = {
  /**
   * Dispatches a civic event across active notification channels:
   * 1. In-App Notification Record (PostgreSQL)
   * 2. Real-time Event broadcast (SSE)
   * 3. Logging & future gateway extensibility
   */
  async dispatch(params: DispatchNotificationParams): Promise<void> {
    try {
      // 1. In-App Notification Record
      await notificationDb.createNotification({
        eventType: params.eventType,
        complaintId: params.complaintId,
        citizenId: params.citizenId,
        authorityId: params.authorityId,
        title: params.title,
        message: params.message,
        channel: "in_app",
      });

      // 2. Structured event logger
      console.log(
        `[NOTIFICATION DISPATCH] Event: ${params.eventType} | Complaint: ${params.complaintId} | Title: "${params.title}"`
      );
    } catch (err) {
      console.error("Warning: Failed to dispatch in-app notification:", err);
    }
  },

  /**
   * Helper for Complaint Registered (Submitted) event
   */
  async notifyComplaintRegistered(
    complaintId: string,
    category: string,
    ward: string,
    citizenId?: string,
    extra?: {
      title?: string;
      description?: string;
      deadline?: string;
      fullComplaint?: any;
    }
  ): Promise<void> {
    const title = "New Grievance Registered";
    const message = `Grievance #${complaintId} (${category}) lodged in ${ward}. Assigned for departmental assessment.`;

    await this.dispatch({
      eventType: "COMPLAINT_REGISTERED",
      complaintId,
      citizenId,
      title,
      message,
    });

    // 1. Broadcast SSE Real-time event for immediate live UI display without refreshing
    broadcastRealtimeEvent("complaint_created", {
      complaintId,
      category,
      ward,
      title: extra?.title || `Grievance #${complaintId}`,
      status: "Submitted",
      createdAt: new Date().toISOString(),
      ...(extra?.fullComplaint || {}),
    });

    // 2. Dispatch Email to Citizen
    await sendToComplaintCitizen(citizenId, complaintId, (email, name) =>
      sendComplaintSubmittedEmail(email, {
          complaintId,
          status: "Submitted",
          category,
          ward,
          title: extra?.title || `Grievance #${complaintId}`,
          description: extra?.description,
          deadline: extra?.deadline,
          citizenName: name,
        }), "complaint-submitted");
  },

  /**
   * Helper for Complaint Accepted event
   */
  async notifyComplaintAccepted(
    complaintId: string,
    citizenId?: string,
    officerName?: string,
    note?: string
  ): Promise<void> {
    const title = "Grievance Formally Accepted";
    const message = `Your complaint #${complaintId} has been accepted for formal verification by ${officerName || "Lakshmeshwar TMC"}.`;

    await this.dispatch({
      eventType: "COMPLAINT_ACCEPTED",
      complaintId,
      citizenId,
      title,
      message,
    });

    // 1. Real-time SSE broadcast
    broadcastRealtimeEvent("complaint_updated", {
      complaintId,
      status: "Under Review",
      officerName: officerName || "Lakshmeshwar TMC",
      note: note || message,
      timestamp: new Date().toISOString(),
    });

    // 2. Email dispatch
    await sendToComplaintCitizen(citizenId, complaintId, (email, name) =>
      sendComplaintUpdatedEmail(email, {
          complaintId,
          status: "Under Review",
          assignedAuthority: officerName || "Lakshmeshwar TMC",
          note: note || "Grievance accepted for formal verification and field assessment by Lakshmeshwar TMC.",
          citizenName: name,
        }), "complaint-accepted");
  },

  /**
   * Helper for Complaint Assigned event
   */
  async notifyComplaintAssigned(
    complaintId: string,
    department: string,
    citizenId?: string,
    authorityLevel?: string,
    note?: string
  ): Promise<void> {
    const title = "Grievance Assigned to Department";
    const message = `Complaint #${complaintId} has been assigned to ${department} for on-site inspection and execution.`;

    await this.dispatch({
      eventType: "ASSIGNED",
      complaintId,
      citizenId,
      title,
      message,
    });

    // 1. Real-time SSE broadcast
    broadcastRealtimeEvent("complaint_updated", {
      complaintId,
      status: "Assigned",
      assignedAuthority: department,
      authorityLevel: authorityLevel || "Local Authority",
      timestamp: new Date().toISOString(),
    });

    // 2. Email dispatch
    await sendToComplaintCitizen(citizenId, complaintId, (email, name) =>
      sendComplaintUpdatedEmail(email, {
          complaintId,
          status: "Assigned",
          assignedAuthority: department,
          authorityLevel,
          note: note || `Assigned to ${department} for remedial action.`,
          citizenName: name,
        }), "complaint-assigned");
  },

  /**
   * Helper for Status Updated event
   */
  async notifyStatusUpdated(
    complaintId: string,
    status: string,
    note?: string,
    citizenId?: string,
    assignedAuthority?: string
  ): Promise<void> {
    const title = `Grievance Status: ${status}`;
    const message = `Status of #${complaintId} changed to "${status}". ${note ? `Remarks: "${note}"` : ""}`;

    await this.dispatch({
      eventType: "STATUS_UPDATED",
      complaintId,
      citizenId,
      title,
      message,
    });

    // 1. Real-time SSE broadcast
    broadcastRealtimeEvent("complaint_updated", {
      complaintId,
      status,
      note,
      timestamp: new Date().toISOString(),
    });

    // 2. Email dispatch
    await sendToComplaintCitizen(citizenId, complaintId, (email, name) =>
      sendComplaintUpdatedEmail(email, {
          complaintId,
          status,
          assignedAuthority,
          note,
          citizenName: name,
        }), "status-update");
  },

  /**
   * Helper for Escalation event
   */
  async notifyComplaintEscalated(
    complaintId: string,
    targetLevel: string,
    targetAuthority: string,
    reason?: string,
    citizenId?: string
  ): Promise<void> {
    const title = `Grievance Escalated to ${targetLevel}`;
    const message = `Complaint #${complaintId} has been escalated to ${targetLevel} (${targetAuthority}). Reason: ${reason || "Resolution deadline reached"}.`;

    await this.dispatch({
      eventType: "ESCALATED",
      complaintId,
      citizenId,
      title,
      message,
    });

    // 1. Real-time SSE broadcast
    broadcastRealtimeEvent("complaint_updated", {
      complaintId,
      status: "Escalated",
      authorityLevel: targetLevel,
      assignedAuthority: targetAuthority,
      escalationReason: reason,
      timestamp: new Date().toISOString(),
    });

    // 2. Email dispatch
    await sendToComplaintCitizen(citizenId, complaintId, (email, name) =>
      sendComplaintUpdatedEmail(email, {
          complaintId,
          status: "Escalated",
          assignedAuthority: targetAuthority,
          authorityLevel: targetLevel,
          note: `Escalated to ${targetLevel} (${targetAuthority}). Reason: ${reason || "Statutory resolution SLA expired without closure."}`,
          citizenName: name,
        }), "complaint-escalated");
  },

  /**
   * Helper for Resolution event
   */
  async notifyComplaintResolved(
    complaintId: string,
    notes: string,
    citizenId?: string,
    resolvedAt?: string
  ): Promise<void> {
    const title = "Grievance Resolved";
    const message = `Complaint #${complaintId} has been marked as Resolved by Lakshmeshwar TMC. Resolution details: ${notes}`;

    await this.dispatch({
      eventType: "RESOLVED",
      complaintId,
      citizenId,
      title,
      message,
    });

    // 1. Real-time SSE broadcast
    broadcastRealtimeEvent("complaint_resolved", {
      complaintId,
      status: "Resolved",
      resolutionNotes: notes,
      resolvedAt: resolvedAt || new Date().toISOString(),
    });

    // 2. Email dispatch
    await sendToComplaintCitizen(citizenId, complaintId, (email, name) =>
      sendComplaintResolvedEmail(email, {
          complaintId,
          status: "Resolved",
          resolutionNotes: notes,
          resolvedAt: resolvedAt || new Date().toISOString(),
          citizenName: name,
        }), "complaint-resolved");
  },

  /**
   * Helper for Official Remark Added
   */
  async notifyRemarkAdded(
    complaintId: string,
    remark: string,
    officerName: string,
    citizenId?: string
  ): Promise<void> {
    const title = "New Official Remark Added";
    const message = `${officerName} added an official update on complaint #${complaintId}: "${remark}"`;

    await this.dispatch({
      eventType: "REMARK_ADDED",
      complaintId,
      citizenId,
      title,
      message,
    });

    // 1. Real-time SSE broadcast
    broadcastRealtimeEvent("complaint_updated", {
      complaintId,
      status: "In Progress",
      note: `${officerName}: ${remark}`,
      officerName,
      timestamp: new Date().toISOString(),
    });

    // 2. Email dispatch
    await sendToComplaintCitizen(citizenId, complaintId, (email, name) =>
      sendComplaintUpdatedEmail(email, {
          complaintId,
          status: "In Progress",
          assignedAuthority: officerName,
          note: remark,
          citizenName: name,
        }), "official-remark");
  },

  /** Notify the complaint owner when an officer needs additional information. */
  async notifyInformationRequested(
    complaintId: string,
    request: string,
    officerName: string,
    citizenId?: string,
    assignedAuthority?: string,
    authorityLevel?: string
  ): Promise<void> {
    const title = "Information Requested for Your Grievance";
    const message = `${officerName} requested additional information for complaint #${complaintId}: ${request}`;

    await this.dispatch({
      eventType: "INFO_REQUESTED",
      complaintId,
      citizenId,
      title,
      message,
    });

    broadcastRealtimeEvent("complaint_updated", {
      complaintId,
      status: "Information Requested",
      note: request,
      officerName,
      timestamp: new Date().toISOString(),
    });

    await sendToComplaintCitizen(citizenId, complaintId, (email, name) =>
      sendComplaintUpdatedEmail(email, {
        complaintId,
        status: "Information Requested",
        assignedAuthority,
        authorityLevel,
        note: request,
        citizenName: name,
      }), "information-requested");
  },

  /**
   * Helper for Near SLA Deadline Warning
   */
  async notifyNearSlaWarning(complaintId: string, hoursRemaining: number, category: string, ward: string): Promise<void> {
    const complaint = await complaintDb.getById(complaintId);
    await this.dispatch({
      eventType: "SLA_WARNING",
      complaintId,
      citizenId: complaint?.citizenId,
      title: `Critical SLA Alert: #${complaintId}`,
      message: `Complaint #${complaintId} (${category}, ${ward}) has only ${hoursRemaining}h remaining before statutory SLA deadline.`,
    });

    broadcastRealtimeEvent("complaint_updated", {
      complaintId,
      status: "Near Deadline",
      hoursRemaining,
      timestamp: new Date().toISOString(),
    });

    await sendToComplaintCitizen(complaint?.citizenId, complaintId, (email, name) =>
      sendComplaintUpdatedEmail(email, {
        complaintId,
        status: "Near Deadline",
        assignedAuthority: complaint?.assignedAuthority,
        authorityLevel: complaint?.authorityLevel,
        note: `Your complaint is nearing its resolution deadline; approximately ${hoursRemaining} hour(s) remain.`,
        citizenName: name,
      }), "near-deadline-warning");
  },

  /**
   * Helper for Official Gazette Notice Published (Emergency or Municipal Announcement)
   */
  async notifyNoticePublished(
    noticeId: string,
    title: string,
    category: string,
    officerName: string,
    options?: {
      description?: string;
      isEmergency?: boolean;
      severity?: string;
      targetWards?: string;
      department?: string;
    }
  ): Promise<void> {
    const isEmergency = Boolean(options?.isEmergency);

    await this.dispatch({
      eventType: "NOTICE_PUBLISHED",
      complaintId: null,
      title: isEmergency ? `EMERGENCY ALERT: ${title}` : `Gazette Published: ${title}`,
      message: `Official circular "${title}" (${category}) published by ${officerName}.`,
    });

    // 1. Real-time SSE broadcast to all connected dashboards
    broadcastRealtimeEvent("notice_published", {
      id: noticeId,
      title,
      category,
      officerName,
      isEmergency,
      severity: options?.severity || (isEmergency ? "Urgent" : "Normal"),
      targetWards: options?.targetWards || "All Wards",
      description: options?.description || "",
      department: options?.department || "Lakshmeshwar TMC",
      timestamp: new Date().toISOString(),
    });

    // 2. Dispatch Email to Citizens
    citizenDb
      .listCitizenEmails(options?.targetWards)
      .then((citizens) => {
        if (citizens.length === 0) return;
        const emails = citizens.map((c) => c.email);

        if (isEmergency) {
          sendEmergencyNoticeEmail(emails, {
            title,
            description: options?.description || "Immediate municipal emergency directive from Lakshmeshwar TMC.",
            severity: options?.severity || "Urgent",
            targetWards: options?.targetWards || "All Municipal Wards",
            issuedByName: officerName,
            issuedByDepartment: options?.department,
          }).catch((err) => console.error("Failed to send emergency notice email:", err));
        } else {
          sendMunicipalAnnouncementEmail(emails, {
            title,
            description: options?.description || "Official circular issued for public awareness.",
            category,
            department: options?.department,
            issuedByName: officerName,
          }).catch((err) => console.error("Failed to send municipal announcement email:", err));
        }
      })
      .catch((err) => console.error("Failed to fetch citizen emails for notice dispatch:", err));
  },

  /**
   * Dispatches local news and ward-specific bulletin notifications (Requirement 7).
   * Notifies citizens via in-app alerts, real-time SSE, and direct email broadcasts.
   */
  async notifyNewsPublished(news: {
    id: string;
    headline: string;
    summary: string;
    category?: string;
    wardRelevance?: string;
    authorName?: string;
    imageUrl?: string;
  }): Promise<void> {
    const isWardSpecific = news.wardRelevance && news.wardRelevance !== "All Wards" && news.wardRelevance !== "ALL";

    // In-app notification record
    await this.dispatch({
      eventType: "NEWS_PUBLISHED",
      complaintId: null,
      title: `Civic Bulletin: ${news.headline}`,
      message: `${news.summary.slice(0, 160)}... (${news.category || "Civic Development"})`,
    });

    // Real-time SSE broadcast
    broadcastRealtimeEvent("news_published" as any, {
      id: news.id,
      headline: news.headline,
      summary: news.summary,
      category: news.category || "Civic Development",
      wardRelevance: news.wardRelevance || "All Wards",
      authorName: news.authorName || "CivSetu News Desk",
      timestamp: new Date().toISOString(),
    });

    // Targeted citizen emails (all wards or ward-specific)
    citizenDb
      .listCitizenEmails(isWardSpecific ? news.wardRelevance : undefined)
      .then((citizens) => {
        if (citizens.length === 0) return;
        const emails = citizens.map((c) => c.email);
        sendLocalNewsEmail(emails, {
          headline: news.headline,
          summary: news.summary,
          category: news.category,
          wardRelevance: news.wardRelevance,
          authorName: news.authorName,
          imageUrl: news.imageUrl,
        }).catch((err) => console.error("Failed to send local news email:", err));
      })
      .catch((err) => console.error("Failed to fetch citizen emails for news dispatch:", err));
  },
};
