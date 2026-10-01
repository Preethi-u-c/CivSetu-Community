import { getPool, ensurePostgresTables, AdminUserRecord, WardRecord, ComplaintCategoryRecord, NoticeCategoryRecord, EscalationSettingRecord, SystemSettingRecord } from "./postgres";
import { SafeAuthorityUser, toSafeAuthorityUser } from "./authority";
import crypto from "crypto";

export interface SafeAdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface SafeCitizenWithStats {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  wardNumber: string;
  residentialAddress: string;
  mobileVerified: boolean;
  complaintCount: number;
  createdAt: string;
}

export interface AdminSummaryCounts {
  totalCitizens: number;
  totalWards: number;
  totalComplaints: number;
  openComplaints: number;
  escalatedComplaints: number;
  resolvedComplaints: number;
  activeAuthorities: number;
  publishedNotices: number;
}

export interface AdminRecentActivityItem {
  id: string;
  type: "complaint_lodged" | "timeline_event" | "notice_published" | "citizen_registered";
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
  badgeVariant?: "info" | "warning" | "success" | "danger";
}

function mapAdminRow(row: Record<string, unknown>): AdminUserRecord {
  const toIso = (val: unknown) => (val instanceof Date ? val.toISOString() : String(val));
  return {
    id: row.id as string,
    username: row.username as string,
    fullName: row.full_name as string,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    role: row.role as string,
    isActive: Boolean(row.is_active),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function toSafeAdminUser(user: AdminUserRecord): SafeAdminUser {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export const adminDb = {
  async findById(id: string): Promise<AdminUserRecord | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("SELECT * FROM admin_users WHERE id = $1 LIMIT 1;", [id]);
    return res.rows.length > 0 ? mapAdminRow(res.rows[0]) : null;
  },

  async findByUsernameOrEmail(identifier: string): Promise<AdminUserRecord | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const clean = identifier.trim();
    const res = await pool.query(
      "SELECT * FROM admin_users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) OR id = $1 LIMIT 1;",
      [clean]
    );
    return res.rows.length > 0 ? mapAdminRow(res.rows[0]) : null;
  },

  async listAll(): Promise<SafeAdminUser[]> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("SELECT * FROM admin_users ORDER BY created_at ASC;");
    return res.rows.map(mapAdminRow).map(toSafeAdminUser);
  },

  async createSession(adminId: string, expiresAt: Date): Promise<string> {
    await ensurePostgresTables();
    const pool = getPool();
    const sessionId = crypto.randomBytes(32).toString("hex");
    const sql = `
      INSERT INTO admin_sessions (id, admin_id, expires_at, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP);
    `;
    await pool.query(sql, [sessionId, adminId, expiresAt]);
    return sessionId;
  },

  async getSession(sessionId: string): Promise<{ adminId: string; expiresAt: Date } | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const sql = `
      SELECT admin_id, expires_at FROM admin_sessions
      WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1;
    `;
    const res = await pool.query(sql, [sessionId]);
    if (res.rows.length === 0) return null;
    return {
      adminId: res.rows[0].admin_id,
      expiresAt: new Date(res.rows[0].expires_at),
    };
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("DELETE FROM admin_sessions WHERE id = $1;", [sessionId]);
    return (res.rowCount ?? 0) > 0;
  },
};

