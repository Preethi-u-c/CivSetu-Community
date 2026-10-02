import { getPool, isPostgresConfigured, ensurePostgresTables } from "./postgres";
import crypto from "crypto";

// =============================================================================
// Complaint TypeScript Interfaces & Types
// =============================================================================

export type ComplaintStatus =
  | "Submitted"
  | "Under Review"
  | "Assigned"
  | "In Progress"
  | "Near Deadline"
  | "Escalated"
  | "Resolved"
  | "Reopened"
  | "Closed";

export type ComplaintPriority = "Low" | "Medium" | "High" | "Urgent";

export type AuthorityLevel =
  | "Local Authority"
  | "Block level"
  | "District Panchayat"
  | "District Administration";

export interface ComplaintRecord {
  id: string;
  citizenId: string;
  citizenName?: string;
  citizenMobile?: string;
  citizenEmail?: string;
  category: string;
  title: string;
  description: string;
  ward: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assignedAuthority: string;
  authorityLevel: AuthorityLevel;
  deadline: string; // ISO string
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  reopenedReason?: string | null;
  escalationReason?: string | null;
  escalatedAt?: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  timeline?: ComplaintTimelineEvent[];
}

export interface ComplaintTimelineEvent {
  id: number;
  complaintId: string;
  status: ComplaintStatus;
  action: string;
  note: string;
  updatedBy: string;
  authorityLevel: AuthorityLevel;
  assignedTo?: string | null;
  createdAt: string; // ISO string
}

// =============================================================================
// Workflow & Escalation Mapping Helpers
// =============================================================================

export const AUTHORITY_WORKFLOW: Record<
  AuthorityLevel,
  { nextLevel: AuthorityLevel | null; defaultAuthority: string; additionalSlaHours: number }
> = {
  "Local Authority": {
    nextLevel: "Block level",
    defaultAuthority: "Lakshmeshwar Taluk Panchayat Executive Office",
    additionalSlaHours: 48,
  },
  "Block level": {
    nextLevel: "District Panchayat",
    defaultAuthority: "Gadag Zilla Panchayat Planning & Development Cell",
    additionalSlaHours: 72,
  },
  "District Panchayat": {
    nextLevel: "District Administration",
    defaultAuthority: "District Urban Development Cell (DUDC), DC Office, Gadag",
    additionalSlaHours: 96,
  },
  "District Administration": {
    nextLevel: null,
    defaultAuthority: "Office of the Deputy Commissioner, Gadag District",
    additionalSlaHours: 0,
  },
};

export function calculateSlaDeadline(priority: ComplaintPriority): Date {
  const hoursMap: Record<ComplaintPriority, number> = {
    Urgent: 24, // 1 day
    High: 48,   // 2 days
    Medium: 72, // 3 days
    Low: 120,   // 5 days
  };
  const hours = hoursMap[priority] || 72;
  return new Date(Date.now() + hours * 3600 * 1000);
}

export function getDefaultAuthority(category: string): {
  assignedAuthority: string;
  authorityLevel: AuthorityLevel;
} {
  const cat = category.toLowerCase();
  if (cat.includes("water")) {
    return {
      assignedAuthority: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
      authorityLevel: "Local Authority",
    };
  }
  if (cat.includes("sanitat") || cat.includes("garbage") || cat.includes("waste")) {
    return {
      assignedAuthority: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
      authorityLevel: "Local Authority",
    };
  }
  if (cat.includes("street") || cat.includes("light") || cat.includes("electr")) {
    return {
      assignedAuthority: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
      authorityLevel: "Local Authority",
    };
  }
  if (cat.includes("road") || cat.includes("drain") || cat.includes("pothole")) {
    return {
      assignedAuthority: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
      authorityLevel: "Local Authority",
    };
  }
  if (cat.includes("tax") || cat.includes("khata") || cat.includes("revenue")) {
    return {
      assignedAuthority: "Revenue & Property Assessment Section, Lakshmeshwar TMC",
      authorityLevel: "Local Authority",
    };
  }
  return {
    assignedAuthority: "Lakshmeshwar TMC Citizen Facilitation Centre",
    authorityLevel: "Local Authority",
  };
}

