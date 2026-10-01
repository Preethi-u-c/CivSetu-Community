import { getPool, ensurePostgresTables, AuthorityUserRecord, NotificationRecord } from "./postgres";
import crypto from "crypto";

export interface SafeAuthorityUser {
  id: string;
  fullName: string;
  designation: string;
  department: string;
  authorityLevel: "Local Authority" | "Block level" | "District Panchayat" | "District Administration";
  email: string;
  mobileNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DepartmentOption {
  name: string;
  level: "Local Authority" | "Block level" | "District Panchayat" | "District Administration";
  officerTitle: string;
  contactEmail: string;
}

export const CANONICAL_DEPARTMENTS: DepartmentOption[] = [
  {
    name: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
    level: "Local Authority",
    officerTitle: "Assistant Executive Engineer (Water)",
    contactEmail: "aee.water@lakshmeshwar-tmc.gov.in",
  },
  {
    name: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
    level: "Local Authority",
    officerTitle: "Senior Health & Sanitation Inspector",
    contactEmail: "health.sanitation@lakshmeshwar-tmc.gov.in",
  },
  {
    name: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
    level: "Local Authority",
    officerTitle: "Junior Engineer (Electrical)",
    contactEmail: "electrical@lakshmeshwar-tmc.gov.in",
  },
  {
    name: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
    level: "Local Authority",
    officerTitle: "Assistant Engineer (Civil / PWD)",
    contactEmail: "pwd.civil@lakshmeshwar-tmc.gov.in",
  },
  {
    name: "Revenue & Property Assessment Section, Lakshmeshwar TMC",
    level: "Local Authority",
    officerTitle: "Revenue Officer / Tax Superintendent",
    contactEmail: "revenue@lakshmeshwar-tmc.gov.in",
  },
  {
    name: "Executive & Municipal Administration",
    level: "Local Authority",
    officerTitle: "Chief Officer / Municipal Commissioner",
    contactEmail: "commissioner@lakshmeshwar-tmc.gov.in",
  },
  {
    name: "Lakshmeshwar Taluk Panchayat Executive Office",
    level: "Block level",
    officerTitle: "Taluk Executive Officer (EO)",
    contactEmail: "eo.taluk@lakshmeshwar-tp.gov.in",
  },
  {
    name: "Gadag Zilla Panchayat Planning & Development Cell",
    level: "District Panchayat",
    officerTitle: "Chief Executive Officer (CEO), ZP Gadag",
    contactEmail: "ceo.zp@gadag.gov.in",
  },
  {
    name: "District Urban Development Cell (DUDC), DC Office, Gadag",
    level: "District Administration",
    officerTitle: "Project Director (DUDC), DC Office",
    contactEmail: "pd.dudc@gadag.gov.in",
  },
  {
    name: "Office of the Deputy Commissioner, Gadag District",
    level: "District Administration",
    officerTitle: "Deputy Commissioner & District Magistrate",
    contactEmail: "dc.gadag@karnataka.gov.in",
  },
];

function mapAuthorityRow(row: Record<string, unknown>): AuthorityUserRecord {
  const toIso = (val: unknown) => (val instanceof Date ? val.toISOString() : String(val));
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    designation: row.designation as string,
    department: row.department as string,
    authorityLevel: row.authority_level as "Local Authority" | "Block level" | "District Panchayat" | "District Administration",
    email: row.email as string,
    mobileNumber: (row.mobile_number as string) || undefined,
    passwordHash: row.password_hash as string,
    isActive: Boolean(row.is_active),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function toSafeAuthorityUser(user: AuthorityUserRecord): SafeAuthorityUser {
  return {
    id: user.id,
    fullName: user.fullName,
    designation: user.designation,
    department: user.department,
    authorityLevel: user.authorityLevel,
    email: user.email,
    mobileNumber: user.mobileNumber,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export const authorityDb = {
  async findById(id: string): Promise<AuthorityUserRecord | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("SELECT * FROM authority_users WHERE id = $1 LIMIT 1;", [id]);
    return res.rows.length > 0 ? mapAuthorityRow(res.rows[0]) : null;
  },

  async findByEmail(email: string): Promise<AuthorityUserRecord | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query(
      "SELECT * FROM authority_users WHERE LOWER(email) = LOWER($1) OR id = $1 LIMIT 1;",
      [email.trim()]
    );
    return res.rows.length > 0 ? mapAuthorityRow(res.rows[0]) : null;
  },

  async listAll(): Promise<SafeAuthorityUser[]> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query(
      "SELECT * FROM authority_users WHERE is_active = true ORDER BY authority_level ASC, full_name ASC;"
    );
    return res.rows.map(mapAuthorityRow).map(toSafeAuthorityUser);
  },

  async createSession(authorityId: string, expiresAt: Date): Promise<string> {
    await ensurePostgresTables();
    const pool = getPool();
    const sessionId = crypto.randomBytes(32).toString("hex");
    const sql = `
      INSERT INTO authority_sessions (id, authority_id, expires_at, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP);
    `;
    await pool.query(sql, [sessionId, authorityId, expiresAt]);
    return sessionId;
  },

  async getSession(sessionId: string): Promise<{ authorityId: string; expiresAt: Date } | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const sql = `
      SELECT authority_id, expires_at FROM authority_sessions
      WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1;
    `;
    const res = await pool.query(sql, [sessionId]);
    if (res.rows.length === 0) return null;
    return {
      authorityId: res.rows[0].authority_id,
      expiresAt: new Date(res.rows[0].expires_at),
    };
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("DELETE FROM authority_sessions WHERE id = $1;", [sessionId]);
    return (res.rowCount ?? 0) > 0;
  },