export const adminDashboardDb = {
  async getSummaryCounts(): Promise<AdminSummaryCounts> {
    await ensurePostgresTables();
    const pool = getPool();

    const sql = `
      SELECT
        (SELECT COUNT(*) FROM citizens) AS total_citizens,
        (SELECT COUNT(*) FROM wards WHERE is_active = true) AS total_wards,
        (SELECT COUNT(*) FROM complaints) AS total_complaints,
        (SELECT COUNT(*) FROM complaints WHERE status NOT IN ('Resolved', 'Closed')) AS open_complaints,
        (SELECT COUNT(*) FROM complaints WHERE status = 'Escalated') AS escalated_complaints,
        (SELECT COUNT(*) FROM complaints WHERE status = 'Resolved') AS resolved_complaints,
        (SELECT COUNT(*) FROM authority_users WHERE is_active = true) AS active_authorities,
        (SELECT COUNT(*) FROM notices WHERE status = 'Published') AS published_notices;
    `;
    const res = await pool.query(sql);
    const r = res.rows[0] || {};
    return {
      totalCitizens: parseInt(r.total_citizens || "0", 10),
      totalWards: parseInt(r.total_wards || "0", 10),
      totalComplaints: parseInt(r.total_complaints || "0", 10),
      openComplaints: parseInt(r.open_complaints || "0", 10),
      escalatedComplaints: parseInt(r.escalated_complaints || "0", 10),
      resolvedComplaints: parseInt(r.resolved_complaints || "0", 10),
      activeAuthorities: parseInt(r.active_authorities || "0", 10),
      publishedNotices: parseInt(r.published_notices || "0", 10),
    };
  },

  async getRecentActivity(limit = 10): Promise<AdminRecentActivityItem[]> {
    await ensurePostgresTables();
    const pool = getPool();

    const items: AdminRecentActivityItem[] = [];

    // Recent complaints
    const complaintsRes = await pool.query(
      `SELECT c.id, c.title, c.category, c.ward, c.status, c.created_at, cit.full_name AS citizen_name
       FROM complaints c
       LEFT JOIN citizens cit ON c.citizen_id = cit.id
       ORDER BY c.created_at DESC LIMIT $1;`,
      [limit]
    );

    for (const r of complaintsRes.rows) {
      items.push({
        id: `complaint-${r.id}`,
        type: "complaint_lodged",
        title: `Grievance #${r.id} Lodged`,
        description: `${r.title} (${r.category}) in ${r.ward} by ${r.citizen_name || "Citizen"}`,
        timestamp: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
        badge: r.status,
        badgeVariant: r.status === "Resolved" ? "success" : r.status === "Escalated" ? "danger" : "info",
      });
    }

    // Recent timeline events (actions taken by authorities)
    const timelineRes = await pool.query(
      `SELECT t.id, t.complaint_id, t.action, t.status, t.note, t.updated_by, t.created_at
       FROM complaint_timeline t
       ORDER BY t.created_at DESC LIMIT $1;`,
      [limit]
    );

    for (const t of timelineRes.rows) {
      items.push({
        id: `timeline-${t.id}`,
        type: "timeline_event",
        title: `${t.action} on #${t.complaint_id}`,
        description: `${t.note} by ${t.updated_by}`,
        timestamp: t.created_at instanceof Date ? t.created_at.toISOString() : String(t.created_at),
        badge: t.status,
        badgeVariant: t.status === "Resolved" ? "success" : t.status === "Escalated" ? "warning" : "info",
      });
    }

    // Recent notices
    const noticesRes = await pool.query(
      `SELECT id, title, category, status, publish_date, issued_by_name
       FROM notices
       ORDER BY publish_date DESC LIMIT $1;`,
      [limit]
    );

    for (const n of noticesRes.rows) {
      items.push({
        id: `notice-${n.id}`,
        type: "notice_published",
        title: `Circular Issued: ${n.title}`,
        description: `${n.category} published by ${n.issued_by_name}`,
        timestamp: n.publish_date instanceof Date ? n.publish_date.toISOString() : String(n.publish_date),
        badge: n.status,
        badgeVariant: "success",
      });
    }

    // Sort by timestamp desc and take top `limit`
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items.slice(0, limit);
  },
};