// Row mappers
function mapComplaintRow(row: Record<string, unknown>): ComplaintRecord {
  const toIso = (val: unknown): string | null => {
    if (!val) return null;
    return val instanceof Date ? val.toISOString() : String(val);
  };

  return {
    id: row.id as string,
    citizenId: row.citizen_id as string,
    citizenName: (row.citizen_name as string) || undefined,
    citizenMobile: (row.citizen_mobile as string) || undefined,
    citizenEmail: (row.citizen_email as string) || undefined,
    category: row.category as string,
    title: row.title as string,
    description: row.description as string,
    ward: row.ward as string,
    address: (row.address as string) || undefined,
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
    photoUrl: (row.photo_url as string) || null,
    status: row.status as ComplaintStatus,
    priority: row.priority as ComplaintPriority,
    assignedAuthority: row.assigned_authority as string,
    authorityLevel: row.authority_level as AuthorityLevel,
    deadline: toIso(row.deadline) || new Date().toISOString(),
    resolutionNotes: (row.resolution_notes as string) || null,
    resolvedAt: toIso(row.resolved_at),
    closedAt: toIso(row.closed_at),
    reopenedReason: (row.reopened_reason as string) || null,
    escalationReason: (row.escalation_reason as string) || null,
    escalatedAt: toIso(row.escalated_at),
    createdAt: toIso(row.created_at) || new Date().toISOString(),
    updatedAt: toIso(row.updated_at) || new Date().toISOString(),
  };
}

