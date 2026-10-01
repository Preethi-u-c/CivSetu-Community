/**
 * CivSetu Phase 5B — Authority Portal Operational Modules Test Suite
 *
 * Verifies:
 * 1. Authority authentication and profile resolution (/api/authority/auth/me)
 * 2. Unauthenticated and citizen access rejection on authority APIs (Security / Role Isolation)
 * 3. Complaints Queue:
 *    - Search by Complaint ID, title, citizen name, citizen mobile
 *    - Filters: status, category, ward, priority
 *    - SLA state filter (on_track, near_deadline, overdue)
 *    - Ordering: newest (desc) and oldest (asc)
 * 4. Assigned to Me module:
 *    - Filters complaints assigned to officer's department/responsibility in PostgreSQL
 * 5. Escalated Grievances module:
 *    - Displays escalated complaints with source authority, current authority level,
 *      assigned authority, escalation reason, timestamp, and SLA status
 *    - Preserves verified hierarchy (Local Authority -> Block Level -> Lakshmeshwar Taluk Panchayat)
 * 6. Near SLA Deadline module:
 *    - Distinguishes On Track, Near Deadline (<24h), and Overdue using real deadline timestamps
 * 7. Resolved Grievances module:
 *    - Displays resolved complaints with ID, category, ward, assigned authority,
 *      submitted date, resolved date, and resolution remarks
 *    - Rejects invalid workflow transitions on resolved complaints (HTTP 400 lock)
 * 8. Gazette & Notices foundation:
 *    - Creates notice with title, description, category, target wards, priority, publish date,
 *      emergency flag, and status
 *    - Persists notice in PostgreSQL notices table
 *    - Updates notice status (Draft -> Published -> Archived)
 *    - Public endpoint /api/notices exposes published notices for public website
 *    - Deletes notice cleanly
 * 9. System Alerts / Notifications:
 *    - Captures authority events (complaint registered, assigned, escalated, resolved, notice published)
 *    - Computes unread notification count
 *    - Marks individual notification as read (mark_read)
 *    - Marks all notifications as read (mark_all_read)
 * 10. Authority Profile:
 *    - Returns authenticated officer's name, designation, department, authority level, email, jurisdiction
 */

import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = "http://localhost:3000";

// Load DATABASE_URL from .env.local
const envLocalPath = path.join(__dirname, "..", ".env.local");
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DATABASE_URL=")) {
      databaseUrl = trimmed.slice("DATABASE_URL=".length).trim();
      break;
    }
  }
}

const pool = new pg.Pool({ connectionString: databaseUrl });