export const adminCitizensDb = {
  async list(params: {
    search?: string;
    ward?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    citizens: SafeCitizenWithStats[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    await ensurePostgresTables();
    const pool = getPool();

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ["1=1"];
    const queryParams: unknown[] = [];
    let pIdx = 1;

    if (params.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(
        `(c.full_name ILIKE $${pIdx} OR c.mobile_number ILIKE $${pIdx} OR c.email ILIKE $${pIdx} OR c.id ILIKE $${pIdx})`
      );
      queryParams.push(q);
      pIdx++;
    }

    if (params.ward && params.ward !== "ALL") {
      const cleanWard = params.ward.trim();
      conditions.push(`(c.ward_number = $${pIdx} OR c.ward_number ILIKE $${pIdx})`);
      queryParams.push(cleanWard);
      pIdx++;
    }

    const whereClause = conditions.join(" AND ");

    // Count query
    const countSql = `SELECT COUNT(*) AS total FROM citizens c WHERE ${whereClause};`;
    const countRes = await pool.query(countSql, queryParams);
    const total = parseInt(countRes.rows[0]?.total || "0", 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Data query with complaint count
    const dataSql = `
      SELECT
        c.id, c.full_name, c.mobile_number, c.email, c.ward_number,
        c.residential_address, c.mobile_verified, c.created_at,
        COUNT(comp.id) AS complaint_count
      FROM citizens c
      LEFT JOIN complaints comp ON comp.citizen_id = c.id
      WHERE ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $${pIdx} OFFSET $${pIdx + 1};
    `;
    const dataParams = [...queryParams, limit, offset];
    const dataRes = await pool.query(dataSql, dataParams);

    const citizens: SafeCitizenWithStats[] = dataRes.rows.map((r) => ({
      id: r.id as string,
      fullName: r.full_name as string,
      mobileNumber: r.mobile_number as string,
      email: r.email as string,
      wardNumber: r.ward_number as string,
      residentialAddress: r.residential_address as string,
      mobileVerified: Boolean(r.mobile_verified),
      complaintCount: parseInt(r.complaint_count || "0", 10),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }));

    return { citizens, total, page, limit, totalPages };
  },

  async getDetails(id: string): Promise<(SafeCitizenWithStats & { complaints: Array<{ id: string; title: string; category: string; status: string; createdAt: string }> }) | null> {
    await ensurePostgresTables();
    const pool = getPool();

    const citizenRes = await pool.query(
      `SELECT id, full_name, mobile_number, email, ward_number, residential_address, mobile_verified, created_at
       FROM citizens WHERE id = $1 LIMIT 1;`,
      [id]
    );

    if (citizenRes.rows.length === 0) return null;
    const c = citizenRes.rows[0];

    const complaintsRes = await pool.query(
      `SELECT id, title, category, status, created_at FROM complaints
       WHERE citizen_id = $1 ORDER BY created_at DESC;`,
      [id]
    );

    return {
      id: c.id,
      fullName: c.full_name,
      mobileNumber: c.mobile_number,
      email: c.email,
      wardNumber: c.ward_number,
      residentialAddress: c.residential_address,
      mobileVerified: Boolean(c.mobile_verified),
      complaintCount: complaintsRes.rows.length,
      createdAt: c.created_at instanceof Date ? c.created_at.toISOString() : String(c.created_at),
      complaints: complaintsRes.rows.map((comp) => ({
        id: comp.id,
        title: comp.title,
        category: comp.category,
        status: comp.status,
        createdAt: comp.created_at instanceof Date ? comp.created_at.toISOString() : String(comp.created_at),
      })),
    };
  },
};

export const adminWardsDb = {
  async listWithStats(): Promise<Array<{
    wardNumber: number;
    name: string;
    population: number;
    citizenCount: number;
    complaintCount: number;
    isActive: boolean;
  }>> {
    await ensurePostgresTables();
    const pool = getPool();

    const sql = `
      SELECT
        w.ward_number,
        w.name,
        w.population,
        w.is_active,
        (
          SELECT COUNT(*) FROM citizens c
          WHERE c.ward_number = w.ward_number::text
             OR c.ward_number ILIKE '%' || w.ward_number || '%'
        ) AS citizen_count,
        (
          SELECT COUNT(*) FROM complaints comp
          WHERE comp.ward = w.name
             OR comp.ward = 'Ward ' || LPAD(w.ward_number::text, 2, '0')
             OR comp.ward ILIKE '%' || w.ward_number || '%'
        ) AS complaint_count
      FROM wards w
      ORDER BY w.ward_number ASC;
    `;

    const res = await pool.query(sql);
    return res.rows.map((r) => ({
      wardNumber: Number(r.ward_number),
      name: r.name as string,
      population: Number(r.population || 0),
      citizenCount: parseInt(r.citizen_count || "0", 10),
      complaintCount: parseInt(r.complaint_count || "0", 10),
      isActive: Boolean(r.is_active),
    }));
  },

  async toggleActive(wardNumber: number, isActive: boolean): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query(
      `UPDATE wards SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE ward_number = $2;`,
      [isActive, wardNumber]
    );
    return (res.rowCount ?? 0) > 0;
  },
};

export const adminAuthoritiesDb = {
  async listHierarchical(): Promise<Array<SafeAuthorityUser & { complaintCount: number }>> {
    await ensurePostgresTables();
    const pool = getPool();

    const sql = `
      SELECT
        u.*,
        COUNT(c.id) AS complaint_count
      FROM authority_users u
      LEFT JOIN complaints c ON c.assigned_authority ILIKE '%' || u.department || '%'
                             OR c.assigned_authority ILIKE '%' || u.designation || '%'
      GROUP BY u.id
      ORDER BY
        CASE u.authority_level
          WHEN 'Local Authority' THEN 1
          WHEN 'Block level' THEN 2
          WHEN 'District Panchayat' THEN 3
          WHEN 'District Administration' THEN 4
          ELSE 5
        END ASC,
        u.full_name ASC;
    `;

    const res = await pool.query(sql);
    return res.rows.map((r) => ({
      id: r.id as string,
      fullName: r.full_name as string,
      designation: r.designation as string,
      department: r.department as string,
      authorityLevel: r.authority_level as "Local Authority" | "Block level" | "District Panchayat" | "District Administration",
      email: r.email as string,
      mobileNumber: (r.mobile_number as string) || undefined,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      complaintCount: parseInt(r.complaint_count || "0", 10),
    }));
  },

  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query(
      `UPDATE authority_users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;`,
      [isActive, id.trim()]
    );
    return (res.rowCount ?? 0) > 0;
  },
};

export const adminCategoriesDb = {
  async listComplaintCategories(): Promise<ComplaintCategoryRecord[]> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query(
      "SELECT * FROM complaint_categories ORDER BY created_at ASC;"
    );
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      department: r.department,
      description: r.description || "",
      isActive: Boolean(r.is_active),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    }));
  },

  async addComplaintCategory(data: {
    id: string;
    name: string;
    department: string;
    description?: string;
  }): Promise<ComplaintCategoryRecord> {
    await ensurePostgresTables();
    const pool = getPool();
    const cleanId = data.id.toLowerCase().replace(/[^a-z0-9_-]/g, "").trim();
    const res = await pool.query(
      `INSERT INTO complaint_categories (id, name, department, description, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [cleanId, data.name.trim(), data.department.trim(), data.description?.trim() || ""]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      department: r.department,
      description: r.description || "",
      isActive: Boolean(r.is_active),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  },

  async updateComplaintCategory(
    id: string,
    data: { name?: string; department?: string; description?: string; isActive?: boolean }
  ): Promise<ComplaintCategoryRecord | null> {
    await ensurePostgresTables();
    const pool = getPool();

    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const params: unknown[] = [id.trim()];
    let pIdx = 2;

    if (data.name !== undefined) {
      updates.push(`name = $${pIdx++}`);
      params.push(data.name.trim());
    }
    if (data.department !== undefined) {
      updates.push(`department = $${pIdx++}`);
      params.push(data.department.trim());
    }
    if (data.description !== undefined) {
      updates.push(`description = $${pIdx++}`);
      params.push(data.description.trim());
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${pIdx++}`);
      params.push(Boolean(data.isActive));
    }

    const sql = `UPDATE complaint_categories SET ${updates.join(", ")} WHERE id = $1 RETURNING *;`;
    const res = await pool.query(sql, params);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      department: r.department,
      description: r.description || "",
      isActive: Boolean(r.is_active),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  },

  async listNoticeCategories(): Promise<NoticeCategoryRecord[]> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query(
      "SELECT * FROM notice_categories ORDER BY created_at ASC;"
    );
    return res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || "",
      isActive: Boolean(r.is_active),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    }));
  },

  async addNoticeCategory(data: {
    id: string;
    name: string;
    description?: string;
  }): Promise<NoticeCategoryRecord> {
    await ensurePostgresTables();
    const pool = getPool();
    const cleanId = data.id.toLowerCase().replace(/[^a-z0-9_-]/g, "").trim();
    const res = await pool.query(
      `INSERT INTO notice_categories (id, name, description, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [cleanId, data.name.trim(), data.description?.trim() || ""]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      description: r.description || "",
      isActive: Boolean(r.is_active),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  },

  async updateNoticeCategory(
    id: string,
    data: { name?: string; description?: string; isActive?: boolean }
  ): Promise<NoticeCategoryRecord | null> {
    await ensurePostgresTables();
    const pool = getPool();

    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const params: unknown[] = [id.trim()];
    let pIdx = 2;

    if (data.name !== undefined) {
      updates.push(`name = $${pIdx++}`);
      params.push(data.name.trim());
    }
    if (data.description !== undefined) {
      updates.push(`description = $${pIdx++}`);
      params.push(data.description.trim());
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${pIdx++}`);
      params.push(Boolean(data.isActive));
    }

    const sql = `UPDATE notice_categories SET ${updates.join(", ")} WHERE id = $1 RETURNING *;`;
    const res = await pool.query(sql, params);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      description: r.description || "",
      isActive: Boolean(r.is_active),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  },
};