  getDepartments(): DepartmentOption[] {
    return CANONICAL_DEPARTMENTS;
  },
};

export const notificationDb = {
  async createNotification(params: {
    eventType: string;
    complaintId?: string | null;
    citizenId?: string | null;
    authorityId?: string | null;
    title: string;
    message: string;
    channel?: string;
  }): Promise<NotificationRecord> {
    await ensurePostgresTables();
    const pool = getPool();
    const sql = `
      INSERT INTO notifications (
        event_type, complaint_id, citizen_id, authority_id, title, message, channel, is_read, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const res = await pool.query(sql, [
      params.eventType,
      params.complaintId || null,
      params.citizenId || null,
      params.authorityId || null,
      params.title,
      params.message,
      params.channel || "in_app",
    ]);
    const r = res.rows[0];
    return {
      id: r.id,
      eventType: r.event_type,
      complaintId: r.complaint_id,
      citizenId: r.citizen_id,
      authorityId: r.authority_id,
      title: r.title,
      message: r.message,
      channel: r.channel,
      isRead: r.is_read,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    };
  },

  async listRecent(
    options: { limit?: number; unreadOnly?: boolean; authorityId?: string } | number = 20
  ): Promise<NotificationRecord[]> {
    await ensurePostgresTables();
    const pool = getPool();

    let limit = 20;
    let unreadOnly = false;
    let authorityId: string | undefined = undefined;

    if (typeof options === "number") {
      limit = options;
    } else if (typeof options === "object") {
      limit = options.limit || 20;
      unreadOnly = Boolean(options.unreadOnly);
      authorityId = options.authorityId;
    }

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let pIdx = 1;

    if (unreadOnly) {
      conditions.push(`is_read = false`);
    }

    if (authorityId) {
      conditions.push(`(authority_id = $${pIdx} OR authority_id IS NULL)`);
      params.push(authorityId);
      pIdx++;
    }

    const sql = `
      SELECT * FROM notifications
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT $${pIdx};
    `;
    params.push(limit);

    const res = await pool.query(sql, params);
    return res.rows.map((r) => ({
      id: r.id,
      eventType: r.event_type,
      complaintId: r.complaint_id,
      citizenId: r.citizen_id,
      authorityId: r.authority_id,
      title: r.title,
      message: r.message,
      channel: r.channel,
      isRead: r.is_read,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }));
  },

  async markAsRead(id: number): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("UPDATE notifications SET is_read = true WHERE id = $1;", [id]);
    return (res.rowCount ?? 0) > 0;
  },

  async markAllAsRead(authorityId?: string): Promise<number> {
    await ensurePostgresTables();
    const pool = getPool();
    let sql = "UPDATE notifications SET is_read = true WHERE is_read = false";
    const params: unknown[] = [];
    if (authorityId) {
      sql += " AND (authority_id = $1 OR authority_id IS NULL)";
      params.push(authorityId);
    }
    const res = await pool.query(sql, params);
    return res.rowCount ?? 0;
  },

  async getUnreadCount(authorityId?: string): Promise<number> {
    await ensurePostgresTables();
    const pool = getPool();
    let sql = "SELECT COUNT(*) AS count FROM notifications WHERE is_read = false";
    const params: unknown[] = [];
    if (authorityId) {
      sql += " AND (authority_id = $1 OR authority_id IS NULL)";
      params.push(authorityId);
    }
    const res = await pool.query(sql, params);
    return parseInt(res.rows[0]?.count || "0", 10);
  },
};
