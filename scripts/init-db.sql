-- =============================================================================
-- CivSetu-Community: PostgreSQL Database Schema Initialization
-- =============================================================================

-- 1. CITIZENS TABLE
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

-- 2. CITIZEN OTPS TABLE (Server-side OTP tracking with attempt limiting & expiration)
CREATE TABLE IF NOT EXISTS citizen_otps (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- mobile number or email
    purpose VARCHAR(32) NOT NULL,     -- 'registration' | 'password_reset'
    otp_hash VARCHAR(255) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otps_identifier_purpose ON citizen_otps(identifier, purpose);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON citizen_otps(expires_at);

-- 3. CITIZEN SESSIONS TABLE (Server-side session management with revocation)
CREATE TABLE IF NOT EXISTS citizen_sessions (
    id VARCHAR(64) PRIMARY KEY,
    citizen_id VARCHAR(64) NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_citizen_id ON citizen_sessions(citizen_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON citizen_sessions(expires_at);

-- 4. CITIZEN COMPLAINTS TABLE
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

-- 5. COMPLAINT TIMELINE / HISTORY AUDIT TABLE
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

-- 6. AUTHORITY USERS TABLE
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

-- 7. AUTHORITY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS authority_sessions (
    id VARCHAR(64) PRIMARY KEY,
    authority_id VARCHAR(64) NOT NULL REFERENCES authority_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_authority_sessions_id ON authority_sessions(authority_id);

-- 8. SYSTEM NOTIFICATIONS TABLE
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

-- 9. GAZETTE & OFFICIAL NOTICES TABLE
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

-- =============================================================================
-- PHASE 6: ADMIN PORTAL TABLES
-- =============================================================================

-- 10. ADMIN USERS TABLE
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

-- 11. ADMIN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(64) PRIMARY KEY,
    admin_id VARCHAR(64) NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- 12. WARDS TABLE
CREATE TABLE IF NOT EXISTS wards (
    ward_number INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    population INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. COMPLAINT CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS complaint_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. NOTICE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS notice_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 15. ESCALATION SETTINGS TABLE
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

-- 16. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(128) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL DEFAULT 'general',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