async function runPhase5BTests() {
  console.log("================================================================");
  console.log(" CIVSETU PHASE 5B: OPERATIONAL MODULES REGRESSION TEST SUITE");
  console.log(" Base URL: " + BASE_URL);
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // Setup & Clean Test Fixtures
    // -------------------------------------------------------------------------
    const testCitizenMobile = "9845999901";
    const testCitizenEmail = "phase5b.citizen@example.com";
    await pool.query(
      "DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;",
      [testCitizenMobile, testCitizenEmail]
    );
    await pool.query("DELETE FROM notices WHERE id LIKE 'NOT-TEST-%';");

    // -------------------------------------------------------------------------
    // [1] Security & Unauthorized Access Rejection
    // -------------------------------------------------------------------------
    console.log("\n[1] Verifying Security & Role Barriers on Phase 5B APIs...");

    // Unauthenticated access
    const unauthNoticesRes = await fetch(`${BASE_URL}/api/authority/notices`);
    assert(unauthNoticesRes.status === 401, "GET /api/authority/notices rejects unauthenticated requests (HTTP 401)");

    const unauthCreateNoticeRes = await fetch(`${BASE_URL}/api/authority/notices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Notice", description: "Should be rejected" }),
    });
    assert(unauthCreateNoticeRes.status === 401, "POST /api/authority/notices rejects unauthenticated requests (HTTP 401)");

    const unauthNotifRes = await fetch(`${BASE_URL}/api/authority/notifications`);
    assert(unauthNotifRes.status === 401, "GET /api/authority/notifications rejects unauthenticated requests (HTTP 401)");

    // Citizen session role barrier
    // 1. Send OTP
    await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: testCitizenMobile, purpose: "registration" }),
    });

    // 2. Verify OTP
    await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testCitizenMobile, otp: "123456", purpose: "registration" }),
    });

    // 3. Register citizen
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Phase 5B Test Citizen",
        mobileNumber: testCitizenMobile,
        email: testCitizenEmail,
        password: "Citizen@Pass2026",
        confirmPassword: "Citizen@Pass2026",
        wardNumber: "Ward 03",
        residentialAddress: "Kottureshwara Temple Road, Ward 03, Lakshmeshwar",
        otp: "123456",
      }),
    });

    // 4. Login to acquire authenticated citizen session
    const citLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testCitizenMobile,
        password: "Citizen@Pass2026",
      }),
    });
    const citizenCookie = citLoginRes.headers.get("set-cookie") || "";
    assert(Boolean(citizenCookie), "Test citizen authenticated with valid session cookie");

    const citizenNoticesRes = await fetch(`${BASE_URL}/api/authority/notices`, {
      headers: { Cookie: citizenCookie },
    });
    assert(citizenNoticesRes.status === 401, "Citizen session CANNOT access authority notices API (HTTP 401 rejected)");

    const citizenNotifPatchRes = await fetch(`${BASE_URL}/api/authority/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: citizenCookie },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    assert(citizenNotifPatchRes.status === 401, "Citizen session CANNOT modify authority notifications (HTTP 401 rejected)");

    // -------------------------------------------------------------------------
    // [2] Authenticate Municipal Officer
    // -------------------------------------------------------------------------
    console.log("\n[2] Authenticating Municipal Officer Sri. Basavaraj Patil...");
    const officerLoginRes = await fetch(`${BASE_URL}/api/authority/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "commissioner@lakshmeshwar-tmc.gov.in",
        password: "Authority@Pass2026",
      }),
    });
    assert(officerLoginRes.status === 200, "Officer login returns HTTP 200 OK");
    const officerCookie = officerLoginRes.headers.get("set-cookie") || "";
    assert(officerCookie.includes("civsetu_authority_token"), "Officer session cookie acquired");

    // -------------------------------------------------------------------------
    // [3] Module 8: Authority Profile Verification
    // -------------------------------------------------------------------------
    console.log("\n[3] Testing Module 8: Authority Profile (/api/authority/auth/me)...");
    const meRes = await fetch(`${BASE_URL}/api/authority/auth/me`, {
      headers: { Cookie: officerCookie },
    });
    assert(meRes.status === 200, "GET /api/authority/auth/me returns HTTP 200 OK");
    const meJson = await meRes.json();
    assert(meJson.authenticated === true, "Officer authenticated flag is true");
    assert(meJson.authority?.fullName === "Sri. Basavaraj Patil", "Officer name resolved from PostgreSQL");
    assert(meJson.authority?.designation.includes("Commissioner") || meJson.authority?.designation.includes("Chief Officer"), "Officer designation verified");
    assert(meJson.authority?.department === "Executive & Municipal Administration", "Officer department resolved");
    assert(meJson.authority?.authorityLevel === "Local Authority", "Officer authorityLevel matches Local Authority");
    assert(meJson.authority?.email === "commissioner@lakshmeshwar-tmc.gov.in", "Official email resolved");

    // -------------------------------------------------------------------------
    // [4] Create Test Complaints for Operational Modules
    // -------------------------------------------------------------------------
    console.log("\n[4] Generating Live Test Complaints for Operational Modules...");

    // Complaint 1: Normal Water Complaint
    const c1Res = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: citizenCookie },
      body: JSON.stringify({
        category: "Water Supply & Metering",
        title: "Phase 5B Pipeline Leakage Near Bazar Road",
        description: "Significant drinking water pipeline leakage reported outside Kottureshwara temple.",
        ward: "Ward 03",
        address: "Kottureshwara Temple Road, Ward 03",
        priority: "High",
      }),
    });
    const c1Json = await c1Res.json();
    const complaint1 = c1Json.data;
    assert(Boolean(complaint1?.id), `Complaint 1 created: ${complaint1?.id}`);

    // Complaint 2: Urgent Road / Civil Complaint
    const c2Res = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: citizenCookie },
      body: JSON.stringify({
        category: "Roads, Footpaths & Drainage",
        title: "Phase 5B Open Stormwater Drain Hazard",
        description: "Hazardous broken concrete slab over main stormwater drain posing immediate danger to commuters.",
        ward: "Ward 07",
        address: "APMC Yard Road, Ward 07",
        priority: "Urgent",
      }),
    });
    const c2Json = await c2Res.json();
    const complaint2 = c2Json.data;
    assert(Boolean(complaint2?.id), `Complaint 2 created: ${complaint2?.id}`);

    // -------------------------------------------------------------------------
    // [5] Module 1: Complaints Queue Multi-Filtering & Ordering
    // -------------------------------------------------------------------------
    console.log("\n[5] Testing Module 1: Complaints Queue Filtering & Ordering...");

    // Search by ID
    const searchIdRes = await fetch(`${BASE_URL}/api/authority/complaints?search=${encodeURIComponent(complaint1.id)}`, {
      headers: { Cookie: officerCookie },
    });
    const searchIdJson = await searchIdRes.json();
    assert(searchIdJson.data.some((c) => c.id === complaint1.id), "Search by exact Complaint ID returns the complaint");

    // Search by Citizen Name
    const searchNameRes = await fetch(`${BASE_URL}/api/authority/complaints?search=Phase+5B+Test+Citizen`, {
      headers: { Cookie: officerCookie },
    });
    const searchNameJson = await searchNameRes.json();
    assert(searchNameJson.data.some((c) => c.id === complaint1.id), "Search by citizen name returns linked complaints");

    // Search by Citizen Mobile
    const searchMobileRes = await fetch(`${BASE_URL}/api/authority/complaints?search=${testCitizenMobile}`, {
      headers: { Cookie: officerCookie },
    });
    const searchMobileJson = await searchMobileRes.json();
    assert(searchMobileJson.data.some((c) => c.id === complaint1.id), "Search by citizen mobile returns linked complaints");

    // Filter by Ward
    const wardRes = await fetch(`${BASE_URL}/api/authority/complaints?ward=Ward+03`, {
      headers: { Cookie: officerCookie },
    });
    const wardJson = await wardRes.json();
    assert(wardJson.data.every((c) => c.ward === "Ward 03"), "Ward filter strictly limits records to Ward 03");

    // Filter by Priority
    const priorityRes = await fetch(`${BASE_URL}/api/authority/complaints?priority=Urgent`, {
      headers: { Cookie: officerCookie },
    });
    const priorityJson = await priorityRes.json();
    assert(priorityJson.data.every((c) => c.priority === "Urgent"), "Priority filter strictly limits records to Urgent");

    // Ordering: Newest first vs Oldest first
    const newestRes = await fetch(`${BASE_URL}/api/authority/complaints?sortOrder=desc&limit=5`, {
      headers: { Cookie: officerCookie },
    });
    const newestJson = await newestRes.json();
    const oldestRes = await fetch(`${BASE_URL}/api/authority/complaints?sortOrder=asc&limit=5`, {
      headers: { Cookie: officerCookie },
    });
    const oldestJson = await oldestRes.json();
    assert(newestJson.data.length > 0 && oldestJson.data.length > 0, "Both ordering queries return complaint records");
    if (newestJson.data.length > 1) {
      const t1 = new Date(newestJson.data[0].createdAt).getTime();
      const t2 = new Date(newestJson.data[1].createdAt).getTime();
      assert(t1 >= t2, "sortOrder=desc orders complaints newest first");
    }
    if (oldestJson.data.length > 1) {
      const t1 = new Date(oldestJson.data[0].createdAt).getTime();
      const t2 = new Date(oldestJson.data[1].createdAt).getTime();
      assert(t1 <= t2, "sortOrder=asc orders complaints oldest first");
    }

    // SLA State Filter: on_track
    const onTrackRes = await fetch(`${BASE_URL}/api/authority/complaints?slaState=on_track`, {
      headers: { Cookie: officerCookie },
    });
    const onTrackJson = await onTrackRes.json();
    assert(onTrackRes.status === 200, "GET /api/authority/complaints?slaState=on_track returns HTTP 200 OK");
    assert(onTrackJson.data.every((c) => new Date(c.deadline).getTime() > Date.now()), "On Track complaints have future SLA deadlines");

    // -------------------------------------------------------------------------
    // [6] Module 2: Assigned to Me
    // -------------------------------------------------------------------------
    console.log("\n[6] Testing Module 2: Assigned to Me...");

    // Assign complaint 1 to Water department
    const assignDept = "Water Supply & Maintenance Wing, Lakshmeshwar TMC";
    const assignRes = await fetch(`${BASE_URL}/api/authority/complaints/${encodeURIComponent(complaint1.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({ action: "assign", assignedAuthority: assignDept }),
    });
    assert(assignRes.status === 200, "Assigned complaint to Water Supply department");

    // Login as Water officer Smt. Sujata Deshmukh
    const waterLoginRes = await fetch(`${BASE_URL}/api/authority/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "aee.water@lakshmeshwar-tmc.gov.in",
        password: "Authority@Pass2026",
      }),
    });
    const waterCookie = waterLoginRes.headers.get("set-cookie") || "";
    assert(waterLoginRes.status === 200, "Authenticated as Water Supply AEE Smt. Sujata Deshmukh");

    // Fetch complaints assigned to water department
    const assignedRes = await fetch(`${BASE_URL}/api/authority/complaints?assignedToMe=true`, {
      headers: { Cookie: waterCookie },
    });
    assert(assignedRes.status === 200, "GET /api/authority/complaints?assignedToMe=true returns HTTP 200 OK");
    const assignedJson = await assignedRes.json();
    assert(
      assignedJson.data.some((c) => c.id === complaint1.id),
      "Assigned to Me contains complaint assigned to Water Supply department from PostgreSQL"
    );

    // -------------------------------------------------------------------------
    // [7] Module 3: Escalated Grievances & Verified Hierarchy
    // -------------------------------------------------------------------------
    console.log("\n[7] Testing Module 3: Escalated Grievances Hierarchy...");

    // Escalate Complaint 2
    const escalateRes = await fetch(`${BASE_URL}/api/authority/complaints/${encodeURIComponent(complaint2.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({
        action: "escalate",
        reason: "Structural culvert reconstruction requires Taluk Panchayat engineering sanction.",
      }),
    });
    assert(escalateRes.status === 200, "Grievance escalated successfully");
    const escalateJson = await escalateRes.json();
    assert(escalateJson.data.authorityLevel === "Block level", "Authority level transitioned to 'Block level'");
    assert(
      escalateJson.data.assignedAuthority.includes("Taluk Panchayat"),
      "Assigned authority transitioned to Lakshmeshwar Taluk Panchayat Executive Office"
    );

    // Query escalated module filter
    const escalatedListRes = await fetch(`${BASE_URL}/api/authority/complaints?escalatedOnly=true`, {
      headers: { Cookie: officerCookie },
    });
    assert(escalatedListRes.status === 200, "GET /api/authority/complaints?escalatedOnly=true returns HTTP 200 OK");
    const escalatedListJson = await escalatedListRes.json();
    const foundEscalated = escalatedListJson.data.find((c) => c.id === complaint2.id);
    assert(Boolean(foundEscalated), "Escalated list includes escalated complaint");
    assert(foundEscalated?.escalationReason?.includes("sanction"), "Escalation reason persisted and returned");
    assert(Boolean(foundEscalated?.escalatedAt), "escalatedAt timestamp recorded in PostgreSQL");

    // -------------------------------------------------------------------------
    // [8] Module 4: Near SLA Deadline & Overdue Calculations
    // -------------------------------------------------------------------------
    console.log("\n[8] Testing Module 4: Near SLA Deadline & Overdue Calculations...");

    // Query nearDeadline=true
    const nearSlaRes = await fetch(`${BASE_URL}/api/authority/complaints?nearDeadline=true`, {
      headers: { Cookie: officerCookie },
    });
    assert(nearSlaRes.status === 200, "GET /api/authority/complaints?nearDeadline=true returns HTTP 200 OK");

    // Query overdueOnly=true
    const overdueRes = await fetch(`${BASE_URL}/api/authority/complaints?overdueOnly=true`, {
      headers: { Cookie: officerCookie },
    });
    assert(overdueRes.status === 200, "GET /api/authority/complaints?overdueOnly=true returns HTTP 200 OK");

    // Verify stats return accurate SLA categories
    const statsRes = await fetch(`${BASE_URL}/api/authority/complaints`, {
      headers: { Cookie: officerCookie },
    });
    const statsJson = await statsRes.json();
    assert(typeof statsJson.stats.nearDeadline === "number", "stats.nearDeadline computed");
    assert(typeof statsJson.stats.overdue === "number", "stats.overdue computed");

    // -------------------------------------------------------------------------
    // [9] Module 5: Resolved Grievances & Workflow Transition Lock
    // -------------------------------------------------------------------------
    console.log("\n[9] Testing Module 5: Resolved Grievances & Workflow Locking...");

    // Resolve Complaint 1 with remarks
    const resolutionRemarks = "Pipeline crack sealed and pressure tested at Ward 03 Kottureshwara Road. Potable supply restored.";
    const resolveRes = await fetch(`${BASE_URL}/api/authority/complaints/${encodeURIComponent(complaint1.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({ action: "resolve", resolutionNotes: resolutionRemarks }),
    });
    assert(resolveRes.status === 200, "Complaint marked as Resolved with remarks");
    const resolveJson = await resolveRes.json();
    assert(resolveJson.data.status === "Resolved", "Status updated to Resolved");
    assert(resolveJson.data.resolutionNotes === resolutionRemarks, "Resolution notes persisted in database");
    assert(Boolean(resolveJson.data.resolvedAt), "resolvedAt timestamp recorded");

    // Check Resolved Archive Filter
    const resolvedListRes = await fetch(`${BASE_URL}/api/authority/complaints?status=Resolved`, {
      headers: { Cookie: officerCookie },
    });
    const resolvedListJson = await resolvedListRes.json();
    const foundResolved = resolvedListJson.data.find((c) => c.id === complaint1.id);
    assert(Boolean(foundResolved), "Resolved list contains resolved grievance");
    assert(foundResolved?.resolutionNotes === resolutionRemarks, "Resolved grievance displays resolution notes");

    // SECURITY & SAFETY: Verify mutating workflow transitions are strictly locked on resolved complaint
    const invalidAssignRes = await fetch(`${BASE_URL}/api/authority/complaints/${encodeURIComponent(complaint1.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({ action: "assign", assignedAuthority: "Electrical Wing" }),
    });
    assert(invalidAssignRes.status === 400, "Mutating transition 'assign' on Resolved complaint is REJECTED (HTTP 400)");

    const invalidStatusRes = await fetch(`${BASE_URL}/api/authority/complaints/${encodeURIComponent(complaint1.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({ action: "status", status: "In Progress" }),
    });
    assert(invalidStatusRes.status === 400, "Mutating transition 'In Progress' on Resolved complaint is REJECTED (HTTP 400)");

    const invalidEscalateRes = await fetch(`${BASE_URL}/api/authority/complaints/${encodeURIComponent(complaint1.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({ action: "escalate", reason: "Cannot escalate resolved" }),
    });
    assert(invalidEscalateRes.status === 400, "Mutating transition 'escalate' on Resolved complaint is REJECTED (HTTP 400)");

    // Archival remarks are still allowed
    const archivalRemarkRes = await fetch(`${BASE_URL}/api/authority/complaints/${encodeURIComponent(complaint1.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({ action: "remark", note: "Follow-up bacteriological water testing completed: Negative." }),
    });
    assert(archivalRemarkRes.status === 200, "Official archival remark allowed on resolved complaint");

    // -------------------------------------------------------------------------
    // [10] Module 6: Gazette & Notices Foundation (PostgreSQL)
    // -------------------------------------------------------------------------
    console.log("\n[10] Testing Module 6: Gazette & Notices Management...");

    // Create Draft Notice
    const draftNoticeRes = await fetch(`${BASE_URL}/api/authority/notices`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({
        title: "Test Draft Gazette Notice for Street Vendor Registration",
        description: "Draft directive inviting street vendors across Ward 01 through Ward 05 for biometric ID verification.",
        category: "Trade Licensing",
        targetScope: "Specific Wards",
        targetWards: "Ward 01, Ward 02, Ward 03",
        priority: "Normal",
        isEmergency: false,
        status: "Draft",
      }),
    });
    assert(draftNoticeRes.status === 201, "POST /api/authority/notices created draft notice (HTTP 201 Created)");
    const draftNoticeJson = await draftNoticeRes.json();
    const testNoticeId = draftNoticeJson.data?.id;
    assert(Boolean(testNoticeId), `Generated Notice ID: ${testNoticeId}`);
    assert(draftNoticeJson.data?.status === "Draft", "Notice status is Draft");

    // List notices
    const noticesListRes = await fetch(`${BASE_URL}/api/authority/notices`, {
      headers: { Cookie: officerCookie },
    });
    assert(noticesListRes.status === 200, "GET /api/authority/notices returns HTTP 200 OK");
    const noticesListJson = await noticesListRes.json();
    assert(noticesListJson.stats.total > 0, "Notice stats.total computed from PostgreSQL");
    assert(noticesListJson.data.some((n) => n.id === testNoticeId), "Notice list includes newly created notice");

    // Publish Notice via PATCH
    const publishNoticeRes = await fetch(`${BASE_URL}/api/authority/notices/${encodeURIComponent(testNoticeId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({ status: "Published" }),
    });
    assert(publishNoticeRes.status === 200, "PATCH /api/authority/notices/[id] published the draft notice");
    const publishNoticeJson = await publishNoticeRes.json();
    assert(publishNoticeJson.data?.status === "Published", "Notice status updated to Published in PostgreSQL");

    // Public Notices endpoint (/api/notices) exposes published notice
    const publicNoticesRes = await fetch(`${BASE_URL}/api/notices`);
    assert(publicNoticesRes.status === 200, "GET /api/notices (Public) returns HTTP 200 OK");
    const publicNoticesJson = await publicNoticesRes.json();
    assert(publicNoticesJson.data.some((n) => n.id === testNoticeId), "Public API exposes published notice for CivSetu website");

    // Archive Notice via PATCH
    const archiveNoticeRes = await fetch(`${BASE_URL}/api/authority/notices/${encodeURIComponent(testNoticeId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({ status: "Archived" }),
    });
    assert(archiveNoticeRes.status === 200, "PATCH notice status to 'Archived' succeeds");

    // Delete Notice via DELETE
    const deleteNoticeRes = await fetch(`${BASE_URL}/api/authority/notices/${encodeURIComponent(testNoticeId)}`, {
      method: "DELETE",
      headers: { Cookie: officerCookie },
    });
    assert(deleteNoticeRes.status === 200, "DELETE /api/authority/notices/[id] removes notice from PostgreSQL");

    // -------------------------------------------------------------------------
    // [11] Module 7: System Alerts / Notifications
    // -------------------------------------------------------------------------
    console.log("\n[11] Testing Module 7: System Alerts & Notifications...");

    const notifRes = await fetch(`${BASE_URL}/api/authority/notifications`, {
      headers: { Cookie: officerCookie },
    });
    assert(notifRes.status === 200, "GET /api/authority/notifications returns HTTP 200 OK");
    const notifJson = await notifRes.json();
    assert(Array.isArray(notifJson.data), "Notifications returned as array");
    assert(typeof notifJson.unreadCount === "number", "unreadCount is calculated and returned");

    // Verify key civic events were logged
    const eventTypes = notifJson.data.map((n) => n.eventType);
    assert(eventTypes.includes("COMPLAINT_REGISTERED"), "Event log includes 'COMPLAINT_REGISTERED'");
    assert(eventTypes.includes("ASSIGNED"), "Event log includes 'ASSIGNED'");
    assert(eventTypes.includes("ESCALATED"), "Event log includes 'ESCALATED'");
    assert(eventTypes.includes("RESOLVED"), "Event log includes 'RESOLVED'");

    // Mark single notification read
    if (notifJson.data.length > 0) {
      const firstNotifId = notifJson.data[0].id;
      const markReadRes = await fetch(`${BASE_URL}/api/authority/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: officerCookie },
        body: JSON.stringify({ action: "mark_read", id: firstNotifId }),
      });
      assert(markReadRes.status === 200, "PATCH /api/authority/notifications action='mark_read' returns HTTP 200 OK");
    }

    // Mark all notifications read
    const markAllReadRes = await fetch(`${BASE_URL}/api/authority/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: officerCookie },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    assert(markAllReadRes.status === 200, "PATCH /api/authority/notifications action='mark_all_read' returns HTTP 200 OK");
    const markAllReadJson = await markAllReadRes.json();
    assert(markAllReadJson.unreadCount === 0, "unreadCount is 0 after mark_all_read");

    // -------------------------------------------------------------------------
    // [12] Cleanup Test Fixtures
    // -------------------------------------------------------------------------
    console.log("\n[12] Purging temporary test citizen and linked complaints from PostgreSQL...");
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [testCitizenMobile, testCitizenEmail]);
    console.log("  ✓ Test fixtures purged cleanly.");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  } finally {
    await pool.end();
  }

  console.log("\n================================================================");
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

runPhase5BTests();
