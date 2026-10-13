# CivSetu Community • ಸಿವ್‌ಸೇತು

CivSetu is an enterprise-grade municipal grievance redressal and civic administration portal built for the **Lakshmeshwar Town Municipal Council (TMC)**, Gadag District, Government of Karnataka.

Citizens can lodge, track, reopen, and escalate civic grievances; authenticated municipal officers review, inspect, assign, remark, escalate, and resolve them; and administrators manage SLAs, departments, authorities, notices, news, events, and audit logs.

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Feature-to-Logic Quick Reference Matrix](#feature-to-logic-quick-reference-matrix)
3. [Detailed Feature Logic Breakdown](#detailed-feature-logic-breakdown)
   - [1. Citizen Authentication & Identity Management](#1-citizen-authentication--identity-management)
   - [2. Grievance Lodging & Multi-Step Intake](#2-grievance-lodging--multi-step-intake)
   - [3. Grievance Tracking & Public Audit Timeline](#3-grievance-tracking--public-audit-timeline)
   - [4. Multi-Tier Escalation Engine & Automated Cron](#4-multi-tier-escalation-engine--automated-cron)
   - [5. Authority Portal & Official Workflow Actions](#5-authority-portal--official-workflow-actions)
   - [6. AI Complaint Assistant & Civic Chatbot ("Ask CivSetu")](#6-ai-complaint-assistant--civic-chatbot-ask-civsetu)
   - [7. Real-Time Event Bus & Notification Engine](#7-real-time-event-bus--notification-engine)
   - [8. Superadmin Portal & Municipal Governance](#8-superadmin-portal--municipal-governance)
   - [9. Civic Services & Service Application Intake](#9-civic-services--service-application-intake)
   - [10. Public Information, Notices, News, Events & Schemes](#10-public-information-notices-news-events--schemes)
   - [11. Interactive Municipal Ward Map & Civic Directory](#11-interactive-municipal-ward-map--civic-directory)
   - [12. Multilingual Localization & Accessibility System](#12-multilingual-localization--accessibility-system)
   - [13. Security, Edge Middleware & Validation Architecture](#13-security-edge-middleware--validation-architecture)
4. [Authority Directory and Escalation Levels](#authority-directory-and-escalation-levels)
   - [Credential Provisioning](#credential-provisioning)
5. [Complaint Notification Flow](#complaint-notification-flow)
6. [Email & Environment Setup](#email--environment-setup)

---

## System Architecture Overview

```mermaid
flowchart TD
    subgraph Citizens ["Citizen Portal (Web & Mobile)"]
        C1["Lodge Grievance<br/>(Voice, Photo, GPS)"]
        C2["Track Status & Timeline<br/>(Live SLA Countdown)"]
        C3["Ask CivSetu AI<br/>(Bilingual Civic Bot)"]
        C4["Apply for Civic Services<br/>(TMC Forms & PDFs)"]
    end

    subgraph Edge ["Next.js App Router & Edge Middleware"]
        MW["CSRF & Origin Guard<br/>Security Headers<br/>Rate Limiting"]
    end

    subgraph Services ["Core Business Logic & Services"]
        AUTH["Auth & Session Service<br/>(Bcrypt, HTTP-Only Cookie)"]
        OTP["OTP Engine<br/>(HMAC SHA-256, Gmail/SMS)"]
        AI["AI Complaint Assistant<br/>(Categorization, Drafting)"]
        ESCALATE["Automated SLA Escalation Engine<br/>(4-Tier Statutory Workflow)"]
        NOTIF["Notification Service<br/>(Email & In-App Alerts)"]
        SSE["Real-Time SSE Event Bus<br/>(Live UI Push Updates)"]
        AUDIT["Immutable Audit Trail<br/>(Officer & Admin Actions)"]
    end

    subgraph Data ["Dual Storage Layer"]
        PG[("PostgreSQL Database<br/>Complaints, Users, SLAs, Audits")]
        JSON[("Local Storage JSON Fallback<br/>Legacy records, Form specs")]
    end

    subgraph Officers ["Municipal Authority & Admin"]
        AUTH_PORTAL["Authority Portal<br/>(Accept, Assign, Escalate, Resolve)"]
        ADMIN_PORTAL["Superadmin Dashboard<br/>(KPIs, Analytics, SLA Matrix, Master CMS)"]
    end

    Citizens --> MW
    MW --> Services
    Officers --> MW
    Services --> PG
    Services --> JSON
```

---

## Feature-to-Logic Quick Reference Matrix

| Feature | Primary Frontend UI / Context | API Route(s) | Business Logic & Service Files | Database Tables / Models |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen Authentication & OTP** | `src/app/login/page.tsx`<br/>`src/app/register/page.tsx`<br/>`src/context/AuthContext.tsx` | `/api/auth/register`<br/>`/api/auth/login`<br/>`/api/auth/send-otp`<br/>`/api/auth/verify-otp`<br/>`/api/auth/logout` | `src/lib/services/authService.ts`<br/>`src/lib/services/otpService.ts` | `citizens`<br/>`citizen_sessions`<br/>`otps` |
| **Complaint Lodging & Intake** | `src/app/complaints/new/page.tsx`<br/>`MunicipalMapPickerModal.tsx`<br/>`VoiceInputButton.tsx` | `POST /api/complaints`<br/>`GET /api/complaint-categories` | `src/lib/db/complaints.ts`<br/>`src/lib/services/notificationService.ts`<br/>`src/lib/services/realtimeEvents.ts` | `complaints`<br/>`complaint_timeline` |
| **Complaint Tracking & Timeline** | `src/app/track/page.tsx`<br/>`src/app/dashboard/page.tsx` | `GET /api/complaints/[id]`<br/>`PATCH /api/complaints/[id]`<br/>`GET /api/complaints/[id]/timeline` | `src/lib/db/complaints.ts`<br/>`src/app/track/page.tsx` (`getSlaInfo`) | `complaints`<br/>`complaint_timeline` |
| **Multi-Tier Escalation Engine** | `src/app/track/page.tsx`<br/>`src/app/admin/escalation-settings/page.tsx` | `GET/POST /api/cron/escalate` | `src/lib/services/escalationEngine.ts`<br/>`src/lib/db/complaints.ts` (`AUTHORITY_WORKFLOW`) | `complaints`<br/>`complaint_timeline`<br/>`system_settings`<br/>`escalation_settings` |
| **Authority Portal & Resolution** | `src/app/authority/login/page.tsx`<br/>`src/app/authority/dashboard/page.tsx` | `POST /api/authority/auth/login`<br/>`GET/PATCH /api/authority/complaints/[id]`<br/>`GET /api/authority/departments` | `src/lib/services/authorityService.ts`<br/>`src/lib/db/authority.ts`<br/>`src/lib/services/auditService.ts` | `authority_users`<br/>`authority_sessions`<br/>`complaints`<br/>`audit_logs` |
| **AI Complaint Assistant & Chat** | `src/components/AI/AskCivSetuModal.tsx`<br/>`src/app/ask-civsetu/page.tsx` | `POST /api/complaints/ai-assist`<br/>`POST /api/ai/chat` | `src/lib/ai/complaint-assistant.ts`<br/>`src/app/api/ai/chat/route.ts` | Stateless / In-memory Rate Limit Cache |
| **Real-Time Push & Email Alerts** | `src/components/Navigation/NotificationBell.tsx`<br/>`src/app/notifications/page.tsx` | `GET /api/realtime/complaints` (SSE)<br/>`GET/PATCH /api/notifications` | `src/lib/services/realtimeEvents.ts`<br/>`src/lib/services/emailNotificationService.ts`<br/>`src/lib/services/notificationService.ts` | `notifications`<br/>Global `EventEmitter` |
| **Superadmin Administration** | `src/app/admin/*`<br/>`src/app/admin/dashboard/page.tsx`<br/>`src/app/admin/analytics/page.tsx` | `/api/admin/dashboard`<br/>`/api/admin/analytics`<br/>`/api/admin/complaints`<br/>`/api/admin/authorities`<br/>`/api/admin/audit-logs` | `src/lib/services/adminService.ts`<br/>`src/lib/db/admin.ts`<br/>`src/lib/services/auditService.ts` | `admin_users`<br/>`admin_sessions`<br/>`audit_logs`<br/>`system_settings` |
| **Civic Services & Applications** | `src/app/services/page.tsx`<br/>`src/app/applications/page.tsx` | `/api/services`<br/>`/api/applications` | `src/lib/db/services.ts`<br/>`src/lib/db/storage.ts`<br/>`src/lib/db/idGenerator.ts` | `services`<br/>`ServiceApplicationRecord` |
| **Notices, News, Events & Schemes** | `src/app/notices/page.tsx`<br/>`src/app/news/page.tsx`<br/>`src/app/events/page.tsx`<br/>`src/app/schemes/page.tsx` | `/api/notices`<br/>`/api/news`<br/>`/api/events`<br/>`/api/schemes` | `src/lib/db/notices.ts`<br/>`src/lib/db/news.ts`<br/>`src/lib/db/events.ts`<br/>`src/lib/db/schemes.ts` | `notices`<br/>`news`<br/>`events`<br/>`schemes` |
| **Interactive Ward Map & Directory** | `src/app/wards/page.tsx`<br/>`src/components/WardMap/*`<br/>`src/app/officials/*` | `/api/wards`<br/>`/api/officials` | `src/data/wards.ts`<br/>`src/data/officials.ts`<br/>`src/data/members.ts` | `wards` in PostgreSQL / Static GeoJSON |
| **Localization & Accessibility** | `src/components/UtilityBar/UtilityBar.tsx`<br/>`src/components/Voice/VoiceInputButton.tsx`<br/>`src/components/UI/IdleTimeoutWarning.tsx` | N/A (Client-Side & Web APIs) | `src/context/AccessibilityContext.tsx`<br/>`src/hooks/useSpeechRecognition.ts`<br/>`src/hooks/useIdleTimeout.ts` | `src/data/translations.ts` |
| **Security & Edge Middleware** | Global Edge Middleware | Root request interception | `src/middleware.ts`<br/>`src/lib/security/rateLimiter.ts`<br/>`src/lib/security/validator.ts` | In-memory sliding window cache |

---

## Detailed Feature Logic Breakdown

### 1. Citizen Authentication & Identity Management

Responsible for citizen onboarding, identity verification, session persistence, and secure recovery.

* **Frontend Layer**:
  - `src/app/register/page.tsx`: Self-registration capturing Full Name, Mobile, Email, Ward Number (1–23), and Residential Address.
  - `src/app/login/page.tsx`: Credential login supporting Mobile/Email and Password or OTP authentication.
  - `src/app/forgot-password/page.tsx`: Step-by-step password recovery workflow.
  - `src/context/AuthContext.tsx`: Client-side React context exposing `citizen`, `isAuthenticated`, and `refreshCitizen()`.
* **API Endpoints**:
  - `POST /api/auth/register`: Validates uniqueness, hashes password, saves record in `citizens`.
  - `POST /api/auth/send-otp`: Dispatches a 6-digit OTP to mobile or email.
  - `POST /api/auth/verify-otp`: Validates entered OTP against the cryptographic hash.
  - `POST /api/auth/login`: Authenticates citizen credentials and creates a session.
  - `GET /api/auth/me`: Validates the `civsetu_citizen_token` cookie and returns current session details.
  - `POST /api/auth/logout`: Destroys the database session and clears the browser cookie.
  - `POST /api/auth/forgot-password` & `POST /api/auth/reset-password`: Manages OTP-verified credential updates.
* **Core Business Logic**:
  - **Password Security**: Implemented in `src/lib/services/authService.ts` using `bcryptjs` with 10 salt rounds (`hashPassword()`, `verifyPassword()`).
  - **Session Management**: Session tokens are persisted in the `citizen_sessions` PostgreSQL table and issued as HTTP-only, `SameSite=Lax` cookies (`civsetu_citizen_token`).
  - **OTP Security Engine**: Implemented in `src/lib/services/otpService.ts`:
    - Generates 6-digit cryptographically secure pseudorandom numbers (`crypto.randomInt`).
    - Hashes OTP with salt using HMAC SHA-256 before database insertion (`hashOtp()`).
    - Enforces 60-second cooldown rate limiting, maximum 3 failed attempts, and a 5-minute expiration window.
    - Sends transactional emails via Gmail SMTP (`sendGmailOtp()`) or SMS via Twilio if configured.

---

### 2. Grievance Lodging & Multi-Step Intake

Responsible for structured grievance capture, validation, departmental routing, and SLA initialization.

* **Frontend Layer**:
  - `src/app/complaints/new/page.tsx`: Two-step intake wizard (Step 1: Details Entry, Step 2: Formal Review & Submit Confirmation).
  - `src/components/Complaints/MunicipalMapPickerModal.tsx`: Interactive Leaflet/OpenStreetMap picker allowing citizens to drop a pin within Lakshmeshwar town boundaries to set exact latitude/longitude coordinates.
  - `src/components/Voice/VoiceInputButton.tsx`: Multilingual speech recognition input supporting Kannada and English dictation.
  - `src/components/AI/AskCivSetuModal.tsx`: AI assistant modal that reformulates unstructured citizen thoughts into municipal-ready complaints.
* **API Endpoints**:
  - `POST /api/complaints`: Primary grievance registration endpoint (strictly binds `citizen_id` from the authenticated session).
  - `GET /api/complaint-categories`: Returns canonical municipal complaint categories and assigned wings.
* **Core Business Logic**:
  - **ID Generation**: Implemented in `complaintDb.generateId()` (`src/lib/db/complaints.ts`). Generates statutory tracking codes formatted as `CMP-LMC-2026-XXXXXX`.
  - **Auto-Departmental Routing**: Implemented in `getDefaultAuthority()` (`src/lib/db/complaints.ts`). Maps grievance categories to responsible municipal sections (e.g., "Water Supply" → Water Supply & Maintenance Wing; "Solid Waste" → Health & Sanitation Section; "Streetlights" → Electrical Wing).
  - **SLA Deadline Calculation**: Implemented in `calculateSlaDeadline()` (`src/lib/db/complaints.ts`). Sets statutory resolution windows according to priority:
    - `Urgent`: 24 Hours
    - `High`: 48 Hours
    - `Medium`: 72 Hours
    - `Low`: 120 Hours
  - **Initial Audit Entry**: Automatically inserts the first milestone into `complaint_timeline` (`Submitted`).
  - **Side Effects**: Dispatches an instant acknowledgment notification and email via `notificationService.notifyComplaintRegistered()` and emits a real-time event via `broadcastRealtimeEvent("complaint_created", ...)`.

---

### 3. Grievance Tracking & Public Audit Timeline

Responsible for transparent status inspection, SLA progress monitoring, and citizen lifecycle actions.

* **Frontend Layer**:
  - `src/app/track/page.tsx`: Public and authenticated grievance tracker.
  - `src/app/dashboard/page.tsx`: Citizen dashboard with status tabs, SLA badges, and real-time updates.
* **API Endpoints**:
  - `GET /api/complaints/[id]`: Fetches complaint record and complete chronological timeline (validates citizen ownership for sensitive data).
  - `PATCH /api/complaints/[id]`: Citizen lifecycle transitions (reopening a resolved grievance, manual escalation request).
* **Core Business Logic**:
  - **SLA Calculation Engine**: Implemented via `getSlaInfo()` in `src/app/track/page.tsx`:
    - Computes elapsed time versus total SLA duration.
    - Calculates remaining hours/minutes until deadline.
    - Detects SLA breaches and triggers visual pulse indicators (`SLA Target Breached: Overdue by X hrs`).
  - **Escalation Stage Mapping**: `getStageIndex()` maps complaint statuses (`SUBMITTED`, `UNDER_REVIEW`, `IN_PROGRESS`, `ESCALATED`, `RESOLVED`) to visual progress bars.
  - **Citizen Reopen Action**: Validates that the complaint is in `Resolved` or `Closed` status, requires a minimum 5-character reason, reverts status to `Reopened`, logs to the timeline, and notifies the assigned officer.

---

### 4. Multi-Tier Escalation Engine & Automated Cron

Responsible for enforcing statutory citizen charter deadlines by automatically advancing unaddressed grievances up the Karnataka municipal administrative chain.

* **Administrative Escalation Chain**:
  ```mermaid
  flowchart LR
      L1["Tier 1: Local Authority<br/>Lakshmeshwar TMC<br/>Chief Officer / JE<br/>(48h SLA)"]
      -->|Overdue| L2["Tier 2: Block Level<br/>Taluk Panchayat<br/>Taluk Executive Officer (EO)<br/>(+72h SLA)"]
      -->|Overdue| L3["Tier 3: District Panchayat<br/>Gadag Zilla Panchayat<br/>Chief Executive Officer (CEO)<br/>(+96h SLA)"]
      -->|Overdue| L4["Tier 4: District Admin<br/>Office of Deputy Commissioner<br/>Deputy Commissioner (DC, Gadag)<br/>(Final Statutory Authority)"]
  ```

* **API Endpoints**:
  - `GET /api/cron/escalate` & `POST /api/cron/escalate`: Automated cron trigger route protected by `CRON_SECRET` authorization bearer headers.
* **Core Business Logic**:
  - **Automated SLA Engine**: Implemented in `runAutoEscalationCheck()` (`src/lib/services/escalationEngine.ts`):
    1. Checks if `auto_escalation_enabled` is active in `system_settings`.
    2. Queries complaints where `status NOT IN ('Resolved', 'Closed')`, `authority_level != 'District Administration'`, and `deadline < CURRENT_TIMESTAMP`.
    3. Looks up next escalation target using `AUTHORITY_WORKFLOW` (`src/lib/db/complaints.ts`).
    4. Advances `authority_level`, sets new default authority, extends SLA deadline by tier-specific hours, and updates status to `Escalated`.
    5. Appends system auto-escalation note into `complaint_timeline`.
    6. Dispatches dual alerts: citizen email/in-app notification via `notificationService.notifyComplaintEscalated()` and urgent action alert to authority officers.

---

### 5. Authority Portal & Official Workflow Actions

Responsible for officer operations, departmental triaging, field remarks, evidence uploads, and complaint resolutions.

* **Frontend Layer**:
  - `src/app/authority/login/page.tsx`: Official login using municipal email and password.
  - `src/app/authority/dashboard/page.tsx`: Department-filtered queues, KPI counters (Pending, In Progress, Escalated, Resolved), modal dialogs for official actions.
* **API Endpoints**:
  - `POST /api/authority/auth/login`: Officer authentication and session creation.
  - `GET /api/authority/auth/me`: Validates officer session and returns role/department.
  - `GET /api/authority/complaints`: Returns grievances matching the officer's department and authority level.
  - `GET /api/authority/complaints/[id]`: Detailed complaint inspection with citizen contact and timeline.
  - `PATCH /api/authority/complaints/[id]`: Official municipal action dispatcher.
* **Core Business Logic**:
  - **Officer Authentication**: Implemented in `src/lib/services/authorityService.ts`. Uses `civsetu_authority_token` HTTP-only cookie with a 7-day lifetime.
  - **Workflow Actions Dispatcher**: Implemented in `PATCH /api/authority/complaints/[id]/route.ts`:
    - `accept`: Transitions ticket to `Under Review`, logs timeline event, notifies citizen.
    - `assign`: Assigns complaint to a specific sub-department or field engineer.
    - `status`: Transitions status (`In Progress`, `Near Deadline`, etc.).
    - `remark`: Logs official progress notes without altering state.
    - `request_info`: Sends clarification request notification to the complainant.
    - `escalate`: Manually transfers complaint to the higher tier with justification.
    - `resolve`: Marks ticket as `Resolved`. **Enforces strict resolution validation**: requires resolution notes (min 5 chars), optional geo-coordinates (`resolutionLatitude`, `resolutionLongitude`), and resolution photo URL proof.
  - **Audit Logging**: Every action is immutably recorded via `auditService.logComplaintAction()` (`src/lib/services/auditService.ts`).

---

### 6. AI Complaint Assistant & Civic Chatbot ("Ask CivSetu")

Responsible for aiding citizens in formulating complaints and providing instant answers regarding municipal services, wards, and processes.

* **Frontend Layer**:
  - `src/components/AI/AskCivSetuModal.tsx`: Complaint drafting assistant embedded directly into `/complaints/new`.
  - `src/app/ask-civsetu/page.tsx`: Standalone conversational civic assistant with suggested prompts and chat history.
* **API Endpoints**:
  - `POST /api/complaints/ai-assist`: Generates complaint titles, descriptions, categories, and missing info checks from citizen rough notes.
  - `POST /api/ai/chat`: Interactive civic Q&A endpoint.
* **Core Business Logic**:
  - **Complaint Drafting Engine**: Implemented in `src/lib/ai/complaint-assistant.ts`:
    - Defines pluggable `ComplaintAssistantProvider` interface.
    - `DeterministicMockAssistantProvider`: Zero-downtime, local keyword-matching provider that maps keywords to `CANONICAL_CATEGORIES`.
    - Formulates descriptions into standard municipal structure: **Issue**, **Impact**, and **Action Requested**.
    - Detects missing critical information (e.g., pole number, meter number, landmark).
  - **Civic Chat Knowledge Base**: Implemented in `src/app/api/ai/chat/route.ts`:
    - In-memory rate limiting (25 queries per minute per IP).
    - Deterministic knowledge base covering Property Tax (Khata), Water Supply schedules, Building Permissions, Trade Licenses, Birth/Death certificates, and 23 Ward details.
    - Multi-language intent parsing supporting English and Kannada.

---

### 7. Real-Time Event Bus & Notification Engine

Responsible for pushing instant status changes to citizen screens and delivering transactional emails.

* **Frontend Layer**:
  - `src/components/Navigation/NotificationBell.tsx`: Navigation bar bell showing real-time unread count and dropdown list.
  - `src/app/notifications/page.tsx`: Full notification center with mark-all-as-read controls.
  - `src/app/dashboard/page.tsx`: Connects to Server-Sent Events (SSE) to update grievance cards in real time without refreshing.
* **API Endpoints**:
  - `GET /api/realtime/complaints`: Long-lived HTTP text/event-stream (SSE) endpoint.
  - `GET /api/notifications` & `PATCH /api/notifications`: In-app notification management.
* **Core Business Logic**:
  - **SSE Event Bus**: Implemented in `src/lib/services/realtimeEvents.ts`:
    - Global Node.js `EventEmitter` singleton surviving Next.js HMR.
    - Broadcasts typed events: `complaint_created`, `complaint_updated`, `complaint_resolved`, `notice_published`.
    - Heartbeat ping interval every 15 seconds to prevent proxy disconnections.
  - **In-App Notification Dispatcher**: Implemented in `src/lib/services/notificationService.ts`. Saves structured events to `notifications` table.
  - **Email Dispatch Service**: Implemented in `src/lib/services/emailNotificationService.ts`:
    - Built on `nodemailer` with Gmail transport (`EMAIL_USER`, `EMAIL_PASS`).
    - Lakshmeshwar TMC branded HTML email templates (`wrapEmailHtml`).
    - Dedicated templates for complaint submission, progress updates, escalation alerts, resolution notifications, and emergency circulars.
    - Gracefully falls back to simulated console logs in local development when email credentials are not set.

---

### 8. Superadmin Portal & Municipal Governance

Responsible for system-wide configuration, KPI analytics, SLA controls, and user management.

* **Frontend Layer**:
  - `src/app/admin/dashboard/page.tsx`: Executive summary with KPI metrics and recent audit stream.
  - `src/app/admin/analytics/page.tsx`: In-depth graphical analytics (status breakdown, ward distribution, SLA compliance).
  - `src/app/admin/complaints/page.tsx`: Master complaint table with filtering, search, and override capabilities.
  - `src/app/admin/authorities/page.tsx`: Authority officer account provisioning and activation.
  - `src/app/admin/citizens/page.tsx`: Citizen user directory and grievance history.
  - `src/app/admin/escalation-settings/page.tsx`: Configuration for statutory SLA hours per tier and department.
  - `src/app/admin/audit-logs/page.tsx`: Chronological immutable system audit log.
* **API Endpoints**:
  - `POST /api/admin/auth/login` & `GET /api/admin/auth/me`: Admin session management.
  - `/api/admin/dashboard` & `/api/admin/analytics`: Aggregated statistical metrics.
  - `/api/admin/complaints`, `/api/admin/authorities`, `/api/admin/citizens`: CRUD master endpoints.
  - `/api/admin/audit-logs`: Audit trail querying.
* **Core Business Logic**:
  - **Admin Authentication**: Implemented in `src/lib/services/adminService.ts`. Issues `civsetu_admin_token` cookie (4-hour duration).
  - **Audit Logging Service**: Implemented in `src/lib/services/auditService.ts` and `src/lib/db/audit.ts`. Logs actor ID, actor role, action name, target type/ID, old state, new state, IP address, and timestamp.

---

### 9. Civic Services & Service Application Intake

Responsible for publishing municipal service citizen charters and enabling service application submissions.

* **Frontend Layer**:
  - `src/app/services/page.tsx` & `src/app/services/[id]/page.tsx`: Catalog of municipal services (Water Connection TMC-W1, Trade License TMC-TL2, Building Permission TMC-BP4, Street Vendor License TMC-PM6, Electricity/Borewell NOC TMC-NOC1, etc.).
  - `src/app/applications/page.tsx`: Citizen service application tracking interface.
  - `public/forms/`: Static official TMC PDF application forms.
* **API Endpoints**:
  - `GET /api/services` & `GET /api/services/[id]`: Fetches service prerequisites, required documents, fees, and SLAs.
  - `GET /api/applications` & `POST /api/applications`: Service application intake and status tracking.
* **Core Business Logic**:
  - **Application ID Generator**: Implemented in `generateApplicationId()` (`src/lib/db/idGenerator.ts`). Generates IDs like `LMC-APP-2026-5001`.
  - **Application Workflow**: Implemented in `src/lib/db/storage.ts` (`ServiceApplicationRecord`), tracking milestones from `SUBMITTED` → `UNDER_VERIFICATION` → `INSPECTION_SCHEDULED` → `APPROVED` / `COMPLETED`.

---

### 10. Public Information, Notices, News, Events & Schemes

Responsible for municipal transparency, gazette publications, civic calendars, and government schemes.

* **Frontend Layer**:
  - `src/app/notices/page.tsx` & `src/app/notices/[slug]/page.tsx`: Public notices, tenders, circulars with category filters and PDF downloads.
  - `src/app/news/page.tsx`: City press releases and civic updates.
  - `src/app/events/page.tsx`: Municipal event calendar (Council meetings, cleanliness drives, health camps).
  - `src/app/schemes/page.tsx`: Central, State, and TMC civic schemes with eligibility criteria and benefits.
  - `src/components/Announcements/EmergencyBanner.tsx`: High-priority municipal alert banner rendered atop all pages.
  - `src/app/feedback/page.tsx`: Citizen suggestion box generating `LMC-FB-YYYY-XXXX` records.
* **API Endpoints**:
  - `/api/notices`, `/api/news`, `/api/events`, `/api/schemes`, `/api/feedback`.
* **Core Business Logic**:
  - Managed in `src/lib/db/notices.ts`, `src/lib/db/news.ts`, `src/lib/db/events.ts`, `src/lib/db/schemes.ts`, and `src/lib/db/storage.ts`.
  - Supports pinned notices (`isPinned`), draft vs. published state (`isPublished`), and bilingual text storage (English and Kannada).

---

### 11. Interactive Municipal Ward Map & Civic Directory

Responsible for geographic representation of Lakshmeshwar's 23 municipal wards and publishing elected representative profiles.

* **Frontend Layer**:
  - `src/app/wards/page.tsx`: Interactive 23-ward directory.
  - `src/components/WardMap/WardMapSection.tsx` & `WardMapAndInfoContainer.tsx`: SVG vector map with hover effects, demographic inspection, and councillor information.
  - `src/app/officials/[slug]/page.tsx` & `src/app/members/page.tsx`: Profiles of Chief Officer, President, Standing Committee chairs, and ward councillors.
* **API Endpoints**:
  - `GET /api/wards`: Returns ward metadata (boundaries, landmarks, population, councillor).
  - `GET /api/officials`: Returns municipal leadership directory.
* **Core Business Logic**:
  - Powered by canonical datasets in `src/data/wards.ts`, `src/data/officials.ts`, and `src/data/members.ts`, with database synchronization via `src/lib/db/admin.ts`.

---

### 12. Multilingual Localization & Accessibility System

Responsible for universal access across Kannada and English, voice navigation, high-contrast display, and session protection.

* **Frontend Layer**:
  - `src/components/UtilityBar/UtilityBar.tsx`: Top bar controls for language (`EN` / `KN`), text size (`A-`, `A`, `A+`), theme (Dark / Light), and screen reader toggle.
  - `src/components/Voice/VoiceInputButton.tsx`: Speech dictation button embedded into forms.
  - `src/components/UI/IdleTimeoutWarning.tsx`: Inactivity warning modal with countdown timer.
* **Core Business Logic & Hooks**:
  - **Language & Accessibility Context**: `src/context/AccessibilityContext.tsx`:
    - Persists language choice in `localStorage`.
    - Dynamically toggles Tailwind root classes (`dark`, `text-scale-sm`, `text-scale-lg`).
    - Provides bilingual translation lookup dictionary `t` from `src/data/translations.ts`.
  - **Speech Recognition Hook**: `src/hooks/useSpeechRecognition.ts`:
    - Utilizes Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
    - Maps selected language to BCP 47 tags (`kn-IN` for Kannada, `en-IN` for English).
    - Delivers real-time interim and final transcripts.
  - **Idle Inactivity Hook**: `src/hooks/useIdleTimeout.ts`:
    - Monitors user interaction events (`mousemove`, `keydown`, `click`, `scroll`, `touchstart`).
    - Uses `requestAnimationFrame` for throttled event tracking.
    - Warns user before session expiry and triggers automatic logout on timeout.

---

### 13. Security, Edge Middleware & Validation Architecture

Responsible for protecting endpoints against CSRF, injection, brute-force attacks, and data corruption.

* **Core Logic Modules**:
  - **Edge Middleware** (`src/middleware.ts`):
    - Rejects cross-origin data-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) by comparing request origin with host URL.
    - Sets strict HTTP security headers:
      - `X-Content-Type-Options: nosniff`
      - `X-Frame-Options: DENY`
      - `Referrer-Policy: strict-origin-when-cross-origin`
      - `Permissions-Policy: camera=(self), geolocation=(self), microphone=(self)`
      - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production)
  - **Rate Limiter** (`src/lib/security/rateLimiter.ts`):
    - In-memory sliding-window limiter checking request timestamps per IP or user key.
    - Returns `isAllowed`, remaining quota, and `Retry-After` reset seconds.
  - **Input Sanitizer & Validator** (`src/lib/security/validator.ts`):
    - `sanitizeString()`: Strips script tags and converts dangerous HTML characters to entities to prevent Cross-Site Scripting (XSS).
    - `isValidComplaintId()`: Validates tracking ID formats.
    - `validateWard()`: Validates input against TMC Wards 1 through 23.

---

## Authority directory and escalation levels

| Level | Authority / department | Officer role | Account email |
| --- | --- | --- | --- |
| Local Authority | Executive & Municipal Administration, Lakshmeshwar TMC | Chief Officer / Commissioner | `commissioner@lakshmeshwar-tmc.gov.in` |
| Local Authority | Water Supply & Maintenance Wing, Lakshmeshwar TMC | Assistant Executive Engineer | `aee.water@lakshmeshwar-tmc.gov.in` |
| Local Authority | Health & Solid Waste Management Section, Lakshmeshwar TMC | Senior Health & Sanitation Inspector | `health.sanitation@lakshmeshwar-tmc.gov.in` |
| Local Authority | Electrical & Streetlighting Wing, Lakshmeshwar TMC | Junior Engineer (Electrical) | `electrical@lakshmeshwar-tmc.gov.in` |
| Block level | Lakshmeshwar Taluk Panchayat Executive Office | Taluk Executive Officer | `eo.taluk@lakshmeshwar-tp.gov.in` |
| District Panchayat | Gadag Zilla Panchayat | Chief Executive Officer | `ceo.zp@gadag.nic.in` |
| District Administration | Office of the Deputy Commissioner, Gadag District | Deputy Commissioner & District Magistrate | `dc.gadag@karnataka.gov.in` |

Authority accounts are accessed at `/authority/dashboard`. Passwords and password hashes are intentionally not stored in this repository or this README. Provision or reset them through the administrator-controlled account process and keep them in a password manager or secret manager.

### Credential provisioning

1. An administrator creates or activates the authority account using the officer's official email address.
2. The administrator delivers a unique temporary password to the officer through a secure, separate channel (for example, an approved password manager or verified official contact).
3. The officer signs in at `/authority/dashboard` and changes the temporary password immediately.
4. Lost or compromised credentials must be reset or deactivated by an administrator; they must never be sent in email, chat, tickets, screenshots, or repository files.

Every authority account must have a unique password. Do not reuse citizen, administrator, database, SMTP, API, or other service credentials for an authority account.

---

## Complaint notification flow

When a citizen lodges a complaint, the portal records the citizen who owns it and sends notifications only to that citizen's registered email address. The citizen receives an in-app notification, a real-time update, and an email for:

- submission and acknowledgement;
- under review, assignment, in-progress, near-deadline, reopened, and other status updates;
- an officer's remark or request for additional information;
- escalation to each next authority level; and
- resolution, including the resolution notes.

The escalation chain is Local Authority → Block level → District Panchayat → District Administration. Every action appears in the complaint timeline.

---

## Email & Environment Setup

Set the following environment variables in a local, untracked `.env.local` file or deployment secret manager:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/civsetu"

# Authentication & Security
AUTH_SECRET="your-cryptographic-salt-and-jwt-secret"
CRON_SECRET="your-cron-endpoint-bearer-token"

# Email Notifications (Nodemailer Gmail SMTP)
EMAIL_USER="your-official-email@gmail.com"
EMAIL_PASS="your-16-character-gmail-app-password"

# Base Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional SMS Gateway (Twilio)
TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1XXXXXXXXXX"
```

> **Note**: When `EMAIL_USER` and `EMAIL_PASS` are absent, CivSetu automatically logs simulated email dispatches to the server console for rapid, zero-dependency local development.
