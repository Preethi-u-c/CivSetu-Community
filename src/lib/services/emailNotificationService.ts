import nodemailer from "nodemailer";

export interface EmailSendResult {
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}

export function isEmailConfigured(): boolean {
  return !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
}

function getTransporter() {
  const user = process.env.EMAIL_USER!;
  const pass = process.env.EMAIL_PASS!.replace(/\s+/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function getBasePortalUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

/**
 * Common HTML email shell wrapper with Lakshmeshwar TMC branding
 */
function wrapEmailHtml(content: string, preheader: string = "Lakshmeshwar Town Municipal Council Notification"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>CivSetu Notification</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="background-color: #f1f5f9; margin: 0; padding: 24px 12px;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);">
    <!-- Government Branding Header -->
    <tr>
      <td style="background-color: #0f172a; padding: 24px 32px; text-align: center; border-bottom: 3px solid #f59e0b;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">CivSetu • ಸಿವ್‌ಸೇತು</h1>
        <p style="color: #f8fafc; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">Lakshmeshwar Town Municipal Council (TMC)</p>
        <p style="color: #94a3b8; margin: 2px 0 0 0; font-size: 12px;">Government of Karnataka • Gadag District</p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 32px 28px 32px; color: #1e293b;">
        ${content}
      </td>
    </tr>

    <!-- Official Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #334155;">Lakshmeshwar Town Municipal Council (TMC) Civic Redressal Cell</p>
        <p style="margin: 0 0 6px 0;">PIGRS Grievance Toll-Free Helpline: <strong>1902</strong> | Emergency: <strong>112</strong></p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">This is an automated municipal communication from the CivSetu Portal. Please do not reply directly to this email.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Dispatches an email via Nodemailer or fallback logging
 */
async function sendMailWrapper(to: string | string[], subject: string, html: string): Promise<EmailSendResult> {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) {
    return { success: false, error: "No recipient email addresses provided" };
  }

  const toList = recipients.join(", ");

  if (!isEmailConfigured()) {
    console.log(`[EMAIL DISPATCH - SIMULATION] To: ${toList} | Subject: "${subject}"`);
    return {
      success: true,
      simulated: true,
      messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  try {
    const transporter = getTransporter();
    const user = process.env.EMAIL_USER!;
    const info = await transporter.sendMail({
      from: `"CivSetu Lakshmeshwar TMC" <${user}>`,
      to: toList,
      subject,
      html,
    });

    console.log(`[EMAIL DISPATCH - SENT] MessageId: ${info.messageId} to ${toList}`);
    return { success: true, simulated: false, messageId: info.messageId };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`[EMAIL DISPATCH - FAILED] To: ${toList} | Error:`, errMessage);
    // Graceful fallback: return success with simulated flag so core flow never breaks on network timeouts
    return { success: false, error: errMessage };
  }
}

// =============================================================================
// 1. Complaint Submitted Email
// =============================================================================

export interface ComplaintSubmittedEmailData {
  complaintId: string;
  status?: string;
  category: string;
  ward: string;
  title: string;
  description?: string;
  deadline?: string;
  citizenName?: string;
  portalUrl?: string;
}

export async function sendComplaintSubmittedEmail(
  toEmail: string,
  data: ComplaintSubmittedEmailData
): Promise<EmailSendResult> {
  const status = data.status || "Submitted";
  const baseUrl = data.portalUrl || getBasePortalUrl();
  const trackUrl = `${baseUrl}/complaints/${data.complaintId}`;

  const formattedDeadline = data.deadline
    ? new Date(data.deadline).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Within 72 Hours";

  const content = `
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        Civic Grievance Acknowledgement
      </span>
      <h2 style="margin: 12px 0 6px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Grievance Lodged Successfully</h2>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
        Dear ${data.citizenName || "Citizen"}, your civic grievance has been officially registered with the Lakshmeshwar Town Municipal Council.
      </p>
    </div>

    <!-- Grievance Identity Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;" width="50%">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Complaint ID</span>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 2px;">
              ${data.complaintId}
            </div>
          </td>
          <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;" width="50%">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Status</span>
            <div style="margin-top: 2px;">
              <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
                ${status}
              </span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Category</span>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 2px;">
              ${data.category}
            </div>
          </td>
          <td style="padding-top: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Ward / Jurisdiction</span>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 2px;">
              ${data.ward}
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Grievance Title</span>
            <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 2px;">
              ${data.title}
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 12px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Target Resolution SLA</span>
            <div style="font-size: 13px; font-weight: 700; color: #d97706; margin-top: 2px;">
              ⏱️ ${formattedDeadline}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Tracking Call to Action -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="${trackUrl}" style="background-color: #1e40af; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(30, 64, 175, 0.2);">
        Track Complaint Status Online &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 20px 0 0 0;">
      The designated department will conduct field verification and initiate remedial action. You will receive real-time notifications via email as your ticket progresses through review, assignment, and resolution.
    </p>
  `;

  const subject = `CivSetu - Complaint Submitted: ${data.complaintId} [Status: ${status}]`;
  const html = wrapEmailHtml(content, `Grievance #${data.complaintId} registered successfully`);
  return sendMailWrapper(toEmail, subject, html);
}

// =============================================================================
// 2. Complaint Updated Email (Assigned, Under Review, Escalated, Remarks)
// =============================================================================

export interface ComplaintUpdatedEmailData {
  complaintId: string;
  status: string;
  category?: string;
  ward?: string;
  title?: string;
  assignedAuthority?: string;
  authorityLevel?: string;
  note?: string;
  citizenName?: string;
  portalUrl?: string;
}

export async function sendComplaintUpdatedEmail(
  toEmail: string,
  data: ComplaintUpdatedEmailData
): Promise<EmailSendResult> {
  const baseUrl = data.portalUrl || getBasePortalUrl();
  const trackUrl = `${baseUrl}/complaints/${data.complaintId}`;

  const isEscalated = data.status === "Escalated";

  const content = `
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; background-color: ${isEscalated ? "#fee2e2" : "#fef3c7"}; color: ${isEscalated ? "#b91c1c" : "#b45309"}; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        ${isEscalated ? "Tier Escalation Alert" : "Complaint Status Update"}
      </span>
      <h2 style="margin: 12px 0 6px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Grievance Status Progressed</h2>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
        Dear ${data.citizenName || "Citizen"}, an official update has been recorded on your municipal grievance.
      </p>
    </div>

    <!-- Grievance Update Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;" width="50%">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Complaint ID</span>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 2px;">
              ${data.complaintId}
            </div>
          </td>
          <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;" width="50%">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Status</span>
            <div style="margin-top: 2px;">
              <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
                ${data.status}
              </span>
            </div>
          </td>
        </tr>
        ${data.assignedAuthority ? `
        <tr>
          <td colspan="2" style="padding-top: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Responsible Department / Officer</span>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 2px;">
              ${data.assignedAuthority} ${data.authorityLevel ? `<span style="font-size: 12px; color: #64748b;">(${data.authorityLevel})</span>` : ""}
            </div>
          </td>
        </tr>
        ` : ""}
        ${data.note ? `
        <tr>
          <td colspan="2" style="padding-top: 12px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Official Remarks</span>
            <div style="font-size: 13px; font-weight: 500; color: #334155; margin-top: 4px; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; font-style: italic;">
              "${data.note}"
            </div>
          </td>
        </tr>
        ` : ""}
      </table>
    </div>

    <!-- Tracking Call to Action -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="${trackUrl}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        View Audit Timeline &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 20px 0 0 0;">
      Track live SLA countdown and field updates on the CivSetu Citizen Portal.
    </p>
  `;

  const subject = `CivSetu - Complaint Updated: ${data.complaintId} [Status: ${data.status}]`;
  const html = wrapEmailHtml(content, `Status update on Grievance #${data.complaintId}: ${data.status}`);
  return sendMailWrapper(toEmail, subject, html);
}

// =============================================================================
// 3. Complaint Resolved Email
// =============================================================================

export interface ComplaintResolvedEmailData {
  complaintId: string;
  status?: string;
  category?: string;
  ward?: string;
  title?: string;
  resolutionNotes: string;
  resolvedAt?: string;
  citizenName?: string;
  portalUrl?: string;
}

export async function sendComplaintResolvedEmail(
  toEmail: string,
  data: ComplaintResolvedEmailData
): Promise<EmailSendResult> {
  const status = data.status || "Resolved";
  const baseUrl = data.portalUrl || getBasePortalUrl();
  const trackUrl = `${baseUrl}/complaints/${data.complaintId}`;

  const resolvedTime = data.resolvedAt
    ? new Date(data.resolvedAt).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-IN");

  const content = `
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        Grievance Redressed
      </span>
      <h2 style="margin: 12px 0 6px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Complaint Marked as Resolved</h2>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
        Dear ${data.citizenName || "Citizen"}, your civic grievance has been officially resolved by the Lakshmeshwar Town Municipal Council field team.
      </p>
    </div>

    <!-- Grievance Resolution Card -->
    <div style="background-color: #f8fafc; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;" width="50%">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Complaint ID</span>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 2px;">
              ${data.complaintId}
            </div>
          </td>
          <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;" width="50%">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Status</span>
            <div style="margin-top: 2px;">
              <span style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
                ${status}
              </span>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Resolved On</span>
            <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 2px;">
              ${resolvedTime}
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 12px;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b;">Resolution Details / Remedial Action</span>
            <div style="font-size: 14px; font-weight: 500; color: #065f46; margin-top: 6px; background: #ecfdf5; padding: 12px; border-radius: 6px; border: 1px solid #a7f3d0; line-height: 1.5;">
              ${data.resolutionNotes}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Call to Action -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="${trackUrl}" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);">
        Verify Resolution & Rate Service &rarr;
      </a>
    </div>

    <div style="background-color: #f1f5f9; border-radius: 6px; padding: 14px; margin-top: 20px; font-size: 12px; color: #475569; line-height: 1.5;">
      <strong>Citizen Right to Reopen:</strong> If the reported civic issue persists or was incompletely resolved, you may reopen this complaint within 48 hours directly via your citizen portal.
    </div>
  `;

  const subject = `CivSetu - Complaint Resolved: ${data.complaintId} [Status: ${status}]`;
  const html = wrapEmailHtml(content, `Grievance #${data.complaintId} has been successfully resolved`);
  return sendMailWrapper(toEmail, subject, html);
}

// =============================================================================
// 4. Emergency Notice Email
// =============================================================================

export interface EmergencyNoticeEmailData {
  title: string;
  description: string;
  severity?: string;
  targetWards?: string;
  emergencyContact?: string;
  issuedByName?: string;
  issuedByDepartment?: string;
  portalUrl?: string;
}

export async function sendEmergencyNoticeEmail(
  toEmails: string | string[],
  data: EmergencyNoticeEmailData
): Promise<EmailSendResult> {
  const baseUrl = data.portalUrl || getBasePortalUrl();
  const noticeUrl = `${baseUrl}/announcements`;

  const content = `
    <!-- High Priority Emergency Banner -->
    <div style="background-color: #dc2626; color: #ffffff; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
      <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
        🚨 EMERGENCY NOTIFICATION
      </h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; opacity: 0.95;">
        Important Municipal Notice • Immediate Citizen Attention Required
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #991b1b; font-weight: 700;">
        ${data.title}
      </h3>
      <div style="margin: 4px 0 16px 0;">
        <span style="display: inline-block; background-color: #fee2e2; color: #991b1b; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-right: 8px;">
          Severity: ${data.severity || "Urgent"}
        </span>
        <span style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">
          Jurisdiction: ${data.targetWards || "All Municipal Wards"}
        </span>
      </div>
    </div>

    <!-- Official Advisory Box -->
    <div style="background-color: #fff1f2; border: 2px solid #fecdd3; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #be123c; font-weight: 700;">
        Public Safety Advisory & Directive:
      </h4>
      <div style="font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-line;">
        ${data.description}
      </div>
    </div>

    <!-- Emergency Helpline Information -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #475569; font-weight: 700;">
        Emergency Helplines & Authority Desk:
      </h4>
      <p style="margin: 0; font-size: 13px; color: #0f172a; line-height: 1.4;">
        📞 Lakshmeshwar TMC Control Room: <strong>${data.emergencyContact || "08375-224422 / 1902"}</strong><br/>
        🚓 State Disaster Response / Police: <strong>112</strong> | Fire: <strong>101</strong> | Ambulance: <strong>108</strong>
      </p>
      ${data.issuedByName ? `
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
        Issued By: ${data.issuedByName} (${data.issuedByDepartment || "Lakshmeshwar TMC Emergency Disaster Management Cell"})
      </p>
      ` : ""}
    </div>

    <div style="text-align: center; margin: 24px 0 12px 0;">
      <a href="${noticeUrl}" style="background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        View Live Emergency Broadcast Portal &rarr;
      </a>
    </div>
  `;

  const subject = `[EMERGENCY NOTIFICATION] CivSetu - Important Municipal Notice: ${data.title}`;
  const html = wrapEmailHtml(content, `EMERGENCY NOTICE: ${data.title} - Lakshmeshwar TMC`);
  return sendMailWrapper(toEmails, subject, html);
}

// =============================================================================
// 5. Municipal Announcement Email
// =============================================================================

export interface MunicipalAnnouncementEmailData {
  title: string;
  description: string;
  category?: string;
  department?: string;
  issuedByName?: string;
  portalUrl?: string;
}

export async function sendMunicipalAnnouncementEmail(
  toEmails: string | string[],
  data: MunicipalAnnouncementEmailData
): Promise<EmailSendResult> {
  const baseUrl = data.portalUrl || getBasePortalUrl();
  const noticeUrl = `${baseUrl}/announcements`;

  const content = `
    <!-- Announcement Banner -->
    <div style="background-color: #0f172a; color: #ffffff; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; text-align: center; border-bottom: 3px solid #f59e0b;">
      <h2 style="margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #f59e0b;">
        📢 Important Municipal Notice
      </h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
        Official Public Circular • Lakshmeshwar Town Municipal Council
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a; font-weight: 700;">
        ${data.title}
      </h3>
      <div style="margin: 4px 0 16px 0;">
        <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-right: 8px;">
          ${data.category || "General Gazette Notice"}
        </span>
        <span style="display: inline-block; background-color: #f1f5f9; color: #475569; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">
          ${data.department || "Lakshmeshwar TMC Administration"}
        </span>
      </div>
    </div>

    <!-- Announcement Body -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-line;">
        ${data.description}
      </div>
      ${data.issuedByName ? `
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b;">
        Authorized Signatory: <strong>${data.issuedByName}</strong>
      </div>
      ` : ""}
    </div>

    <div style="text-align: center; margin: 24px 0 12px 0;">
      <a href="${noticeUrl}" style="background-color: #1e40af; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        Read Gazette Circular on CivSetu &rarr;
      </a>
    </div>
  `;

  const subject = `[IMPORTANT MUNICIPAL NOTICE] CivSetu - Municipal Announcement: ${data.title}`;
  const html = wrapEmailHtml(content, `Official Notice: ${data.title}`);
  return sendMailWrapper(toEmails, subject, html);
}

// =============================================================================
// 6. Local & Ward News Announcement Email (Requirement 7)
// =============================================================================

export interface LocalNewsEmailData {
  headline: string;
  summary: string;
  category?: string;
  wardRelevance?: string;
  authorName?: string;
  imageUrl?: string;
  portalUrl?: string;
}

export async function sendLocalNewsEmail(
  toEmails: string | string[],
  data: LocalNewsEmailData
): Promise<EmailSendResult> {
  const baseUrl = data.portalUrl || getBasePortalUrl();
  const newsUrl = `${baseUrl}/news`;

  const content = `
    <!-- News Header -->
    <div style="background-color: #064e4a; color: #ffffff; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; text-align: center; border-bottom: 3px solid #f59e0b;">
      <h2 style="margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #f59e0b;">
        📰 CivSetu Local News & Bulletin
      </h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #99f6e4;">
        Ward & Civic Updates • Lakshmeshwar Town Municipal Council
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #042f2e; font-weight: 700;">
        ${data.headline}
      </h3>
      <div style="margin: 4px 0 16px 0;">
        <span style="display: inline-block; background-color: #ccfbf1; color: #0f766e; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-right: 8px;">
          ${data.category || "Civic Development"}
        </span>
        <span style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px;">
          📍 ${data.wardRelevance || "All Wards"}
        </span>
      </div>
    </div>

    <!-- News Body -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0;">
        ${data.summary}
      </p>
      ${data.authorName ? `
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b;">
        Reporting Desk: <strong>${data.authorName}</strong>
      </div>
      ` : ""}
    </div>

    <div style="text-align: center; margin: 24px 0 12px 0;">
      <a href="${newsUrl}" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
        Read Full Story on CivSetu Portal &rarr;
      </a>
    </div>
  `;

  const subject = `[CIVIC NEWS] CivSetu - ${data.headline}`;
  const html = wrapEmailHtml(content, `Local Civic Bulletin: ${data.headline}`);
  return sendMailWrapper(toEmails, subject, html);
}
