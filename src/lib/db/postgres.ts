import { Pool, QueryResultRow } from "pg";
import crypto from "crypto";
import { wardsData } from "@/data/wards";

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

export interface AuthorityUserRecord {
  id: string;
  fullName: string;
  designation: string;
  department: string;
  authorityLevel: "Local Authority" | "Block level" | "District Panchayat" | "District Administration";
  email: string;
  mobileNumber?: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthoritySessionRecord {
  id: string;
  authorityId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface NotificationRecord {
  id: number;
  eventType: string;
  complaintId?: string | null;
  citizenId?: string | null;
  authorityId?: string | null;
  title: string;
  message: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
}

export interface NoticeRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  targetScope: "Entire Municipality" | "Specific Wards";
  targetWards?: string | null;
  priority: "Normal" | "High" | "Urgent";
  isEmergency: boolean;
  status: "Draft" | "Published" | "Archived";
  publishDate: string;
  expiryDate?: string | null;
  issuedById?: string | null;
  issuedByName: string;
  issuedByDepartment: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserRecord {
  id: string;
  username: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSessionRecord {
  id: string;
  adminId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface WardRecord {
  wardNumber: number;
  name: string;
  population: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintCategoryRecord {
  id: string;
  name: string;
  department: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeCategoryRecord {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationSettingRecord {
  tierLevel: string;
  title: string;
  targetAuthority: string;
  slaHours: number;
  nextTier: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettingRecord {
  key: string;
  value: string;
  description: string;
  category: string;
  updatedAt: string;
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

    CREATE TABLE IF NOT EXISTS authority_users (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        authority_level VARCHAR(64) NOT NULL DEFAULT 'Local Authority',
        email VARCHAR(255) NOT NULL UNIQUE,
        mobile_number VARCHAR(15),
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_authority_email ON authority_users(email);
    CREATE INDEX IF NOT EXISTS idx_authority_level ON authority_users(authority_level);

    CREATE TABLE IF NOT EXISTS authority_sessions (
        id VARCHAR(64) PRIMARY KEY,
        authority_id VARCHAR(64) NOT NULL REFERENCES authority_users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_authority_sessions_id ON authority_sessions(authority_id);

    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(64) NOT NULL,
        complaint_id VARCHAR(64) REFERENCES complaints(id) ON DELETE CASCADE,
        citizen_id VARCHAR(64) REFERENCES citizens(id) ON DELETE CASCADE,
        authority_id VARCHAR(64) REFERENCES authority_users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        channel VARCHAR(32) NOT NULL DEFAULT 'in_app',
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_complaint_id ON notifications(complaint_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_citizen_id ON notifications(citizen_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

    CREATE TABLE IF NOT EXISTS notices (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(64) NOT NULL DEFAULT 'Public Notice',
        target_scope VARCHAR(32) NOT NULL DEFAULT 'Entire Municipality',
        target_wards TEXT,
        priority VARCHAR(32) NOT NULL DEFAULT 'Normal',
        is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
        status VARCHAR(32) NOT NULL DEFAULT 'Published',
        publish_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        expiry_date TIMESTAMP WITH TIME ZONE,
        issued_by_id VARCHAR(64) REFERENCES authority_users(id) ON DELETE SET NULL,
        issued_by_name VARCHAR(255) NOT NULL,
        issued_by_department VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
    CREATE INDEX IF NOT EXISTS idx_notices_publish_date ON notices(publish_date DESC);
    CREATE INDEX IF NOT EXISTS idx_notices_is_emergency ON notices(is_emergency);
    CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);

    CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'SYSTEM_ADMIN',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);
    CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);

    CREATE TABLE IF NOT EXISTS admin_sessions (
        id VARCHAR(64) PRIMARY KEY,
        admin_id VARCHAR(64) NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admin_sessions_id ON admin_sessions(admin_id);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

    CREATE TABLE IF NOT EXISTS wards (
        ward_number INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        population INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS complaint_categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notice_categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS escalation_settings (
        tier_level VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        target_authority VARCHAR(255) NOT NULL,
        sla_hours INT NOT NULL,
        next_tier VARCHAR(64),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(128) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        category VARCHAR(64) NOT NULL DEFAULT 'general',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `;

  await pool.query(ddl);
  await seedDefaultAuthorities(pool);
  await seedDefaultNotices(pool);
  await seedDefaultAdmins(pool);
  await seedDefaultWards(pool);
  await seedDefaultComplaintCategories(pool);
  await seedDefaultNoticeCategories(pool);
  await seedDefaultEscalationSettings(pool);
  await seedDefaultSystemSettings(pool);
  tablesInitialized = true;
}

async function seedDefaultAuthorities(pool: Pool) {
  try {
    // Default password hash for 'Authority@Pass2026'
    const defaultPasswordHash = "$2b$10$r4VYCcVRhAzB2y2q88cGUeLDR.zRiIWdjJEbdLdcEAWiH5KSfr1GC";

    const defaultOfficers = [
      {
        id: "OFF-LMC-001",
        fullName: "Sri. Basavaraj Patil",
        designation: "Chief Officer / Commissioner",
        department: "Executive & Municipal Administration",
        authorityLevel: "Local Authority",
        email: "commissioner@lakshmeshwar-tmc.gov.in",
        mobileNumber: "9845012345",
      },
      {
        id: "OFF-LMC-002",
        fullName: "Smt. Sujata Deshmukh",
        designation: "Assistant Executive Engineer",
        department: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
        authorityLevel: "Local Authority",
        email: "aee.water@lakshmeshwar-tmc.gov.in",
        mobileNumber: "9845023456",
      },
      {
        id: "OFF-LMC-003",
        fullName: "Sri. Manjunath Gouda",
        designation: "Senior Health & Sanitation Inspector",
        department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
        authorityLevel: "Local Authority",
        email: "health.sanitation@lakshmeshwar-tmc.gov.in",
        mobileNumber: "9845034567",
      },
      {
        id: "OFF-LMC-004",
        fullName: "Sri. Ramesh Kulkarni",
        designation: "Junior Engineer (Electrical)",
        department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
        authorityLevel: "Local Authority",
        email: "electrical@lakshmeshwar-tmc.gov.in",
        mobileNumber: "9845045678",
      },
      {
        id: "OFF-TALUK-001",
        fullName: "Sri. Anand Hiremath",
        designation: "Taluk Executive Officer (EO)",
        department: "Lakshmeshwar Taluk Panchayat Executive Office",
        authorityLevel: "Block level",
        email: "eo.taluk@lakshmeshwar-tp.gov.in",
        mobileNumber: "9845056789",
      },
      {
        id: "OFF-ZP-001",
        fullName: "Sri. Mallikarjun Swamy",
        designation: "Chief Executive Officer (CEO)",
        department: "Gadag Zilla Panchayat",
        authorityLevel: "District Panchayat",
        email: "ceo.zp@gadag.nic.in",
        mobileNumber: "9845078901",
      },
      {
        id: "OFF-DIST-001",
        fullName: "Dr. Priyadarshini Nayak",
        designation: "Deputy Commissioner & District Magistrate",
        department: "Office of the Deputy Commissioner, Gadag District",
        authorityLevel: "District Administration",
        email: "dc.gadag@karnataka.gov.in",
        mobileNumber: "9845067890",
      },
    ];

    for (const off of defaultOfficers) {
      await pool.query(
        `INSERT INTO authority_users (
          id, full_name, designation, department, authority_level,
          email, mobile_number, password_hash, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;`,
        [
          off.id,
          off.fullName,
          off.designation,
          off.department,
          off.authorityLevel,
          off.email,
          off.mobileNumber,
          defaultPasswordHash,
        ]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default authorities:", err);
  }
}

async function seedDefaultNotices(pool: Pool) {
  try {
    const countRes = await pool.query("SELECT COUNT(*) AS count FROM notices;");
    const count = parseInt(countRes.rows[0]?.count || "0", 10);
    if (count > 0) return;

    const defaultNotices = [
      {
        id: "NOT-LMC-2026-001",
        title: "Special Monsoon Drainage & Silt Clearance Directive",
        description: "Mandatory pre-monsoon desilting of primary and secondary storm water drains across all 23 municipal wards. Ward engineers must complete physical inspections and submit clearance certificates within statutory timelines.",
        category: "Public Works Directive",
        targetScope: "Entire Municipality",
        targetWards: "All Wards (01 - 23)",
        priority: "High",
        isEmergency: false,
        status: "Published",
        issuedById: "OFF-LMC-001",
        issuedByName: "Sri. Basavaraj Patil",
        issuedByDepartment: "Executive & Municipal Administration",
      },
      {
        id: "NOT-LMC-2026-002",
        title: "24-Hour SLA Escalation Protocol for Drinking Water Contamination",
        description: "Emergency gazette circular: Any drinking water pipeline contamination or chlorination defect grievance filed by citizens shall be escalated automatically within 24 hours to the Taluk Executive Officer if unattended.",
        category: "Public Health Order",
        targetScope: "Entire Municipality",
        targetWards: "All Wards (01 - 23)",
        priority: "Urgent",
        isEmergency: true,
        status: "Published",
        issuedById: "OFF-LMC-001",
        issuedByName: "Sri. Basavaraj Patil",
        issuedByDepartment: "Executive & Municipal Administration",
      },
      {
        id: "NOT-LMC-2026-003",
        title: "Ward 03 & Ward 04 Water Supply Interconnection Schedule",
        description: "Scheduled shutdown of main distribution valves from 06:00 AM to 02:00 PM on Friday for pipeline interconnection and digital flow-meter installation. Residents are advised to store adequate drinking water.",
        category: "Water Supply Advisory",
        targetScope: "Specific Wards",
        targetWards: "Ward 03, Ward 04",
        priority: "Normal",
        isEmergency: false,
        status: "Published",
        issuedById: "OFF-LMC-002",
        issuedByName: "Smt. Sujata Deshmukh",
        issuedByDepartment: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
      },
    ];

    for (const n of defaultNotices) {
      await pool.query(
        `INSERT INTO notices (
          id, title, description, category, target_scope, target_wards,
          priority, is_emergency, status, publish_date,
          issued_by_id, issued_by_name, issued_by_department,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;`,
        [
          n.id,
          n.title,
          n.description,
          n.category,
          n.targetScope,
          n.targetWards,
          n.priority,
          n.isEmergency,
          n.status,
          n.issuedById,
          n.issuedByName,
          n.issuedByDepartment,
        ]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default notices:", err);
  }
}

async function seedDefaultAdmins(pool: Pool) {
  try {
    // Development-only fallback hash (for local environment setup/testing).
    // Production deployments must supply INITIAL_ADMIN_PASSWORD_HASH via environment variables.
    const devFallbackHash = "$2b$10$CQ/q4id1DDctw5RttlEAJ.tjetruAk.KRVltwiHnRBo0p0MAUeepi";
    const adminPasswordHash = process.env.INITIAL_ADMIN_PASSWORD_HASH || devFallbackHash;

    const countRes = await pool.query("SELECT COUNT(*) AS count FROM admin_users;");
    const count = parseInt(countRes.rows[0]?.count || "0", 10);
    if (count > 0) {
      // If an explicit environment password hash was supplied, ensure default admin record reflects it
      if (process.env.INITIAL_ADMIN_PASSWORD_HASH) {
        await pool.query(
          "UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 'ADM-LMC-001';",
          [process.env.INITIAL_ADMIN_PASSWORD_HASH]
        );
      }
      return;
    }

    await pool.query(
      `INSERT INTO admin_users (
        id, username, full_name, email, password_hash, role, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO NOTHING;`,
      [
        "ADM-LMC-001",
        "admin",
        "System Administrator, Lakshmeshwar TMC",
        "admin@lakshmeshwar-tmc.gov.in",
        adminPasswordHash,
        "SYSTEM_ADMIN",
      ]
    );
  } catch (err) {
    console.error("Warning: Failed to seed default admin:", err);
  }
}

async function seedDefaultWards(pool: Pool) {
  try {
    const countRes = await pool.query("SELECT COUNT(*) AS count FROM wards;");
    const count = parseInt(countRes.rows[0]?.count || "0", 10);
    if (count > 0) return;

    for (const w of wardsData) {
      await pool.query(
        `INSERT INTO wards (ward_number, name, population, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (ward_number) DO NOTHING;`,
        [w.wardNumber, w.name, w.population]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default wards:", err);
  }
}

async function seedDefaultComplaintCategories(pool: Pool) {
  try {
    const countRes = await pool.query("SELECT COUNT(*) AS count FROM complaint_categories;");
    const count = parseInt(countRes.rows[0]?.count || "0", 10);
    if (count > 0) return;

    const defaultCategories = [
      {
        id: "water",
        name: "Water Supply & Metering",
        department: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
        description: "Pipeline leakages, low water pressure, contaminated supply, meter defects",
      },
      {
        id: "sanitation",
        name: "Solid Waste Management & Sanitation",
        department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
        description: "Garbage collection, overflowing community bins, open dumping, street sweeping",
      },
      {
        id: "streetlighting",
        name: "Street Lighting & Electrical",
        department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
        description: "Defective streetlights, dark stretches, damaged poles, flickering fixtures",
      },
      {
        id: "roads",
        name: "Roads, Footpaths & Drainage",
        department: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
        description: "Potholes, damaged footpaths, clogged stormwater drains, waterlogging",
      },
      {
        id: "health",
        name: "Public Health & Mosquito Control",
        department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
        description: "Stagnant water, mosquito fogging, stray animal management, food hygiene",
      },
      {
        id: "revenue",
        name: "Property Tax & Municipal Revenue",
        department: "Revenue & Property Assessment Section, Lakshmeshwar TMC",
        description: "Khata assessment issues, property tax receipts, municipal ownership verification",
      },
      {
        id: "parks",
        name: "Parks, Trees & Civic Amenities",
        department: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
        description: "Overhanging tree branches, park cleanliness, public toilet maintenance",
      },
      {
        id: "other",
        name: "Other Municipal Grievances",
        department: "Lakshmeshwar TMC Citizen Facilitation Centre",
        description: "General civic issues, town planning, or unlisted municipal services",
      },
    ];

    for (const c of defaultCategories) {
      await pool.query(
        `INSERT INTO complaint_categories (id, name, department, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING;`,
        [c.id, c.name, c.department, c.description]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default complaint categories:", err);
  }
}

async function seedDefaultNoticeCategories(pool: Pool) {
  try {
    const countRes = await pool.query("SELECT COUNT(*) AS count FROM notice_categories;");
    const count = parseInt(countRes.rows[0]?.count || "0", 10);
    if (count > 0) return;

    const defaultCategories = [
      {
        id: "public_notice",
        name: "Public Notice",
        description: "General municipal announcements and citizen advisories",
      },
      {
        id: "public_works",
        name: "Public Works Directive",
        description: "Infrastructure projects, road maintenance and developmental works",
      },
      {
        id: "public_health",
        name: "Public Health Order",
        description: "Sanitation, public hygiene and disease prevention mandates",
      },
      {
        id: "water_advisory",
        name: "Water Supply Advisory",
        description: "Water distribution schedules, maintenance interruptions, and quality notices",
      },
      {
        id: "circular",
        name: "General Circular",
        description: "Administrative rules, tax notices, and regulatory guidelines",
      },
    ];

    for (const c of defaultCategories) {
      await pool.query(
        `INSERT INTO notice_categories (id, name, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING;`,
        [c.id, c.name, c.description]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default notice categories:", err);
  }
}

async function seedDefaultEscalationSettings(pool: Pool) {
  try {
    const countRes = await pool.query("SELECT COUNT(*) AS count FROM escalation_settings;");
    const count = parseInt(countRes.rows[0]?.count || "0", 10);
    if (count > 0) return;

    const defaultSettings = [
      {
        tierLevel: "Local Authority",
        title: "Local Municipal Grievance Cell",
        targetAuthority: "Lakshmeshwar Taluk Panchayat Executive Office",
        slaHours: 48,
        nextTier: "Block level",
      },
      {
        tierLevel: "Block level",
        title: "Taluk Panchayat Executive Oversight",
        targetAuthority: "Gadag Zilla Panchayat Planning & Development Cell",
        slaHours: 72,
        nextTier: "District Panchayat",
      },
      {
        tierLevel: "District Panchayat",
        title: "Zilla Panchayat Appellate Desk",
        targetAuthority: "District Urban Development Cell (DUDC), DC Office, Gadag",
        slaHours: 96,
        nextTier: "District Administration",
      },
      {
        tierLevel: "District Administration",
        title: "Deputy Commissioner & District Magistrate Final Authority",
        targetAuthority: "Office of the Deputy Commissioner, Gadag District",
        slaHours: 0,
        nextTier: null,
      },
    ];

    for (const s of defaultSettings) {
      await pool.query(
        `INSERT INTO escalation_settings (tier_level, title, target_authority, sla_hours, next_tier, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (tier_level) DO NOTHING;`,
        [s.tierLevel, s.title, s.targetAuthority, s.slaHours, s.nextTier]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default escalation settings:", err);
  }
}

async function seedDefaultSystemSettings(pool: Pool) {
  try {
    const countRes = await pool.query("SELECT COUNT(*) AS count FROM system_settings;");
    const count = parseInt(countRes.rows[0]?.count || "0", 10);
    if (count > 0) return;

    const defaultSettings = [
      {
        key: "municipality_name",
        value: "Lakshmeshwar Town Municipal Council (ಪುರಸಭೆ ಲಕ್ಷ್ಮೇಶ್ವರ)",
        description: "Official administrative title of the local government body",
        category: "general",
      },
      {
        key: "municipality_address",
        value: "Town Municipal Council, Near KSRTC Bus Stand, Lakshmeshwar, Gadag District, Karnataka - 582116",
        description: "Official headquarters physical address",
        category: "general",
      },
      {
        key: "contact_email",
        value: "contact@lakshmeshwar-tmc.gov.in",
        description: "Primary citizen grievance email contact",
        category: "contact",
      },
      {
        key: "contact_phone",
        value: "+91 8378 262222",
        description: "Direct administrative contact phone number",
        category: "contact",
      },
      {
        key: "helpline_number",
        value: "1912 / 08378-262222",
        description: "24x7 Municipal Citizen Emergency Helpline",
        category: "contact",
      },
      {
        key: "default_sla_hours",
        value: "72",
        description: "Standard statutory grievance resolution SLA in hours",
        category: "sla",
      },
      {
        key: "maintenance_mode",
        value: "false",
        description: "Portal maintenance lock state ('true' or 'false')",
        category: "system",
      },
      {
        key: "notifications_enabled",
        value: "true",
        description: "Global dispatch of citizen and authority system alerts",
        category: "notifications",
      },
      {
        key: "auto_escalation_enabled",
        value: "true",
        description: "Automatic escalation warning triggers on breached SLAs",
        category: "sla",
      },
      {
        key: "working_hours",
        value: "Monday - Saturday: 10:00 AM - 05:30 PM (2nd & 4th Saturdays Holiday)",
        description: "Official civic office operational timings",
        category: "general",
      },
    ];

    for (const s of defaultSettings) {
      await pool.query(
        `INSERT INTO system_settings (key, value, description, category, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO NOTHING;`,
        [s.key, s.value, s.description, s.category]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default system settings:", err);
  }
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