export const adminEscalationDb = {
  async list(): Promise<EscalationSettingRecord[]> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query(`
      SELECT * FROM escalation_settings
      ORDER BY
        CASE tier_level
          WHEN 'Local Authority' THEN 1
          WHEN 'Block level' THEN 2
          WHEN 'District Panchayat' THEN 3
          WHEN 'District Administration' THEN 4
          ELSE 5
        END ASC;
    `);
    return res.rows.map((r) => ({
      tierLevel: r.tier_level,
      title: r.title,
      targetAuthority: r.target_authority,
      slaHours: Number(r.sla_hours),
      nextTier: r.next_tier || null,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    }));
  },

  async updateTier(
    tierLevel: string,
    data: { title?: string; targetAuthority?: string; slaHours?: number; nextTier?: string | null; isActive?: boolean }
  ): Promise<EscalationSettingRecord | null> {
    await ensurePostgresTables();
    const pool = getPool();

    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const params: unknown[] = [tierLevel.trim()];
    let pIdx = 2;

    if (data.title !== undefined) {
      updates.push(`title = $${pIdx++}`);
      params.push(data.title.trim());
    }
    if (data.targetAuthority !== undefined) {
      updates.push(`target_authority = $${pIdx++}`);
      params.push(data.targetAuthority.trim());
    }
    if (data.slaHours !== undefined) {
      updates.push(`sla_hours = $${pIdx++}`);
      params.push(Number(data.slaHours));
    }
    if (data.nextTier !== undefined) {
      updates.push(`next_tier = $${pIdx++}`);
      params.push(data.nextTier);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${pIdx++}`);
      params.push(Boolean(data.isActive));
    }

    const sql = `UPDATE escalation_settings SET ${updates.join(", ")} WHERE tier_level = $1 RETURNING *;`;
    const res = await pool.query(sql, params);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      tierLevel: r.tier_level,
      title: r.title,
      targetAuthority: r.target_authority,
      slaHours: Number(r.sla_hours),
      nextTier: r.next_tier || null,
      isActive: Boolean(r.is_active),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  },
};

export const adminSettingsDb = {
  async getAll(): Promise<Record<string, { value: string; description: string; category: string; updatedAt: string }>> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("SELECT * FROM system_settings ORDER BY category ASC, key ASC;");
    const result: Record<string, { value: string; description: string; category: string; updatedAt: string }> = {};
    for (const r of res.rows) {
      result[r.key] = {
        value: r.value,
        description: r.description || "",
        category: r.category,
        updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
      };
    }
    return result;
  },

  async updateSettings(settings: Record<string, string>): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();

    // Sensitive keys protection
    const FORBIDDEN_KEYS = ["DATABASE_URL", "AUTH_SECRET", "PASSWORD", "SECRET", "TOKEN"];

    for (const [key, val] of Object.entries(settings)) {
      if (FORBIDDEN_KEYS.some((f) => key.toUpperCase().includes(f))) {
        continue;
      }
      await pool.query(
        `INSERT INTO system_settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;`,
        [key, String(val)]
      );
    }
    return true;
  },
};

export const adminAnalyticsDb = {
  async getAnalyticsData() {
    await ensurePostgresTables();
    const pool = getPool();

    // 1. Complaints by Category
    const catRes = await pool.query(`
      SELECT category, COUNT(*) AS count
      FROM complaints
      GROUP BY category
      ORDER BY count DESC;
    `);

    // 2. Complaints by Ward
    const wardRes = await pool.query(`
      SELECT ward, COUNT(*) AS count
      FROM complaints
      GROUP BY ward
      ORDER BY count DESC;
    `);

    // 3. Status Distribution
    const statusRes = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM complaints
      GROUP BY status
      ORDER BY count DESC;
    `);

    // 4. Resolution Stats
    const resStatsRes = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved,
        COUNT(*) FILTER (WHERE status = 'Escalated') AS escalated
      FROM complaints;
    `);
    const rStat = resStatsRes.rows[0] || {};
    const totalComp = parseInt(rStat.total || "0", 10);
    const resolvedComp = parseInt(rStat.resolved || "0", 10);
    const escalatedComp = parseInt(rStat.escalated || "0", 10);

    // 5. Notices Distribution
    const noticeRes = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Published') AS published,
        COUNT(*) FILTER (WHERE status = 'Draft') AS draft,
        COUNT(*) FILTER (WHERE status = 'Archived') AS archived,
        COUNT(*) FILTER (WHERE is_emergency = true) AS emergency
      FROM notices;
    `);
    const nStat = noticeRes.rows[0] || {};

    // 6. Citizens Stats
    const citStatsRes = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE mobile_verified = true) AS verified
      FROM citizens;
    `);
    const cStat = citStatsRes.rows[0] || {};

    const citByWardRes = await pool.query(`
      SELECT ward_number AS ward, COUNT(*) AS count
      FROM citizens
      GROUP BY ward_number
      ORDER BY count DESC;
    `);

    return {
      complaintsByCategory: catRes.rows.map((r) => ({
        category: r.category as string,
        count: parseInt(r.count || "0", 10),
      })),
      complaintsByWard: wardRes.rows.map((r) => ({
        ward: r.ward as string,
        count: parseInt(r.count || "0", 10),
      })),
      complaintStatusDistribution: statusRes.rows.map((r) => ({
        status: r.status as string,
        count: parseInt(r.count || "0", 10),
      })),
      resolutionStats: {
        total: totalComp,
        resolved: resolvedComp,
        rate: totalComp > 0 ? Math.round((resolvedComp / totalComp) * 100) : 0,
      },
      escalationStats: {
        total: totalComp,
        escalated: escalatedComp,
        rate: totalComp > 0 ? Math.round((escalatedComp / totalComp) * 100) : 0,
      },
      noticesDistribution: {
        total: parseInt(nStat.total || "0", 10),
        published: parseInt(nStat.published || "0", 10),
        draft: parseInt(nStat.draft || "0", 10),
        archived: parseInt(nStat.archived || "0", 10),
        emergency: parseInt(nStat.emergency || "0", 10),
      },
      citizenStats: {
        total: parseInt(cStat.total || "0", 10),
        verified: parseInt(cStat.verified || "0", 10),
        byWard: citByWardRes.rows.map((r) => ({
          ward: r.ward as string,
          count: parseInt(r.count || "0", 10),
        })),
      },
    };
  },
};
