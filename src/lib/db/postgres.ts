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

export type NoticeTargetScope =
  | "All citizens"
  | "Specific ward(s)"
  | "Entire municipality"
  | "Emergency / city-wide"
  | "Entire Municipality"
  | "Specific Wards";

export interface NoticeRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  targetScope: NoticeTargetScope;
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

    CREATE TABLE IF NOT EXISTS news_articles (
        id VARCHAR(64) PRIMARY KEY,
        headline VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        summary TEXT NOT NULL,
        article TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Civic Development',
        ward_relevance VARCHAR(255) NOT NULL DEFAULT 'All Wards',
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        author_name VARCHAR(100) NOT NULL DEFAULT 'CivSetu News Desk',
        read_time_minutes INT NOT NULL DEFAULT 3,
        views_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(is_published);
    CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
    CREATE INDEX IF NOT EXISTS idx_news_ward ON news_articles(ward_relevance);

    CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        event_date DATE NOT NULL,
        start_time VARCHAR(32) NOT NULL,
        end_time VARCHAR(32),
        location VARCHAR(255) NOT NULL,
        ward_relevance VARCHAR(100) NOT NULL DEFAULT 'All Wards',
        image_url TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Civic Events',
        organizer VARCHAR(255) NOT NULL,
        is_registration_required BOOLEAN NOT NULL DEFAULT FALSE,
        registration_link TEXT,
        capacity INT,
        registered_count INT NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'Published',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_events_ward ON events(ward_relevance);

    CREATE TABLE IF NOT EXISTS government_schemes (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Social Security & Pensions',
        description TEXT NOT NULL,
        eligibility TEXT NOT NULL,
        documents_required TEXT[] NOT NULL DEFAULT '{}',
        application_process TEXT NOT NULL,
        benefits TEXT NOT NULL,
        deadline VARCHAR(100),
        official_link TEXT,
        contact_info TEXT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_schemes_status ON government_schemes(status);
    CREATE INDEX IF NOT EXISTS idx_schemes_category ON government_schemes(category);
    CREATE INDEX IF NOT EXISTS idx_schemes_department ON government_schemes(department);

    CREATE TABLE IF NOT EXISTS citizen_services (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        department VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        eligibility TEXT NOT NULL,
        required_documents TEXT[] NOT NULL DEFAULT '{}',
        procedure TEXT NOT NULL,
        expected_timeline VARCHAR(100) NOT NULL,
        contact TEXT NOT NULL,
        online_application_link TEXT,
        fee VARCHAR(100),
        status VARCHAR(32) NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_services_status ON citizen_services(status);
    CREATE INDEX IF NOT EXISTS idx_services_category ON citizen_services(category);
    CREATE INDEX IF NOT EXISTS idx_services_department ON citizen_services(department);
  `;

  await pool.query(ddl);
  await seedDefaultAuthorities(pool);
  await seedDefaultNotices(pool);
  await seedDefaultNews(pool);
  await seedDefaultEvents(pool);
  await seedDefaultSchemes(pool);
  await seedDefaultServices(pool);
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
    const defaultNotices = [
      {
        id: "NOT-LMC-2026-001",
        title: "Special Monsoon Drainage & Silt Clearance Directive",
        description: "Mandatory pre-monsoon desilting of primary and secondary storm water drains across all 23 municipal wards. Ward engineers must complete physical inspections and submit clearance certificates within statutory timelines.",
        category: "Municipal Announcements",
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
        title: "EMERGENCY: Flash Flood Alert & Low-Lying Ward Evacuation Preparedness",
        description: "Emergency gazette circular: Heavy rainfall alert issued by IMD for Lakshmeshwar taluk. Residents in low-lying canal embankments are requested to secure belongings. TMC emergency response teams and 24x7 control rooms have been activated.",
        category: "Emergency Alerts",
        targetScope: "Entire Municipality",
        targetWards: "All Wards (Focus on Ward 02, 05, 08)",
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
        category: "Water Supply Announcements",
        targetScope: "Specific Wards",
        targetWards: "Ward 03, Ward 04",
        priority: "High",
        isEmergency: false,
        status: "Published",
        issuedById: "OFF-LMC-002",
        issuedByName: "Smt. Sujata Deshmukh",
        issuedByDepartment: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
      },
      {
        id: "NOT-LMC-2026-004",
        title: "HESCOM 11KV Feeder Line Maintenance & Power Shutdown",
        description: "Scheduled power supply interruption on Saturday from 10:00 AM to 04:00 PM due to HT line replacement and transformer servicing in the Central Bazaar and Fort area. Inconvenience is deeply regretted.",
        category: "Electricity Interruptions",
        targetScope: "Specific Wards",
        targetWards: "Ward 01, Ward 02, Ward 06",
        priority: "Normal",
        isEmergency: false,
        status: "Published",
        issuedById: "OFF-LMC-004",
        issuedByName: "Sri. Ramesh Kulkarni",
        issuedByDepartment: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
      },
      {
        id: "NOT-LMC-2026-005",
        title: "Station Road & Market Square Asphalting and Drain Reconstruction",
        description: "Public Works Section will commence asphalt resurfacing and stormwater drain reconstruction on Station Road. Vehicular traffic will be diverted via Old Bus Stand Road for 5 days. Citizens are requested to cooperate.",
        category: "Road Work",
        targetScope: "Specific Wards",
        targetWards: "Ward 05, Ward 06",
        priority: "High",
        isEmergency: false,
        status: "Published",
        issuedById: "OFF-LMC-001",
        issuedByName: "Sri. Basavaraj Patil",
        issuedByDepartment: "Public Works & Civil Engineering Wing",
      },
      {
        id: "NOT-LMC-2026-006",
        title: "Door-to-Door Source Segregation & Clean City Special Sanitation Drive",
        description: "Special sanitation drive commencing next Monday across all residential wards. Wet and dry waste must be segregated at source. Unsegregated garbage will attract spot fines under the Karnataka Municipalities Act.",
        category: "Sanitation Notices",
        targetScope: "Entire Municipality",
        targetWards: "All Wards (01 - 23)",
        priority: "Normal",
        isEmergency: false,
        status: "Published",
        issuedById: "OFF-LMC-003",
        issuedByName: "Sri. Manjunath Gouda",
        issuedByDepartment: "Health & Solid Waste Management Section",
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
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          target_scope = EXCLUDED.target_scope,
          target_wards = EXCLUDED.target_wards,
          priority = EXCLUDED.priority,
          is_emergency = EXCLUDED.is_emergency;`,
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

async function seedDefaultNews(pool: Pool) {
  try {
    const defaultArticles = [
      {
        id: "NEWS-LMC-2026-001",
        headline: "Lakshmeshwar TMC Commissions Advanced Water Purification & Booster Pumping Facility",
        imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80",
        summary: "A major milestone toward round-the-clock potable water has been achieved with the commissioning of the new automated 2.5 MLD filtration facility near Lakshmeshwar lake.",
        article: `The Lakshmeshwar Town Municipal Council (TMC) has officially inaugurated its flagship water treatment and digital pumping plant. Designed to eliminate drinking water shortages across central and western localities, the facility features multi-stage sand filters, automated chlorination, and real-time turbidity telemetry.

Speaking at the inaugural ceremony, Chief Officer Sri. Basavaraj Patil highlighted that the upgrade will directly benefit over 14,000 residents across Ward 03, Ward 04, and Ward 05. The plant is engineered to operate efficiently even during heavy monsoon runoffs, maintaining BIS 10500 drinking water safety standards.

"Our goal is not merely supply, but clean, safe, and equitably pressurized water for every household," Patil stated. Citizen feedback monitors will track flow pressure at designated tail-end tap connections over the coming weeks.`,
        category: "Civic Development",
        wardRelevance: "Ward 03, Ward 04, Ward 05",
        isPublished: true,
        authorName: "Sri. Basavaraj Patil, TMC Chief Officer",
        readTimeMinutes: 4,
        viewsCount: 142,
      },
      {
        id: "NEWS-LMC-2026-002",
        headline: "Annual Heritage & Cultural Utsav Announced at Historic Someshwara Temple Complex",
        imageUrl: "https://images.unsplash.com/photo-1600100397608-f010f443a6d9?auto=format&fit=crop&w=1200&q=80",
        summary: "Lakshmeshwar's celebrated 11th-century Chalukyan Someshwara temple will host a three-day civic cultural festival featuring classical concerts, folk dances, and traditional handloom showcases.",
        article: `Preparations are in full swing for the annual Lakshmeshwar Cultural Utsav, hosted in the precincts of the revered Someshwara Temple. The three-day cultural extravaganza aims to promote regional heritage, local weavers, and traditional artisans.

The TMC engineering wing has coordinated with the Archaeological Survey of India (ASI) to arrange illumination, temporary eco-toilets, drinking water kiosks, and dedicated park-and-ride shuttle buses from the Old Bus Stand.

"Lakshmeshwar possesses centuries of historical and literary significance, from Pampa to Western Chalukyan architecture," said festival coordinator Smt. Renuka Kulkarni. Over 10,000 visitors are anticipated over the weekend. A zero-plastic policy will be rigorously enforced by municipal marshals.`,
        category: "Community & Culture",
        wardRelevance: "Ward 01, Ward 02",
        isPublished: true,
        authorName: "CivSetu Cultural Desk",
        readTimeMinutes: 3,
        viewsCount: 215,
      },
      {
        id: "NEWS-LMC-2026-003",
        headline: "Lakshmeshwar Launches Zero-Waste Green Ward Model Across Residential Sectors",
        imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
        summary: "TMC introduces decentralized wet-waste composting units and barcode-assisted segregation tracking to transform residential wards into zero-dumping green zones.",
        article: `In a decisive bid to boost Lakshmeshwar's ranking in the upcoming Swachh Survekshan awards, the Health & Sanitation Section has rolled out a community-driven zero-waste program across Wards 06, 07, and 08.

Under the initiative, every participating household is provided with color-coded segregation bins. Municipal sanitation workers use mobile handheld scanners to register doorstep collections, and wet biodegradable waste is composted at local ward compost pits within 48 hours.

"Within thirty days of pilot operations, landfill haulage volume decreased by 38%," reported Senior Health Inspector Sri. Manjunath Gouda. Neighborhoods achieving 95% segregation compliance will receive civic developmental bonus funds for children's parks and street lighting.`,
        category: "Environment",
        wardRelevance: "Ward 06, Ward 07, Ward 08",
        isPublished: true,
        authorName: "Sri. Manjunath Gouda, Senior Health Inspector",
        readTimeMinutes: 4,
        viewsCount: 98,
      },
      {
        id: "NEWS-LMC-2026-004",
        headline: "Modern Digital Library & Civic Youth Innovation Hub Inaugurated in Ward 10",
        imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
        summary: "A state-of-the-art public reading hall featuring 40 computer workstations, high-speed fiber internet, and comprehensive competitive examination resources opens for Lakshmeshwar students.",
        article: `Aspiring youth and competitive exam candidates in Lakshmeshwar now have access to a world-class digital knowledge centre. The newly constructed Digital Library and Study Hall in Ward 10 was formally opened to the public today.

The facility houses more than 5,000 reference books spanning science, history, civil services, banking, and literature, complemented by 40 internet terminals with free access to national digital journals and e-learning platforms.

"Access to quality learning infrastructure shouldn't require our youth to migrate to larger tier-1 cities," noted Council President Smt. Vidya Hosamani during the ribbon-cutting. Membership is completely free for all Lakshmeshwar residents registered on CivSetu.`,
        category: "Education & Youth",
        wardRelevance: "Ward 09, Ward 10, Ward 11",
        isPublished: true,
        authorName: "CivSetu Youth & Education Desk",
        readTimeMinutes: 3,
        viewsCount: 180,
      },
      {
        id: "NEWS-LMC-2026-005",
        headline: "Special Health Drive: Mobile Clinics & Comprehensive Dengue Prevention Across All Wards",
        imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
        summary: "Town Municipal Council deploys two mobile healthcare ambulances and thermal fogging teams across all 23 wards for preventive vector control and free medical screenings.",
        article: `To prevent seasonal monsoon-related vector diseases, the Lakshmeshwar Town Municipal Council, in collaboration with the Taluk Health Office, has initiated a municipality-wide preventive health and sanitation blitz.

Mobile medical vans staffed with physicians and lab technicians will station in two wards each day. Free diagnostic tests for dengue, malaria, hemoglobin, and blood sugar will be administered on the spot, with medications dispensed without charge.

Simultaneously, thermal fogging crews and antilarval oil sprays are being applied to open stormwater conduits, construction sites, and unused plots. Citizens are urged to clear rooftop water stagnations and empty unused flowerpots every Sunday.`,
        category: "Public Health",
        wardRelevance: "All Wards",
        isPublished: true,
        authorName: "Taluk Medical Officer & TMC Health Wing",
        readTimeMinutes: 3,
        viewsCount: 164,
      },
      {
        id: "NEWS-LMC-2026-006",
        headline: "TMC Council Clears ₹4.2 Crore Infrastructure Package for Asphalting & Smart LED Streetlights",
        imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80",
        summary: "Comprehensive capital works grant approved to resurface 18 kilometers of internal arterial roads and install 450 energy-efficient smart solar LED lights throughout Lakshmeshwar.",
        article: `In a landmark general council session, elected ward representatives unanimously greenlit a comprehensive ₹4.2 crore civic capital expenditure package.

The funds will execute hot-mix asphalt macadamization on key transit corridors including Market Road, Hospital Cross, Cotton Market Ring Road, and Fort Approach. Additionally, 450 legacy sodium vapor streetlights will be replaced with centralized smart LEDs equipped with automated twilight sensors and energy metering.

Chief Officer Basavaraj Patil affirmed that citizen grievance data collected through the CivSetu portal was directly utilized to pinpoint chronic pothole spots and dark street stretches. "Every rupee spent is indexed directly to verified citizen needs," he asserted.`,
        category: "Infrastructure",
        wardRelevance: "Entire Municipality",
        isPublished: true,
        authorName: "CivSetu Municipal Affairs Desk",
        readTimeMinutes: 5,
        viewsCount: 320,
      },
    ];

    for (const a of defaultArticles) {
      await pool.query(
        `INSERT INTO news_articles (
          id, headline, image_url, summary, article, category,
          ward_relevance, is_published, published_at, author_name,
          read_time_minutes, views_count, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          headline = EXCLUDED.headline,
          image_url = EXCLUDED.image_url,
          summary = EXCLUDED.summary,
          article = EXCLUDED.article,
          category = EXCLUDED.category,
          ward_relevance = EXCLUDED.ward_relevance,
          is_published = EXCLUDED.is_published;`,
        [
          a.id,
          a.headline,
          a.imageUrl,
          a.summary,
          a.article,
          a.category,
          a.wardRelevance,
          a.isPublished,
          a.authorName,
          a.readTimeMinutes,
          a.viewsCount,
        ]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default news articles:", err);
  }
}

async function seedDefaultEvents(pool: Pool) {
  try {
    const defaultEvents = [
      {
        id: "EVT-LMC-2026-001",
        title: "Lakshmeshwar Someshwara Annual Jatra & Handloom Cultural Mela",
        description: "Historic annual chariot festival and grand cultural evening featuring Carnatic concerts, folk Yakshagana, and handloom exhibitions by local weaver cooperatives.",
        eventDate: "2026-10-18",
        startTime: "08:30 AM",
        endTime: "09:30 PM",
        location: "Historic Someshwara Temple Grounds & Ratha Beedhi, Ward 01",
        wardRelevance: "Ward 01, Ward 02",
        imageUrl: "https://images.unsplash.com/photo-1600100397608-f010f443a6d9?auto=format&fit=crop&w=1200&q=80",
        category: "Festivals",
        organizer: "Lakshmeshwar TMC & Religious Endowments (Muzrai) Department",
        isRegistrationRequired: false,
        registrationLink: null,
        capacity: null,
        status: "Published",
      },
      {
        id: "EVT-LMC-2026-002",
        title: "Open Ward Citizen Sabhe & Town Budget Participatory Meeting",
        description: "Participatory municipal budget consultation where citizens from all 23 wards review capital expenditure allocations for roads, drainage, water supply, and park developments.",
        eventDate: "2026-10-12",
        startTime: "10:30 AM",
        endTime: "01:30 PM",
        location: "TMC Town Hall & Council Chamber, Station Road",
        wardRelevance: "All Wards",
        imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
        category: "Public Meetings",
        organizer: "Office of the Chief Officer, Lakshmeshwar TMC",
        isRegistrationRequired: true,
        registrationLink: "/register",
        capacity: 150,
        status: "Published",
      },
      {
        id: "EVT-LMC-2026-003",
        title: "Swachhata Awareness Marathon & Green Plog Run",
        description: "5-kilometer community plog run to promote waste segregation, cleanliness, and lake conservation. Free T-shirts and eco-friendly finisher medals for participants.",
        eventDate: "2026-10-25",
        startTime: "06:30 AM",
        endTime: "09:00 AM",
        location: "Starts from Mahatma Gandhi Circle to Lakshmeshwar Lake",
        wardRelevance: "Ward 03, Ward 04, Ward 05",
        imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
        category: "Awareness Campaigns",
        organizer: "Health & Sanitation Wing, Lakshmeshwar TMC",
        isRegistrationRequired: true,
        registrationLink: "/register",
        capacity: 300,
        status: "Published",
      },
      {
        id: "EVT-LMC-2026-004",
        title: "State Kannada Rajyotsava Civic Felicitation & Cultural Night",
        description: "Grand civic celebrations with flag hoisting, school cultural performances, and honorary awards presented to distinguished citizens, teachers, and sanitation workers.",
        eventDate: "2026-11-01",
        startTime: "05:30 PM",
        endTime: "10:00 PM",
        location: "Municipal High School Grounds, Ward 09",
        wardRelevance: "All Wards",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
        category: "Cultural Events",
        organizer: "Taluk Administration & Kannada Sahitya Parishat",
        isRegistrationRequired: false,
        registrationLink: null,
        capacity: null,
        status: "Published",
      },
      {
        id: "EVT-LMC-2026-005",
        title: "Door-to-Door Rooftop Rainwater Harvesting Demonstration Workshop",
        description: "Technical demonstration by civil engineers on affordable recharge well installation and ground water replenishment under the Jal Shakti Abhiyan.",
        eventDate: "2026-10-15",
        startTime: "11:00 AM",
        endTime: "02:00 PM",
        location: "Community Hall, Ward 12 (Near APMC Yard)",
        wardRelevance: "Ward 11, Ward 12, Ward 13",
        imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80",
        category: "Civic Events",
        organizer: "Water Supply & Ground Water Section, TMC",
        isRegistrationRequired: false,
        registrationLink: null,
        capacity: 80,
        status: "Published",
      },
      {
        id: "EVT-LMC-2026-006",
        title: "Mega Monsoon Plantation & Tree Adoption Drive",
        description: "Successfully planted 1,200 native saplings along the lake perimeter with community adoption badges given to resident associations.",
        eventDate: "2026-08-15",
        startTime: "08:00 AM",
        endTime: "12:00 PM",
        location: "Lakshmeshwar Lake Bund & Ring Road",
        wardRelevance: "All Wards",
        imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
        category: "Municipal Programs",
        organizer: "Karnataka Forest Department & Lakshmeshwar TMC",
        isRegistrationRequired: false,
        registrationLink: null,
        capacity: null,
        status: "Published",
      },
    ];

    for (const e of defaultEvents) {
      await pool.query(
        `INSERT INTO events (
          id, title, description, event_date, start_time, end_time,
          location, ward_relevance, image_url, category, organizer,
          is_registration_required, registration_link, capacity,
          registered_count, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 0, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          event_date = EXCLUDED.event_date,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          location = EXCLUDED.location,
          ward_relevance = EXCLUDED.ward_relevance,
          image_url = EXCLUDED.image_url,
          category = EXCLUDED.category,
          organizer = EXCLUDED.organizer,
          is_registration_required = EXCLUDED.is_registration_required,
          status = EXCLUDED.status;`,
        [
          e.id,
          e.title,
          e.description,
          e.eventDate,
          e.startTime,
          e.endTime,
          e.location,
          e.wardRelevance,
          e.imageUrl,
          e.category,
          e.organizer,
          e.isRegistrationRequired,
          e.registrationLink,
          e.capacity,
          e.status,
        ]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default events:", err);
  }
}

async function seedDefaultSchemes(pool: Pool) {
  try {
    const defaultSchemes = [
      {
        id: "SCH-LMC-2026-001",
        name: "Pradhan Mantri Awas Yojana - Urban (PMAY-U) Beneficiary Led Construction",
        department: "Housing & Urban Development Department",
        category: "Housing & Urban Development",
        description: "Financial assistance provided by central and state governments to urban Economically Weaker Section (EWS) families to build pucca houses on their own land.",
        eligibility: "Urban households with annual income under ₹3,00,000 having clear title of land without an existing pucca house anywhere in India.",
        documentsRequired: [
          "Aadhaar Card",
          "Ration Card (BPL)",
          "Land Ownership Document (Katha/RTC)",
          "Bank Account Passbook",
          "Income Certificate",
          "Site Photo with Geotag",
        ],
        applicationProcess: "Apply online through Seva Sindhu or submit physical forms at Lakshmeshwar TMC Citizen Service Counter (Room No. 3). Technical engineers verify site within 14 days.",
        benefits: "Direct Bank Transfer (DBT) subsidy of ₹2.5 Lakhs disbursed in four milestone-linked construction stages.",
        deadline: "March 31, 2027",
        officialLink: "https://pmaymis.gov.in",
        contactInfo: "Housing Section, TMC Lakshmeshwar | Helpline: 08378-223456",
        status: "Active",
      },
      {
        id: "SCH-LMC-2026-002",
        name: "Gruha Lakshmi Scheme - Monthly Financial Assistance for Women Heads",
        department: "Women & Child Development Department",
        category: "Women & Child Development",
        description: "Flagship welfare initiative empowering women by providing financial autonomy to female family heads of Antyodaya, BPL, and APL ration cards.",
        eligibility: "Female head of family named on Antyodaya/BPL/APL cards. Neither woman nor husband can be an income tax or GST payer.",
        documentsRequired: [
          "Aadhaar Card of Woman Head",
          "Husband Aadhaar Card",
          "Ration Card",
          "Aadhaar-Linked Bank Account Passbook",
        ],
        applicationProcess: "Submit application at Karnataka One, Grama One centres, or Lakshmeshwar TMC Seva Sindhu facilitation desk. Self-registration via Seva Sindhu portal also available.",
        benefits: "Direct financial grant of ₹2,000 credited every month into the Aadhaar-seeded bank account.",
        deadline: "Ongoing / Open throughout the year",
        officialLink: "https://sevasindhu.karnataka.gov.in",
        contactInfo: "CDPO Office, Taluk Panchayat Lakshmeshwar | Helpline: 1902",
        status: "Active",
      },
      {
        id: "SCH-LMC-2026-003",
        name: "PM-SVANidhi - Micro-Credit Scheme for Urban Street Vendors",
        department: "Directorate of Municipal Administration (DMA)",
        category: "Livelihood & Skill Development",
        description: "Collateral-free working capital loan facility to empower urban street vendors and small traders to resume and expand informal businesses.",
        eligibility: "Street vendors and hawkers operating within Lakshmeshwar TMC town limits possessing TMC Vending Certificate or Town Vending Committee letter of recommendation.",
        documentsRequired: [
          "Aadhaar Card",
          "Voter ID Card",
          "TMC Vending Identity Card / Certificate",
          "Bank Account Details",
        ],
        applicationProcess: "Register on PM SVANidhi portal with assistance from TMC Community Organizers (Room No. 5). Bank sanctions loan within 7 working days.",
        benefits: "Initial working capital loan of ₹10,000; scalable up to ₹20,000 and ₹50,000 on timely repayment with 7% annual interest subsidy.",
        deadline: "December 31, 2026",
        officialLink: "https://pmsvanidhi.mohua.gov.in",
        contactInfo: "Community Affairs Wing, TMC Lakshmeshwar | Phone: 9845034567",
        status: "Active",
      },
      {
        id: "SCH-LMC-2026-004",
        name: "Sandhya Suraksha - Senior Citizen Social Security Pension",
        department: "Revenue Department, Karnataka",
        category: "Social Security & Pensions",
        description: "State social security pension scheme providing dignified financial support to elderly senior citizens who have no adequate means of livelihood.",
        eligibility: "Residents aged 65 years and above with combined annual income of applicant and spouse under ₹20,000.",
        documentsRequired: [
          "Age Proof (Aadhaar / Voter ID)",
          "Income Certificate issued by Tahsildar",
          "Residential Certificate (Domicile)",
          "Bank / Post Office Passbook",
        ],
        applicationProcess: "Apply at Nadakacheri or Atalji Janasnehi Kendra, Taluk Administrative Complex, Lakshmeshwar. Sanctioned within 30 days.",
        benefits: "Monthly pension of ₹1,200 directly deposited to bank or post office savings account.",
        deadline: "Ongoing Scheme",
        officialLink: "https://nadakacheri.karnataka.gov.in",
        contactInfo: "Tahsildar Office, Lakshmeshwar Taluk | Helpline: 08378-220011",
        status: "Active",
      },
      {
        id: "SCH-LMC-2026-005",
        name: "PM Surya Ghar: Muft Bijli Yojana - Rooftop Solar Subsidy",
        department: "Ministry of Housing & Urban Affairs (MoHUA)",
        category: "Sanitation & Clean Energy",
        description: "Central initiative providing substantial capital subsidies to residential households to install grid-connected rooftop solar electricity panels.",
        eligibility: "Any residential house owner with electricity connection in their name from HESCOM and adequate unshaded rooftop area.",
        documentsRequired: [
          "Electricity Consumer Bill (HESCOM)",
          "Aadhaar Card",
          "Property Tax Receipt (TMC)",
          "Bank Account Details",
        ],
        applicationProcess: "Submit application on the National Rooftop Solar portal. HESCOM conducts technical feasibility and installs bi-directional net meter.",
        benefits: "Subsidy of ₹30,000 for 1 kW system, ₹60,000 for 2 kW, and up to ₹78,000 for 3 kW and above. Provides up to 300 units of free power each month.",
        deadline: "March 31, 2027",
        officialLink: "https://pmsuryaghar.gov.in",
        contactInfo: "HESCOM Sub-Division Office, Station Road, Lakshmeshwar | Helpline: 1912",
        status: "Active",
      },
      {
        id: "SCH-LMC-2026-006",
        name: "Vidyasiri - Pre & Post-Matric Student Fee Concession & Hostel Subsidy",
        department: "Social Welfare Department, Karnataka",
        category: "Education & Youth Welfare",
        description: "Educational stipend and hostel fee reimbursement for SC/ST and OBC students pursuing post-matriculation, diploma, degree, and vocational degrees.",
        eligibility: "SC, ST, and backward class students admitted to recognized institutions whose family annual income does not exceed ₹2.5 Lakhs.",
        documentsRequired: [
          "SSLC / College Marks Card",
          "Caste & Income Certificate (RD Number)",
          "Aadhaar Card",
          "Fee Receipt",
          "Bank Passbook with NPCI Aadhaar Mapping",
        ],
        applicationProcess: "Submit online application through the State Scholarship Portal (SSP). College verifies and approves digitally.",
        benefits: "Full tuition fee waiver plus monthly food and accommodation maintenance allowance of ₹1,500.",
        deadline: "November 30, 2026",
        officialLink: "https://ssp.postmatric.karnataka.gov.in",
        contactInfo: "Taluk Social Welfare Office, Mini Vidhana Soudha, Lakshmeshwar | Helpline: 1902",
        status: "Active",
      },
    ];

    for (const s of defaultSchemes) {
      await pool.query(
        `INSERT INTO government_schemes (
          id, name, department, category, description,
          eligibility, documents_required, application_process,
          benefits, deadline, official_link, contact_info,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          department = EXCLUDED.department,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          eligibility = EXCLUDED.eligibility,
          documents_required = EXCLUDED.documents_required,
          application_process = EXCLUDED.application_process,
          benefits = EXCLUDED.benefits,
          deadline = EXCLUDED.deadline,
          official_link = EXCLUDED.official_link,
          contact_info = EXCLUDED.contact_info,
          status = EXCLUDED.status;`,
        [
          s.id,
          s.name,
          s.department,
          s.category,
          s.description,
          s.eligibility,
          s.documentsRequired,
          s.applicationProcess,
          s.benefits,
          s.deadline,
          s.officialLink,
          s.contactInfo,
          s.status,
        ]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default schemes:", err);
  }
}

async function seedDefaultServices(pool: Pool) {
  try {
    const defaultServices = [
      {
        id: "SRV-LMC-WAT-001",
        name: "New Piped Drinking Water Connection",
        category: "Water Services",
        department: "Water Supply & Engineering Section",
        description: "Application for permanent residential or commercial domestic piped tap water supply connection from the Lakshmeshwar Town Municipal Council water distribution network.",
        eligibility: "Any registered property owner or legal tenant within the 23 municipal wards of Lakshmeshwar TMC with valid property tax clearance.",
        requiredDocuments: [
          "Latest Property Tax Paid Receipt",
          "Title Deed / Sale Deed or Khata Extract (Form-3)",
          "Aadhaar Card of Applicant",
          "Passport size photograph",
          "Plumbing pipe route sketch",
        ],
        procedure: "Step 1: Fill out the municipal water application form online or at TMC Janaseva Kendra.\nStep 2: Engineering junior engineer conducts site inspection within 3 days.\nStep 3: Pay connection fee and road cutting charges if applicable.\nStep 4: Certified municipal plumber installs water meter and activates water supply line.",
        expectedTimeline: "7 Working Days",
        contact: "Junior Engineer (Water Supply): 08378-220034 / water@lakshmeshwar-tmc.gov.in",
        onlineApplicationLink: "/applications?service=water",
        fee: "₹500 Application Fee + Meter Caution Deposit",
        status: "Active",
      },
      {
        id: "SRV-LMC-SAN-002",
        name: "Underground Drainage (UGD) Clearance & Desilting",
        category: "Sanitation & Waste Management",
        department: "Public Health & Sanitation Section",
        description: "Service request for unclogging choked underground drainage manholes, desilting roadside storm water drains, or requesting mechanized vacuum suction jetting.",
        eligibility: "Open to all citizens and residential associations residing in any of the 23 Lakshmeshwar wards.",
        requiredDocuments: [
          "Ward Number & Street Landmark Location",
          "Photo of drain blockage / overflow (optional but recommended)",
          "Contact Mobile Number of Resident",
        ],
        procedure: "Step 1: Submit grievance through CivSetu portal or call 24x7 Sanitation Control Desk.\nStep 2: Automated ticket generated and assigned to ward health inspector.\nStep 3: Sanitation jetting machine dispatched to site.\nStep 4: Work completed, digital photo confirmation captured and SMS resolution sent.",
        expectedTimeline: "24 to 48 Hours",
        contact: "Sanitation Health Inspector: 08378-220034 / sanitation@lakshmeshwar-tmc.gov.in",
        onlineApplicationLink: "/complaints/new?category=Sanitation",
        fee: "Free of Cost",
        status: "Active",
      },
      {
        id: "SRV-LMC-PROP-003",
        name: "E-Swathu Khata Extract (Form-3) & Mutation Certificate",
        category: "Property & Khata Services",
        department: "Town Revenue & Khata Department",
        description: "Issuance of certified digital E-Swathu Form-3 property extract, ownership mutation, and bifurcation of property records for registration and bank loans.",
        eligibility: "Legal property owner holding registered conveyance/sale deed, gift deed, or inheritance order within Lakshmeshwar town municipal boundary.",
        requiredDocuments: [
          "Registered Sale Deed / Gift Deed copy",
          "Previous Property Tax Receipts (Up-to-date)",
          "Encumbrance Certificate (EC Form 15) for 13 years",
          "Aadhaar Card of Owner",
          "Latest Site / Building Photo with GPS Coordinates",
        ],
        procedure: "Step 1: Apply online on CivSetu or E-Swathu portal with property PID number.\nStep 2: Upload registered title documents and fee receipt.\nStep 3: Revenue inspector conducts on-field boundary survey and verification.\nStep 4: Chief Officer digitally signs the Form-3 with QR code verification.",
        expectedTimeline: "15 Working Days",
        contact: "Revenue Officer (Khata Section): 08378-220034 / revenue@lakshmeshwar-tmc.gov.in",
        onlineApplicationLink: "https://e-swathu.kar.nic.in",
        fee: "₹125 per certified extract copy",
        status: "Active",
      },
      {
        id: "SRV-LMC-REG-004",
        name: "Official Birth & Death Certificate Issuance & Corrections",
        category: "Birth & Death Registry",
        department: "Civil Registrar of Births & Deaths",
        description: "Registration of vital events occurring within Lakshmeshwar municipal limits and download of digitally certified bilingual (Kannada/English) certificates with government QR seal.",
        eligibility: "Parents, spouse, or legal next of kin for events that occurred within Lakshmeshwar town hospitals, maternity centers, or residences.",
        requiredDocuments: [
          "Hospital Form 1 (Birth) or Form 2 (Death)",
          "Aadhaar Cards of Parents / Deceased",
          "Burial/Cremation Ground Receipt (for death certificates)",
          "Address Proof of Informant",
        ],
        procedure: "Step 1: For institutional events, hospital automatically notifies the registrar within 21 days.\nStep 2: Citizen applies at TMC Janaseva desk or via e-JanMa portal.\nStep 3: Verification of entry in municipal birth/death register.\nStep 4: Immediate issuance of digitally stamped certificate.",
        expectedTimeline: "3 Working Days (Free if registered within 21 days)",
        contact: "Registrar of Births & Deaths: 08378-220034 / registrar@lakshmeshwar-tmc.gov.in",
        onlineApplicationLink: "https://ejanma.karnataka.gov.in",
        fee: "Free within 21 days; ₹50 statutory fee thereafter",
        status: "Active",
      },
      {
        id: "SRV-LMC-CERT-005",
        name: "Commercial Trade License Issuance & Annual Renewal",
        category: "Certificates & Licenses",
        department: "Trade Licensing & Commercial Cell",
        description: "Statutory trade license granting permission to operate commercial, manufacturing, retail, or food establishments under Karnataka Municipalities Act.",
        eligibility: "Any business proprietor, partnership, or enterprise operating a shop, eatery, clinic, or service establishment in Lakshmeshwar.",
        requiredDocuments: [
          "Rental Agreement or Property Tax Receipt of Shop",
          "Aadhaar / PAN Card of Proprietor",
          "FSSAI License (for food establishments)",
          "Fire Safety Clearance (for establishments > 500 sq.ft)",
          "Shop front photo with name board",
        ],
        procedure: "Step 1: Submit trade license application with business category specification.\nStep 2: Health and trade inspector verifies premises, fire safety, and hygiene.\nStep 3: Payment of prescribed annual municipal trade fee.\nStep 4: Certificate generated with verifiable QR code.",
        expectedTimeline: "7 Working Days",
        contact: "Trade License Inspector: 08378-220034 / trade@lakshmeshwar-tmc.gov.in",
        onlineApplicationLink: "/applications?service=trade",
        fee: "₹500 to ₹3,000 depending on trade slab",
        status: "Active",
      },
      {
        id: "SRV-LMC-APP-006",
        name: "Community Hall & Municipal Ground Public Booking",
        category: "Municipal Applications",
        department: "Town Planning & Building Sanction",
        description: "Advance booking of Lakshmeshwar TMC Community Kalyana Mantapa, Town Open Exhibition Grounds, or Sports Pavilion for weddings, exhibitions, and social events.",
        eligibility: "Any citizen or recognized cultural/civic organization resident in Lakshmeshwar.",
        requiredDocuments: [
          "Aadhaar Card of Event Organizer",
          "Residential Proof",
          "Event Undertaking regarding noise & plastic ban compliance",
          "Police Station Intimation Copy",
        ],
        procedure: "Step 1: Check calendar availability online or at TMC reception.\nStep 2: Reserve date and pay refundable cleaning/security deposit.\nStep 3: Verification of booking terms by municipal administrative officer.\nStep 4: Receive allotment permit and gate pass.",
        expectedTimeline: "2 Working Days",
        contact: "Community Estate Officer: 08378-220034 / booking@lakshmeshwar-tmc.gov.in",
        onlineApplicationLink: "/applications?service=hall-booking",
        fee: "₹5,000/day for Kalyana Mantapa + ₹2,000 Refundable Deposit",
        status: "Active",
      },
      {
        id: "SRV-LMC-GRV-007",
        name: "Civic Grievance Redressal with Statutory Escalation",
        category: "Grievance Services",
        department: "Public Grievance Redressal Cell",
        description: "Direct lodging of complaints regarding drinking water shortage, streetlight failure, road potholes, unauthorized construction, or sewage leaks with guaranteed SLA turnaround.",
        eligibility: "Any citizen living in or visiting Lakshmeshwar Town Municipal limits.",
        requiredDocuments: [
          "Ward Number and Street Landmark",
          "Photographic Evidence (Optional)",
          "Active Mobile Number for Tracking Updates",
        ],
        procedure: "Step 1: File complaint online via CivSetu or dial Toll-Free 1912.\nStep 2: Complaint assigned directly to designated Section Officer with countdown SLA.\nStep 3: If unresolved past deadline, automated 4-tier escalation triggers to Tahsildar and Deputy Commissioner.\nStep 4: Citizen reviews resolution photo and gives OTP satisfaction confirmation.",
        expectedTimeline: "24 to 72 Hours depending on category severity",
        contact: "Chief Officer / Grievance Officer: 08378-220034 / complaints@lakshmeshwar-tmc.gov.in",
        onlineApplicationLink: "/complaints/new",
        fee: "Free of Cost",
        status: "Active",
      },
      {
        id: "SRV-LMC-EMG-008",
        name: "24x7 Municipal Disaster Control Room & Emergency Response",
        category: "Emergency Contacts",
        department: "Disaster Management & Control Room",
        description: "Immediate emergency assistance during severe flooding, storm fallen trees, pipeline bursts, wall collapses, and rapid municipal medical rescue coordination.",
        eligibility: "Immediate priority response for all human life, safety, and property emergencies within Lakshmeshwar.",
        requiredDocuments: [
          "No documents required during emergency situations - Call immediate hotline",
        ],
        procedure: "Step 1: Dial 24x7 TMC Municipal Emergency Hotline: 08378-220034 or 112.\nStep 2: Control room operator alerts rapid reaction disaster unit.\nStep 3: Municipal tree cutters, heavy suction pumps, and ambulances deployed on site.\nStep 4: Continuous monitoring until site is secured.",
        expectedTimeline: "Immediate Dispatch (Under 15 Minutes)",
        contact: "TMC 24x7 Emergency Desk: 08378-220034 | State Disaster: 1077 | Fire: 101 | Ambulance: 108",
        onlineApplicationLink: "/contact",
        fee: "Free Emergency Public Service",
        status: "Active",
      },
    ];

    for (const s of defaultServices) {
      await pool.query(
        `INSERT INTO citizen_services (
          id, name, category, department, description,
          eligibility, required_documents, procedure, expected_timeline,
          contact, online_application_link, fee, status,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          department = EXCLUDED.department,
          description = EXCLUDED.description,
          eligibility = EXCLUDED.eligibility,
          required_documents = EXCLUDED.required_documents,
          procedure = EXCLUDED.procedure,
          expected_timeline = EXCLUDED.expected_timeline,
          contact = EXCLUDED.contact,
          online_application_link = EXCLUDED.online_application_link,
          fee = EXCLUDED.fee,
          status = EXCLUDED.status;`,
        [
          s.id,
          s.name,
          s.category,
          s.department,
          s.description,
          s.eligibility,
          s.requiredDocuments,
          s.procedure,
          s.expectedTimeline,
          s.contact,
          s.onlineApplicationLink,
          s.fee,
          s.status,
        ]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default citizen services:", err);
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
    const defaultCategories = [
      {
        id: "water",
        name: "Water Supply & Pipelines",
        department: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
        description: "Pipeline leakages, low water pressure, contaminated supply, meter defects",
      },
      {
        id: "electricity",
        name: "Electricity & Power Supply",
        department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
        description: "Transformer faults, loose overhead power lines, phase failures, voltage fluctuations",
      },
      {
        id: "sanitation",
        name: "Public Sanitation & Hygiene",
        department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
        description: "Public toilet maintenance, open urination spots, market cleanliness drives",
      },
      {
        id: "roads",
        name: "Roads, Potholes & Footpaths",
        department: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
        description: "Potholes, broken asphalt, damaged pavements, curb stone repairs",
      },
      {
        id: "drainage",
        name: "Drainage & Stormwater Culverts",
        department: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
        description: "Clogged stormwater drains, UGD manhole overflows, waterlogging during rains",
      },
      {
        id: "streetlights",
        name: "Streetlights & Dark Stretches",
        department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
        description: "Defective streetlights, dark road stretches, damaged poles, flickering fixtures",
      },
      {
        id: "streetlighting",
        name: "Street Lighting & Electrical",
        department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
        description: "Defective streetlights, dark stretches, damaged poles, flickering fixtures",
      },
      {
        id: "waste",
        name: "Solid Waste & Garbage Disposal",
        department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
        description: "Door-to-door collection skipped, overflowing dustbins, open dumping on vacant sites",
      },
      {
        id: "health",
        name: "Public Health & Mosquito Control",
        department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
        description: "Stagnant water, mosquito fogging, stray animal management, food hygiene",
      },
      {
        id: "public_health",
        name: "Public Health & Epidemic Prevention",
        department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
        description: "Vector control, sanitization of public spaces, infectious disease prevention",
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
        description: "Overhanging tree branches, park cleanliness, public recreational space maintenance",
      },
      {
        id: "other",
        name: "Other Civic Issues & Municipal Grievances",
        department: "Lakshmeshwar TMC Citizen Facilitation Centre",
        description: "General civic issues, town planning, encroachments, or unlisted municipal services",
      },
    ];

    for (const c of defaultCategories) {
      await pool.query(
        `INSERT INTO complaint_categories (id, name, department, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           department = EXCLUDED.department,
           description = EXCLUDED.description;`,
        [c.id, c.name, c.department, c.description]
      );
    }
  } catch (err) {
    console.error("Warning: Failed to seed default complaint categories:", err);
  }
}

async function seedDefaultNoticeCategories(pool: Pool) {
  try {
    const defaultCategories = [
      {
        id: "water_supply",
        name: "Water Supply Announcements",
        description: "Water distribution schedules, maintenance interruptions, and quality notices",
      },
      {
        id: "electricity",
        name: "Electricity Interruptions",
        description: "Power grid shutdowns, transformer maintenance and electrical outages",
      },
      {
        id: "sanitation",
        name: "Sanitation Notices",
        description: "Solid waste collection schedules, fumigation and cleanliness drives",
      },
      {
        id: "road_work",
        name: "Road Work",
        description: "Street repairs, asphalt works, drain construction and traffic diversions",
      },
      {
        id: "emergency",
        name: "Emergency Alerts",
        description: "Severe weather advisories, flood warnings and critical civic alerts",
      },
      {
        id: "municipal",
        name: "Municipal Announcements",
        description: "Official gazette orders, tax deadlines, and citizen notifications",
      },
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
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description;`,
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
