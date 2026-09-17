import { Pool, QueryResultRow } from "pg";
import crypto from "crypto";

// =============================================================================
// TypeScript Interfaces for Database Records
// =============================================================================

export interface CitizenRecord {
  id: string;
  fullName: string;
  mobileNumber: string;
  mobileVerified: boolean;
  email: string;
  passwordHash: string;
  wardNumber: string;
  residentialAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpRecord {
  id: number;
  identifier: string;
  purpose: "registration" | "password_reset";
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

export interface SessionRecord {
  id: string;
  citizenId: string;
  expiresAt: Date;
  createdAt: Date;
}

// =============================================================================
// Connection Pool Singleton
// =============================================================================

let poolInstance: Pool | null = null;
let tablesInitialized = false;

export function isPostgresConfigured(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0;
}

export function getPool(): Pool {
  if (!isPostgresConfigured()) {
    throw new Error(
      "PostgreSQL database is not configured. Please define the DATABASE_URL environment variable."
    );
  }

  if (!poolInstance) {
    const isProduction = process.env.NODE_ENV === "production";
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  return poolInstance;
}

/**
 * Ensures required tables and indexes exist in PostgreSQL.
 */
export async function ensurePostgresTables(): Promise<void> {
  if (tablesInitialized) return;
  const pool = getPool();

  const ddl = `
    CREATE TABLE IF NOT EXISTS citizens (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(15) NOT NULL UNIQUE,
        mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        ward_number VARCHAR(64) NOT NULL,
        residential_address TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_citizens_mobile ON citizens(mobile_number);
    CREATE INDEX IF NOT EXISTS idx_citizens_email ON citizens(email);
    CREATE INDEX IF NOT EXISTS idx_citizens_ward ON citizens(ward_number);

    CREATE TABLE IF NOT EXISTS citizen_otps (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        purpose VARCHAR(32) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_otps_identifier_purpose ON citizen_otps(identifier, purpose);
    CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON citizen_otps(expires_at);

    CREATE TABLE IF NOT EXISTS citizen_sessions (
        id VARCHAR(64) PRIMARY KEY,
        citizen_id VARCHAR(64) NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_citizen_id ON citizen_sessions(citizen_id);

    CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(64) PRIMARY KEY,
        citizen_id VARCHAR(64) NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
        category VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        ward VARCHAR(64) NOT NULL,
        address TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        photo_url TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'Submitted',
        priority VARCHAR(32) NOT NULL DEFAULT 'Medium',
        assigned_authority VARCHAR(255) NOT NULL DEFAULT 'Lakshmeshwar TMC Grievance Cell',
        authority_level VARCHAR(64) NOT NULL DEFAULT 'Local Authority',
        deadline TIMESTAMP WITH TIME ZONE NOT NULL,
        resolution_notes TEXT,
        resolved_at TIMESTAMP WITH TIME ZONE,
        closed_at TIMESTAMP WITH TIME ZONE,
        reopened_reason TEXT,
        escalation_reason TEXT,
        escalated_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_complaints_citizen_id ON complaints(citizen_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
    CREATE INDEX IF NOT EXISTS idx_complaints_ward ON complaints(ward);
    CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_complaints_deadline ON complaints(deadline);

    CREATE TABLE IF NOT EXISTS complaint_timeline (
        id SERIAL PRIMARY KEY,
        complaint_id VARCHAR(64) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL,
        action VARCHAR(64) NOT NULL,
        note TEXT NOT NULL,
        updated_by VARCHAR(255) NOT NULL,
        authority_level VARCHAR(64) NOT NULL,
        assigned_to VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_complaint_timeline_complaint_id ON complaint_timeline(complaint_id);
    CREATE INDEX IF NOT EXISTS idx_complaint_timeline_created_at ON complaint_timeline(created_at ASC);
  `;

  await pool.query(ddl);
  tablesInitialized = true;
}

// Generic query helper
async function query<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  await ensurePostgresTables();
  const pool = getPool();
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

// Row mapper for Citizen
function mapCitizenRow(row: Record<string, unknown>): CitizenRecord {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    mobileNumber: row.mobile_number as string,
    mobileVerified: Boolean(row.mobile_verified),
    email: row.email as string,
    passwordHash: row.password_hash as string,
    wardNumber: row.ward_number as string,
    residentialAddress: row.residential_address as string,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

// =============================================================================
// Citizen Database Operations
// =============================================================================

export const citizenDb = {
  async createCitizen(params: {
    fullName: string;
    mobileNumber: string;
    email: string;
    passwordHash: string;
    wardNumber: string;
    residentialAddress: string;
  }): Promise<CitizenRecord> {
    const id = `CTZ-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const sql = `
      INSERT INTO citizens (
        id, full_name, mobile_number, mobile_verified, email,
        password_hash, ward_number, residential_address, created_at, updated_at
      ) VALUES ($1, $2, $3, true, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const rows = await query(sql, [
      id,
      params.fullName.trim(),
      params.mobileNumber.trim(),
      params.email.trim().toLowerCase(),
      params.passwordHash,
      params.wardNumber.toString().trim(),
      params.residentialAddress.trim(),
    ]);

    return mapCitizenRow(rows[0]);
  },

  async findByMobile(mobile: string): Promise<CitizenRecord | null> {
    const rows = await query("SELECT * FROM citizens WHERE mobile_number = $1 LIMIT 1;", [
      mobile.trim(),
    ]);
    return rows.length > 0 ? mapCitizenRow(rows[0]) : null;
  },

  async findByEmail(email: string): Promise<CitizenRecord | null> {
    const rows = await query("SELECT * FROM citizens WHERE LOWER(email) = LOWER($1) LIMIT 1;", [
      email.trim(),
    ]);
    return rows.length > 0 ? mapCitizenRow(rows[0]) : null;
  },

  async findByIdentifier(identifier: string): Promise<CitizenRecord | null> {
    const clean = identifier.trim();
    const cleanMobile = clean.replace(/\D/g, "").slice(-10);
    const rows = await query(
      "SELECT * FROM citizens WHERE mobile_number = $1 OR mobile_number = $2 OR LOWER(email) = LOWER($1) LIMIT 1;",
      [clean, cleanMobile]
    );
    return rows.length > 0 ? mapCitizenRow(rows[0]) : null;
  },

  async findById(id: string): Promise<CitizenRecord | null> {
    const rows = await query("SELECT * FROM citizens WHERE id = $1 LIMIT 1;", [id]);
    return rows.length > 0 ? mapCitizenRow(rows[0]) : null;
  },

  async updatePassword(citizenId: string, passwordHash: string): Promise<boolean> {
    const sql = `
      UPDATE citizens
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;
    const pool = getPool();
    await ensurePostgresTables();
    const res = await pool.query(sql, [passwordHash, citizenId]);
    return (res.rowCount ?? 0) > 0;
  },
};

// =============================================================================
// OTP Database Operations
// =============================================================================

export const otpDb = {
  async saveOtp(params: {
    identifier: string;
    purpose: "registration" | "password_reset";
    otpHash: string;
    expiresAt: Date;
  }): Promise<number> {
    const sql = `
      INSERT INTO citizen_otps (identifier, purpose, otp_hash, attempts, expires_at, verified, created_at)
      VALUES ($1, $2, $3, 0, $4, false, CURRENT_TIMESTAMP)
      RETURNING id;
    `;
    const rows = await query<{ id: number }>(sql, [
      params.identifier.trim(),
      params.purpose,
      params.otpHash,
      params.expiresAt,
    ]);
    return rows[0].id;
  },

  async getLatestOtp(
    identifier: string,
    purpose: "registration" | "password_reset"
  ): Promise<OtpRecord | null> {
    const sql = `
      SELECT * FROM citizen_otps
      WHERE identifier = $1 AND purpose = $2
      ORDER BY id DESC
      LIMIT 1;
    `;
    const rows = await query(sql, [identifier.trim(), purpose]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id as number,
      identifier: r.identifier as string,
      purpose: r.purpose as "registration" | "password_reset",
      otpHash: r.otp_hash as string,
      attempts: r.attempts as number,
      expiresAt: r.expires_at as Date,
      verified: Boolean(r.verified),
      createdAt: r.created_at as Date,
    };
  },

  async incrementAttempts(id: number): Promise<number> {
    const sql = `
      UPDATE citizen_otps
      SET attempts = attempts + 1
      WHERE id = $1
      RETURNING attempts;
    `;
    const rows = await query<{ attempts: number }>(sql, [id]);
    return rows[0]?.attempts ?? 0;
  },

  async markVerified(id: number): Promise<boolean> {
    const sql = `
      UPDATE citizen_otps
      SET verified = true
      WHERE id = $1;
    `;
    const pool = getPool();
    await ensurePostgresTables();
    const res = await pool.query(sql, [id]);
    return (res.rowCount ?? 0) > 0;
  },

  async isVerifiedRecently(
    identifier: string,
    purpose: "registration" | "password_reset",
    withinMinutes = 15
  ): Promise<boolean> {
    const sql = `
      SELECT id FROM citizen_otps
      WHERE identifier = $1 AND purpose = $2 AND verified = true
        AND created_at >= NOW() - INTERVAL '${withinMinutes} minutes'
      ORDER BY id DESC
      LIMIT 1;
    `;
    const rows = await query(sql, [identifier.trim(), purpose]);
    return rows.length > 0;
  },

  async consumeVerifiedOtp(
    identifier: string,
    purpose: "registration" | "password_reset"
  ): Promise<boolean> {
    const sql = `
      UPDATE citizen_otps
      SET verified = false
      WHERE id IN (
        SELECT id FROM citizen_otps
        WHERE identifier = $1 AND purpose = $2 AND verified = true
        ORDER BY id DESC LIMIT 1
      );
    `;
    const pool = getPool();
    await ensurePostgresTables();
    const res = await pool.query(sql, [identifier.trim(), purpose]);
    return (res.rowCount ?? 0) > 0;
  },
};

// =============================================================================
// Session Database Operations
// =============================================================================

export const sessionDb = {
  async createSession(citizenId: string, expiresAt: Date): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString("hex");
    const sql = `
      INSERT INTO citizen_sessions (id, citizen_id, expires_at, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP);
    `;
    await query(sql, [sessionId, citizenId, expiresAt]);
    return sessionId;
  },

  async getSession(sessionId: string): Promise<{ citizenId: string; expiresAt: Date } | null> {
    const sql = `
      SELECT citizen_id, expires_at FROM citizen_sessions
      WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1;
    `;
    const rows = await query<{ citizen_id: string; expires_at: Date }>(sql, [sessionId]);
    if (rows.length === 0) return null;
    return {
      citizenId: rows[0].citizen_id,
      expiresAt: new Date(rows[0].expires_at),
    };
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    const sql = "DELETE FROM citizen_sessions WHERE id = $1;";
    const pool = getPool();
    await ensurePostgresTables();
    const res = await pool.query(sql, [sessionId]);
    return (res.rowCount ?? 0) > 0;
  },

  async deleteCitizenSessions(citizenId: string): Promise<boolean> {
    const sql = "DELETE FROM citizen_sessions WHERE citizen_id = $1;";
    const pool = getPool();
    await ensurePostgresTables();
    const res = await pool.query(sql, [citizenId]);
    return (res.rowCount ?? 0) > 0;
  },
};
