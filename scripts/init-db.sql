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
