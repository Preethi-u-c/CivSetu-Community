import crypto from "crypto";
import { getPool, ensurePostgresTables } from "./postgres";
import {
  CitizenService,
  CreateServiceParams,
  UpdateServiceParams,
  ServiceFilterOptions,
  ServiceStats,
} from "@/lib/types/services";

export * from "@/lib/types/services";

function mapServiceRow(row: Record<string, unknown>): CitizenService {
  const toIso = (val: unknown): string => {
    if (!val) return "";
    return val instanceof Date ? val.toISOString() : String(val);
  };

  let docs: string[] = [];
  if (Array.isArray(row.required_documents)) {
    docs = row.required_documents as string[];
  } else if (typeof row.required_documents === "string") {
    try {
      docs = JSON.parse(row.required_documents as string);
    } catch {
      docs = (row.required_documents as string).split(",").map((d) => d.trim());
    }
  }

  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as CitizenService["category"],
    department: row.department as string,
    description: row.description as string,
    eligibility: row.eligibility as string,
    requiredDocuments: docs,
    procedure: row.procedure as string,
    expectedTimeline: row.expected_timeline as string,
    contact: row.contact as string,
    onlineApplicationLink: (row.online_application_link as string) || null,
    fee: (row.fee as string) || null,
    status: (row.status as CitizenService["status"]) || "Active",
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function generateServiceId(category?: string): string {
  let prefix = "SRV";
  if (category) {
    if (category.includes("Water")) prefix = "WAT";
    else if (category.includes("Sanitation")) prefix = "SAN";
    else if (category.includes("Property")) prefix = "PROP";
    else if (category.includes("Birth")) prefix = "REG";
    else if (category.includes("Certificates")) prefix = "CERT";
    else if (category.includes("Applications")) prefix = "APP";
    else if (category.includes("Grievance")) prefix = "GRV";
    else if (category.includes("Emergency")) prefix = "EMG";
  }
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SRV-LMC-${prefix}-${hex}`;
}

export const servicesDb = {
  /**
   * Creates a new citizen service record
   */
  async create(params: CreateServiceParams): Promise<CitizenService> {
    await ensurePostgresTables();
    const pool = getPool();

    const id = generateServiceId(params.category);
    const name = params.name.trim();
    const category = params.category;
    const department = params.department.trim();
    const description = params.description.trim();
    const eligibility = params.eligibility.trim();
    const requiredDocuments = params.requiredDocuments || [];
    const procedure = params.procedure.trim();
    const expectedTimeline = params.expectedTimeline.trim();
    const contact = params.contact.trim();
    const onlineApplicationLink = params.onlineApplicationLink?.trim() || null;
    const fee = params.fee?.trim() || null;
    const status = params.status || "Active";

    const sql = `
      INSERT INTO citizen_services (
        id, name, category, department, description,
        eligibility, required_documents, procedure, expected_timeline,
        contact, online_application_link, fee, status,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *;
    `;

    const values = [
      id,
      name,
      category,
      department,
      description,
      eligibility,
      requiredDocuments,
      procedure,
      expectedTimeline,
      contact,
      onlineApplicationLink,
      fee,
      status,
    ];

    const res = await pool.query(sql, values);
    return mapServiceRow(res.rows[0]);
  },

  /**
   * Lists citizen services with filtering and search
   */
  async list(options: ServiceFilterOptions = {}): Promise<{ services: CitizenService[]; total: number }> {
    await ensurePostgresTables();
    const pool = getPool();

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let pIdx = 1;

    if (options.status && options.status !== "ALL") {
      conditions.push(`status = $${pIdx++}`);
      params.push(options.status);
    }

    if (options.category && options.category !== "ALL") {
      conditions.push(`category = $${pIdx++}`);
      params.push(options.category);
    }

    if (options.department && options.department !== "ALL") {
      conditions.push(`department = $${pIdx++}`);
      params.push(options.department);
    }

    if (options.search && options.search.trim()) {
      conditions.push(
        `(name ILIKE $${pIdx} OR description ILIKE $${pIdx} OR department ILIKE $${pIdx} OR procedure ILIKE $${pIdx} OR eligibility ILIKE $${pIdx})`
      );
      params.push(`%${options.search.trim()}%`);
      pIdx++;
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countSql = `SELECT COUNT(*) AS count FROM citizen_services ${whereClause};`;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0]?.count || "0", 10);

    const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 100);
    const offset = Math.max(Number(options.offset) || 0, 0);

    const dataSql = `
      SELECT * FROM citizen_services
      ${whereClause}
      ORDER BY
        CASE WHEN status = 'Active' THEN 1 WHEN status = 'Draft' THEN 2 ELSE 3 END ASC,
        category ASC,
        name ASC
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `;
    params.push(limit, offset);

    const dataRes = await pool.query(dataSql, params);
    return {
      services: dataRes.rows.map(mapServiceRow),
      total,
    };
  },

  /**
   * Public list of active citizen services
   */
  async listPublic(options: ServiceFilterOptions = {}): Promise<CitizenService[]> {
    const res = await this.list({
      ...options,
      status: "Active",
    });
    return res.services;
  },

  /**
   * Retrieves a service by ID
   */
  async getById(id: string): Promise<CitizenService | null> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("SELECT * FROM citizen_services WHERE id = $1 LIMIT 1;", [id.trim()]);
    if (res.rows.length === 0) return null;
    return mapServiceRow(res.rows[0]);
  },

  /**
   * Updates an existing citizen service
   */
  async update(id: string, updates: UpdateServiceParams): Promise<CitizenService> {
    await ensurePostgresTables();
    const pool = getPool();

    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Citizen service ${id} not found.`);
    }

    const fields: string[] = [];
    const params: unknown[] = [];
    let pIdx = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${pIdx++}`);
      params.push(updates.name.trim());
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${pIdx++}`);
      params.push(updates.category);
    }
    if (updates.department !== undefined) {
      fields.push(`department = $${pIdx++}`);
      params.push(updates.department.trim());
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${pIdx++}`);
      params.push(updates.description.trim());
    }
    if (updates.eligibility !== undefined) {
      fields.push(`eligibility = $${pIdx++}`);
      params.push(updates.eligibility.trim());
    }
    if (updates.requiredDocuments !== undefined) {
      fields.push(`required_documents = $${pIdx++}`);
      params.push(updates.requiredDocuments);
    }
    if (updates.procedure !== undefined) {
      fields.push(`procedure = $${pIdx++}`);
      params.push(updates.procedure.trim());
    }
    if (updates.expectedTimeline !== undefined) {
      fields.push(`expected_timeline = $${pIdx++}`);
      params.push(updates.expectedTimeline.trim());
    }
    if (updates.contact !== undefined) {
      fields.push(`contact = $${pIdx++}`);
      params.push(updates.contact.trim());
    }
    if (updates.onlineApplicationLink !== undefined) {
      fields.push(`online_application_link = $${pIdx++}`);
      params.push(updates.onlineApplicationLink ? updates.onlineApplicationLink.trim() : null);
    }
    if (updates.fee !== undefined) {
      fields.push(`fee = $${pIdx++}`);
      params.push(updates.fee ? updates.fee.trim() : null);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${pIdx++}`);
      params.push(updates.status);
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id.trim());

    const sql = `
      UPDATE citizen_services
      SET ${fields.join(", ")}
      WHERE id = $${pIdx}
      RETURNING *;
    `;

    const res = await pool.query(sql, params);
    return mapServiceRow(res.rows[0]);
  },

  /**
   * Deletes a citizen service
   */
  async delete(id: string): Promise<boolean> {
    await ensurePostgresTables();
    const pool = getPool();
    const res = await pool.query("DELETE FROM citizen_services WHERE id = $1;", [id.trim()]);
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Returns stats for the admin services dashboard
   */
  async getStats(): Promise<ServiceStats> {
    await ensurePostgresTables();
    const pool = getPool();
    const sql = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Active') AS active,
        COUNT(*) FILTER (WHERE status = 'Draft') AS drafts,
        COUNT(*) FILTER (WHERE status = 'Suspended') AS suspended
      FROM citizen_services;
    `;
    const res = await pool.query(sql);
    const r = res.rows[0];
    return {
      total: parseInt(r?.total || "0", 10),
      active: parseInt(r?.active || "0", 10),
      drafts: parseInt(r?.drafts || "0", 10),
      suspended: parseInt(r?.suspended || "0", 10),
    };
  },
};