function mapTimelineRow(row: Record<string, unknown>): ComplaintTimelineEvent {
  return {
    id: Number(row.id),
    complaintId: row.complaint_id as string,
    status: row.status as ComplaintStatus,
    action: row.action as string,
    note: row.note as string,
    updatedBy: row.updated_by as string,
    authorityLevel: row.authority_level as AuthorityLevel,
    assignedTo: (row.assigned_to as string) || null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

// =============================================================================
// Complaint Database Operations
// =============================================================================

export const complaintDb = {
  /**
   * Generates a unique, human-friendly complaint tracking ID.
   * Format: CMP-LMC-2026-XXXXXX
   */
  generateId(): string {
    const timestamp = Date.now().toString().slice(-5);
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `CMP-LMC-2026-${timestamp}${randomHex}`;
  },

  /**
   * Creates a new citizen complaint and inserts the initial timeline entry.
   */
  async createComplaint(params: {
    citizenId: string;
    createdByName: string;
    category: string;
    title: string;
    description: string;
    ward: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    photoUrl?: string | null;
    priority?: ComplaintPriority;
  }): Promise<ComplaintRecord> {
    await ensurePostgresTables();
    const pool = getPool();

    const id = this.generateId();
    const priority: ComplaintPriority = params.priority || "Medium";
    const deadline = calculateSlaDeadline(priority);
    const { assignedAuthority, authorityLevel } = getDefaultAuthority(params.category);
    const status: ComplaintStatus = "Submitted";

    const insertSql = `
      INSERT INTO complaints (
        id, citizen_id, category, title, description, ward, address,
        latitude, longitude, photo_url, status, priority,
        assigned_authority, authority_level, deadline,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *;
    `;

    const values = [
      id,
      params.citizenId,
      params.category.trim(),
      params.title.trim(),
      params.description.trim(),
      params.ward.trim(),
      params.address?.trim() || null,
      params.latitude ?? null,
      params.longitude ?? null,
      params.photoUrl?.trim() || null,
      status,
      priority,
      assignedAuthority,
      authorityLevel,
      deadline,
    ];

    const result = await pool.query(insertSql, values);
    const complaint = mapComplaintRow(result.rows[0]);

    // Insert initial audit timeline entry
    await this.addTimelineEvent({
      complaintId: id,
      status: "Submitted",
      action: "Complaint Registered",
      note: "Grievance submitted by citizen and logged into Lakshmeshwar TMC municipal system.",
      updatedBy: params.createdByName,
      authorityLevel,
      assignedTo: assignedAuthority,
    });

    return complaint;
  },

  /**
   * Adds an audit event to the complaint history timeline.
   */
  async addTimelineEvent(params: {
    complaintId: string;
    status: ComplaintStatus;
    action: string;
    note: string;
    updatedBy: string;
    authorityLevel: AuthorityLevel;
    assignedTo?: string | null;
  }): Promise<ComplaintTimelineEvent> {
    await ensurePostgresTables();
    const pool = getPool();

    const sql = `
      INSERT INTO complaint_timeline (
        complaint_id, status, action, note, updated_by, authority_level, assigned_to, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const res = await pool.query(sql, [
      params.complaintId,
      params.status,
      params.action,
      params.note,
      params.updatedBy,
      params.authorityLevel,
      params.assignedTo || null,
    ]);
    return mapTimelineRow(res.rows[0]);
  },

  /**
   * Retrieves a complaint by ID.
   */
  async getById(complaintId: string): Promise<ComplaintRecord | null> {
    await ensurePostgresTables();
    const pool = getPool();

    const sql = `
      SELECT c.*, cz.full_name AS citizen_name, cz.mobile_number AS citizen_mobile, cz.email AS citizen_email
      FROM complaints c
      LEFT JOIN citizens cz ON c.citizen_id = cz.id
      WHERE c.id = $1
      LIMIT 1;
    `;
    const res = await pool.query(sql, [complaintId.trim()]);
    if (res.rows.length === 0) return null;
    return mapComplaintRow(res.rows[0]);
  },

  /**
   * Retrieves the chronological timeline for a complaint.
   */
  async getTimeline(complaintId: string): Promise<ComplaintTimelineEvent[]> {
    await ensurePostgresTables();
    const pool = getPool();

    const sql = `
      SELECT * FROM complaint_timeline
      WHERE complaint_id = $1
      ORDER BY created_at ASC;
    `;
    const res = await pool.query(sql, [complaintId.trim()]);
    return res.rows.map(mapTimelineRow);
  },

  /**
   * Lists complaints for a specific authenticated citizen with optional filters.
   * Security: citizen_id condition is ALWAYS strictly enforced.
   */
  async listByCitizen(
    citizenId: string,
    options: {
      status?: string;
      category?: string;
      ward?: string;
      priority?: string;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ complaints: ComplaintRecord[]; total: number }> {
    await ensurePostgresTables();
    const pool = getPool();

    const conditions: string[] = ["c.citizen_id = $1"];
    const params: unknown[] = [citizenId];
    let paramIndex = 2;

    if (options.status && options.status !== "ALL") {
      conditions.push(`c.status = $${paramIndex++}`);
      params.push(options.status);
    }

    if (options.category && options.category !== "ALL") {
      conditions.push(`c.category = $${paramIndex++}`);
      params.push(options.category);
    }

    if (options.ward && options.ward !== "ALL") {
      conditions.push(`c.ward = $${paramIndex++}`);
      params.push(options.ward);
    }

    if (options.priority && options.priority !== "ALL") {
      conditions.push(`c.priority = $${paramIndex++}`);
      params.push(options.priority);
    }

    if (options.search && options.search.trim()) {
      conditions.push(
        `(c.id ILIKE $${paramIndex} OR c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex} OR c.category ILIKE $${paramIndex})`
      );
      params.push(`%${options.search.trim()}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Total count
    const countRes = await pool.query(`SELECT COUNT(*) AS count FROM complaints c ${whereClause};`, params);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    // Records
    const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
    const offset = Math.max(Number(options.offset) || 0, 0);

    const dataSql = `
      SELECT c.*, cz.full_name AS citizen_name, cz.mobile_number AS citizen_mobile, cz.email AS citizen_email
      FROM complaints c
      LEFT JOIN citizens cz ON c.citizen_id = cz.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    params.push(limit, offset);

    const dataRes = await pool.query(dataSql, params);
    return {
      complaints: dataRes.rows.map(mapComplaintRow),
      total,
    };
  },

  /**
   * Reopens a resolved or closed complaint by the authenticated citizen.
   */
  async reopenComplaint(
    complaintId: string,
    citizenId: string,
    reason: string,
    citizenName: string
  ): Promise<ComplaintRecord> {
    await ensurePostgresTables();
    const pool = getPool();

    const existing = await this.getById(complaintId);
    if (!existing) {
      throw new Error("Complaint not found.");
    }

    if (existing.citizenId !== citizenId) {
      throw new Error("Unauthorized to modify this complaint.");
    }

    if (existing.status !== "Resolved" && existing.status !== "Closed") {
      throw new Error(`Only Resolved or Closed complaints can be reopened. Current status: ${existing.status}`);
    }

    const updateSql = `
      UPDATE complaints
      SET status = 'Reopened',
          reopened_reason = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND citizen_id = $3
      RETURNING *;
    `;
    const res = await pool.query(updateSql, [reason.trim(), complaintId, citizenId]);
    const updated = mapComplaintRow(res.rows[0]);

    await this.addTimelineEvent({
      complaintId,
      status: "Reopened",
      action: "Complaint Reopened",
      note: `Citizen reopened grievance: "${reason.trim()}"`,
      updatedBy: citizenName,
      authorityLevel: existing.authorityLevel,
      assignedTo: existing.assignedAuthority,
    });

    return updated;
  },

  /**
   * Updates complaint status / progress / escalation.
   */
  async updateStatus(
    complaintId: string,
    params: {
      status: ComplaintStatus;
      note?: string;
      updatedBy: string;
      assignedAuthority?: string;
      authorityLevel?: AuthorityLevel;
      resolutionNotes?: string;
      escalationReason?: string;
    }
  ): Promise<ComplaintRecord> {
    await ensurePostgresTables();
    const pool = getPool();

    const existing = await this.getById(complaintId);
    if (!existing) {
      throw new Error("Complaint not found.");
    }

    let resolvedAt: Date | null = null;
    let closedAt: Date | null = null;
    let escalatedAt: Date | null = null;

    if (params.status === "Resolved") {
      resolvedAt = new Date();
    } else if (params.status === "Closed") {
      closedAt = new Date();
    } else if (params.status === "Escalated") {
      escalatedAt = new Date();
    }

    const targetAuthority = params.assignedAuthority || existing.assignedAuthority;
    const targetLevel = params.authorityLevel || existing.authorityLevel;

    const resolvedAtClause = params.status === "Resolved" ? "CURRENT_TIMESTAMP" : "resolved_at";
    const closedAtClause = params.status === "Closed" ? "CURRENT_TIMESTAMP" : "closed_at";
    const escalatedAtClause = params.status === "Escalated" ? "CURRENT_TIMESTAMP" : "escalated_at";

    const updateSql = `
      UPDATE complaints
      SET status = $1,
          assigned_authority = $2,
          authority_level = $3,
          resolution_notes = COALESCE($4, resolution_notes),
          resolved_at = ${resolvedAtClause},
          closed_at = ${closedAtClause},
          escalation_reason = COALESCE($5, escalation_reason),
          escalated_at = ${escalatedAtClause},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;

    const res = await pool.query(updateSql, [
      params.status,
      targetAuthority,
      targetLevel,
      params.resolutionNotes || null,
      params.escalationReason || null,
      complaintId,
    ]);

    const updated = mapComplaintRow(res.rows[0]);

    await this.addTimelineEvent({
      complaintId,
      status: params.status,
      action: params.status === "Escalated" ? "Grievance Escalated" : `Status Changed to ${params.status}`,
      note: params.note || params.resolutionNotes || params.escalationReason || `Status updated to ${params.status}`,
      updatedBy: params.updatedBy,
      authorityLevel: targetLevel,
      assignedTo: targetAuthority,
    });

    return updated;
  },

  /**
   * Escalates complaint to next hierarchical level according to authority workflow:
   * Local Authority -> Block level -> District Panchayat -> District Administration
   */
  async escalateComplaint(
    complaintId: string,
    reason: string,
    escalatedBy: string
  ): Promise<ComplaintRecord> {
    const existing = await this.getById(complaintId);
    if (!existing) {
      throw new Error("Complaint not found.");
    }

    const nextConfig = AUTHORITY_WORKFLOW[existing.authorityLevel];
    if (!nextConfig || !nextConfig.nextLevel) {
      throw new Error(`Complaint has already reached the maximum escalation tier (${existing.authorityLevel}).`);
    }

    const nextLevel = nextConfig.nextLevel;
    const nextAuthority = nextConfig.defaultAuthority;

    return this.updateStatus(complaintId, {
      status: "Escalated",
      authorityLevel: nextLevel,
      assignedAuthority: nextAuthority,
      escalationReason: reason,
      note: `Escalated from ${existing.authorityLevel} to ${nextLevel} (${nextAuthority}): ${reason}`,
      updatedBy: escalatedBy,
    });
  },

  /**
   * Lists complaints across the entire municipality for the Authority Dashboard.
   * Supports comprehensive multi-filtering, search, and pagination.
   */
  async listForAuthority(
    options: {
      status?: string;
      category?: string;
      ward?: string;
      priority?: string;
      assignedAuthority?: string;
      authorityLevel?: string;
      assignedToMe?: string;
      search?: string;
      slaState?: string;
      nearDeadline?: boolean;
      overdueOnly?: boolean;
      escalatedOnly?: boolean;
      sortOrder?: "asc" | "desc";
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ complaints: ComplaintRecord[]; total: number }> {
    await ensurePostgresTables();
    const pool = getPool();

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (options.status && options.status !== "ALL") {
      conditions.push(`c.status = $${paramIndex++}`);
      params.push(options.status);
    }

    if (options.category && options.category !== "ALL") {
      conditions.push(`c.category = $${paramIndex++}`);
      params.push(options.category);
    }

    if (options.ward && options.ward !== "ALL") {
      conditions.push(`c.ward = $${paramIndex++}`);
      params.push(options.ward);
    }

    if (options.priority && options.priority !== "ALL") {
      conditions.push(`c.priority = $${paramIndex++}`);
      params.push(options.priority);
    }

    if (options.assignedAuthority && options.assignedAuthority !== "ALL") {
      conditions.push(`c.assigned_authority ILIKE $${paramIndex++}`);
      params.push(`%${options.assignedAuthority}%`);
    }

    if (options.authorityLevel && options.authorityLevel !== "ALL") {
      conditions.push(`c.authority_level = $${paramIndex++}`);
      params.push(options.authorityLevel);
    }

    if (options.assignedToMe && options.assignedToMe.trim()) {
      conditions.push(
        `(c.assigned_authority ILIKE $${paramIndex} OR c.category ILIKE $${paramIndex})`
      );
      params.push(`%${options.assignedToMe.trim()}%`);
      paramIndex++;
    }

    // SLA State Filtering
    if (options.slaState === "near_deadline" || options.nearDeadline) {
      // Near deadline: not resolved/closed, deadline is between NOW() and NOW() + 24 hours
      conditions.push(
        `c.status NOT IN ('Resolved', 'Closed') AND c.deadline > CURRENT_TIMESTAMP AND c.deadline <= (CURRENT_TIMESTAMP + INTERVAL '24 hours')`
      );
    } else if (options.slaState === "overdue" || options.overdueOnly) {
      // Overdue: not resolved/closed, deadline has passed
      conditions.push(
        `c.status NOT IN ('Resolved', 'Closed') AND c.deadline < CURRENT_TIMESTAMP`
      );
    } else if (options.slaState === "on_track") {
      // On track: not resolved/closed, more than 24 hours remaining
      conditions.push(
        `c.status NOT IN ('Resolved', 'Closed') AND c.deadline > (CURRENT_TIMESTAMP + INTERVAL '24 hours')`
      );
    }

    if (options.escalatedOnly) {
      conditions.push(`(c.status = 'Escalated' OR c.authority_level != 'Local Authority' OR c.escalated_at IS NOT NULL)`);
    }

    if (options.dateFrom) {
      conditions.push(`c.created_at >= $${paramIndex++}`);
      params.push(new Date(options.dateFrom));
    }

    if (options.dateTo) {
      conditions.push(`c.created_at <= $${paramIndex++}`);
      params.push(new Date(options.dateTo));
    }

    if (options.search && options.search.trim()) {
      conditions.push(
        `(c.id ILIKE $${paramIndex} OR c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex} OR c.ward ILIKE $${paramIndex} OR c.address ILIKE $${paramIndex} OR cz.full_name ILIKE $${paramIndex} OR cz.mobile_number ILIKE $${paramIndex})`
      );
      params.push(`%${options.search.trim()}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countSql = `
      SELECT COUNT(*) AS count
      FROM complaints c
      LEFT JOIN citizens cz ON c.citizen_id = cz.id
      ${whereClause};
    `;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
    const offset = Math.max(Number(options.offset) || 0, 0);

    let orderClause = `
      ORDER BY
        CASE WHEN c.status = 'Escalated' THEN 1
             WHEN c.deadline < CURRENT_TIMESTAMP AND c.status NOT IN ('Resolved', 'Closed') THEN 2
             WHEN c.status = 'Submitted' THEN 3
             WHEN c.status = 'In Progress' THEN 4
             ELSE 5 END ASC,
        c.created_at DESC
    `;

    if (options.sortOrder === "asc") {
      orderClause = "ORDER BY c.created_at ASC";
    } else if (options.sortOrder === "desc") {
      orderClause = "ORDER BY c.created_at DESC";
    }

    const dataSql = `
      SELECT c.*, cz.full_name AS citizen_name, cz.mobile_number AS citizen_mobile, cz.email AS citizen_email
      FROM complaints c
      LEFT JOIN citizens cz ON c.citizen_id = cz.id
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    params.push(limit, offset);

    const dataRes = await pool.query(dataSql, params);
    return {
      complaints: dataRes.rows.map(mapComplaintRow),
      total,
    };
  },

  /**
   * Calculates real-time grievance statistics for the Authority Dashboard summary cards.
   */
  async getAuthorityStats(): Promise<{
    total: number;
    submitted: number;
    inProgress: number;
    nearDeadline: number;
    escalated: number;
    resolved: number;
    overdue: number;
    assigned: number;
    underReview: number;
  }> {
    await ensurePostgresTables();
    const pool = getPool();

    const sql = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Submitted') AS submitted,
        COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress,
        COUNT(*) FILTER (WHERE status = 'Assigned') AS assigned,
        COUNT(*) FILTER (WHERE status = 'Under Review') AS under_review,
        COUNT(*) FILTER (WHERE status = 'Escalated') AS escalated,
        COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved,
        COUNT(*) FILTER (WHERE status NOT IN ('Resolved', 'Closed') AND deadline > CURRENT_TIMESTAMP AND deadline <= (CURRENT_TIMESTAMP + INTERVAL '24 hours')) AS near_deadline,
        COUNT(*) FILTER (WHERE status NOT IN ('Resolved', 'Closed') AND deadline < CURRENT_TIMESTAMP) AS overdue
      FROM complaints;
    `;

    const res = await pool.query(sql);
    const r = res.rows[0];

    return {
      total: parseInt(r?.total || "0", 10),
      submitted: parseInt(r?.submitted || "0", 10),
      inProgress: parseInt(r?.in_progress || "0", 10),
      nearDeadline: parseInt(r?.near_deadline || "0", 10),
      escalated: parseInt(r?.escalated || "0", 10),
      resolved: parseInt(r?.resolved || "0", 10),
      overdue: parseInt(r?.overdue || "0", 10),
      assigned: parseInt(r?.assigned || "0", 10),
      underReview: parseInt(r?.under_review || "0", 10),
    };
  },
};

