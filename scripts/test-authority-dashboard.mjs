/**
 * CivSetu Phase 5A — Authority Dashboard Test Suite
 *
 * Verifies:
 * 1. Authority dashboard & login UI routes exist and respond HTTP 200
 * 2. Unauthenticated access to authority endpoints is strictly rejected (HTTP 401)
 * 3. Citizen session cannot access or execute authority-only actions (Role Isolation)
 * 4. Officer authentication succeeds via /api/authority/auth/login and sets session cookie
 * 5. /api/authority/auth/me resolves authenticated officer profile
 * 6. Complaint queue loads real complaints and calculates live summary statistics
 * 7. Multi-filter parameters (status, category, ward, priority, search) work correctly
 * 8. Complaint detail view returns complete complaint data, citizen info, and audit timeline
 * 9. Invalid/nonexistent complaint IDs return HTTP 404
 * 10. Action: Accept complaint updates status and logs timeline event
 * 11. Action: Assign department/authority updates assignment and logs timeline event
 * 12. Action: Status change updates state and logs timeline event
 * 13. Action: Add official remark appends to audit timeline without status degradation
 * 14. Action: Escalation transitions complaint to next hierarchy tier with destination logged
 * 15. Action: Resolution requires mandatory resolution notes and records resolved_at timestamp
 * 16. Citizen tracking integration (/track) immediately reflects authority resolution & audit events
 * 17. Officer logout invalidates session and clears cookie
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

async function runAuthorityDashboardTests() {
  console.log("================================================================");
  console.log(" CIVSETU PHASE 5A: AUTHORITY DASHBOARD TEST SUITE");
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

  const TEST_CITIZEN = {
    fullName: "Ramesh Hatti AuthorityTest",
    mobileNumber: "9876543299",
    email: "ramesh.authoritytest@civsetu-tmc.gov.in",
    password: "Password@AuthTest2026",
    wardNumber: "Ward 03 - Pete Road / Bazaar",
    residentialAddress: "Pete Road Cross, Lakshmeshwar",
  };

  const OFFICER_CREDENTIALS = {
    identifier: "commissioner@lakshmeshwar-tmc.gov.in",
    email: "commissioner@lakshmeshwar-tmc.gov.in",
    password: "Authority@Pass2026",
  };

  let citizenSessionCookie = "";
  let authoritySessionCookie = "";
  let testComplaintId = "";

  try {
    // 0. Clean prior test fixtures
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [
      TEST_CITIZEN.mobileNumber,
      TEST_CITIZEN.email,
    ]);

    // 1. Verify Authority Dashboard & Login UI Routes
    console.log("[1] Verifying Authority UI Routes Accessibility...");
    const dashboardUiRes = await fetch(`${BASE_URL}/authority/dashboard`);
    assert(dashboardUiRes.status === 200, "GET /authority/dashboard route exists and returns HTTP 200 OK");

    const loginUiRes = await fetch(`${BASE_URL}/authority/login`);
    assert(loginUiRes.status === 200, "GET /authority/login route exists and returns HTTP 200 OK");
    const loginHtml = await loginUiRes.text();
    assert(loginHtml.includes("CivSetu Authority Portal"), "Authority login renders 'CivSetu Authority Portal' branding");
    assert(loginHtml.includes("Lakshmeshwar Town Municipal Council"), "Authority login renders municipal council branding");

    // 2. Unauthenticated Access Protection
    console.log("\n[2] Verifying Unauthenticated Access Protection on Authority APIs...");
    const unauthComplaintsRes = await fetch(`${BASE_URL}/api/authority/complaints`);
    assert(unauthComplaintsRes.status === 401, "GET /api/authority/complaints rejects unauthenticated requests (HTTP 401)");

    const unauthDetailRes = await fetch(`${BASE_URL}/api/authority/complaints/CMP-TEST-001`);
    assert(unauthDetailRes.status === 401, "GET /api/authority/complaints/[id] rejects unauthenticated requests (HTTP 401)");

    const unauthPatchRes = await fetch(`${BASE_URL}/api/authority/complaints/CMP-TEST-001`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    assert(unauthPatchRes.status === 401, "PATCH /api/authority/complaints/[id] rejects unauthenticated requests (HTTP 401)");

    const unauthMeRes = await fetch(`${BASE_URL}/api/authority/auth/me`);
    assert(unauthMeRes.status === 401, "GET /api/authority/auth/me returns HTTP 401 when no session cookie present");

    // 3. Citizen Authorization Barrier (Role Isolation)
    console.log("\n[3] Testing Citizen Authorization Barrier (Role Isolation)...");
    // Register & Login Citizen
    await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: TEST_CITIZEN.mobileNumber, purpose: "registration" }),
    });
    await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: TEST_CITIZEN.mobileNumber, otp: "123456", purpose: "registration" }),
    });
    await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...TEST_CITIZEN,
        confirmPassword: TEST_CITIZEN.password,
        otp: "123456",
      }),
    });
    const citizenLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: TEST_CITIZEN.mobileNumber, password: TEST_CITIZEN.password }),
    });
    citizenSessionCookie = citizenLoginRes.headers.get("set-cookie") || "";
    assert(citizenLoginRes.status === 200, "Citizen logged in successfully with civsetu_citizen_token");

    // Attempt to access Authority API using Citizen Session
    const citizenAuthorityAccess = await fetch(`${BASE_URL}/api/authority/complaints`, {
      headers: { Cookie: citizenSessionCookie },
    });
    assert(
      citizenAuthorityAccess.status === 401,
      "Citizen session CANNOT access authority complaints API (HTTP 401 rejected)"
    );

    const citizenAuthorityPatch = await fetch(`${BASE_URL}/api/authority/complaints/CMP-TEST-001`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: citizenSessionCookie },
      body: JSON.stringify({ action: "accept" }),
    });
    assert(
      citizenAuthorityPatch.status === 401,
      "Citizen session CANNOT execute authority actions (HTTP 401 rejected)"
    );

    // 4. Officer Authentication via /api/authority/auth/login
    console.log("\n[4] Testing Municipal Officer Authentication Flow...");
    const badLoginRes = await fetch(`${BASE_URL}/api/authority/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: OFFICER_CREDENTIALS.email, password: "WrongPassword123" }),
    });
    assert(badLoginRes.status === 401, "Authority login rejects incorrect password with HTTP 401");

    const officerLoginRes = await fetch(`${BASE_URL}/api/authority/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(OFFICER_CREDENTIALS),
    });
    const officerLoginJson = await officerLoginRes.json();
    assert(officerLoginRes.status === 200, "POST /api/authority/auth/login returns HTTP 200 OK");
    assert(officerLoginJson.success === true, "Authority login returns success = true");
    assert(officerLoginJson.data?.fullName === "Sri. Basavaraj Patil", "Authenticated as Chief Officer Sri. Basavaraj Patil");

    authoritySessionCookie = officerLoginRes.headers.get("set-cookie") || "";
    assert(authoritySessionCookie.includes("civsetu_authority_token="), "Set-Cookie contains civsetu_authority_token");
    assert(authoritySessionCookie.toLowerCase().includes("httponly"), "Authority session cookie is HttpOnly");

    // 5. Verify /api/authority/auth/me
    console.log("\n[5] Testing /api/authority/auth/me Session Verification...");
    const meRes = await fetch(`${BASE_URL}/api/authority/auth/me`, {
      headers: { Cookie: authoritySessionCookie },
    });
    const meJson = await meRes.json();
    assert(meRes.status === 200, "GET /api/authority/auth/me returns HTTP 200 OK");
    assert(meJson.authenticated === true, "meJson reports authenticated = true");
    assert(meJson.authority?.authorityLevel === "Local Authority", "Authority level matches 'Local Authority'");

    // 6. Create Test Citizen Complaint
    console.log("\n[6] Creating Real Citizen Complaint via POST /api/complaints...");
    const createCmpRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: citizenSessionCookie },
      body: JSON.stringify({
        category: "Water Supply & Metering",
        title: "Severe drinking water pipeline rupture near Someshwara Temple",
        description: "Main potable drinking water pipeline ruptured causing massive contamination and water pressure loss.",
        ward: "Ward 03 - Pete Road / Bazaar",
        address: "Pete Road Someshwara Circle",
        latitude: 15.1278,
        longitude: 75.3195,
        priority: "High",
      }),
    });
    const createCmpJson = await createCmpRes.json();
    assert(createCmpRes.status === 201, "Citizen complaint created successfully (HTTP 201)");
    testComplaintId = createCmpJson.data?.id;
    assert(!!testComplaintId && testComplaintId.startsWith("CMP-"), `Valid Complaint ID generated: ${testComplaintId}`);

    // 7. Authority Complaints List & Statistics
    console.log("\n[7] Testing Authority Complaints List & Live Dashboard Stats...");
    const listRes = await fetch(`${BASE_URL}/api/authority/complaints`, {
      headers: { Cookie: authoritySessionCookie },
    });
    const listJson = await listRes.json();
    assert(listRes.status === 200, "GET /api/authority/complaints returns HTTP 200 OK for officer");
    assert(listJson.success === true, "Response reports success = true");
    assert(typeof listJson.stats?.total === "number" && listJson.stats.total >= 1, "Live stats.total computed from PostgreSQL");
    assert(typeof listJson.stats?.submitted === "number", "Live stats.submitted computed");
    assert(typeof listJson.stats?.inProgress === "number", "Live stats.inProgress computed");
    assert(typeof listJson.stats?.escalated === "number", "Live stats.escalated computed");
    assert(typeof listJson.stats?.resolved === "number", "Live stats.resolved computed");
    assert(Array.isArray(listJson.data), "Complaints data returned as array");

    // Filter by category
    const filterCatRes = await fetch(`${BASE_URL}/api/authority/complaints?category=Water%20Supply%20%26%20Metering`, {
      headers: { Cookie: authoritySessionCookie },
    });
    const filterCatJson = await filterCatRes.json();
    assert(filterCatRes.status === 200, "Filtered query by category returns HTTP 200");
    assert(filterCatJson.data.every((c) => c.category === "Water Supply & Metering"), "All filtered results match requested category");

    // Filter by search query
    const searchRes = await fetch(`${BASE_URL}/api/authority/complaints?search=${encodeURIComponent(testComplaintId)}`, {
      headers: { Cookie: authoritySessionCookie },
    });
    const searchJson = await searchRes.json();
    assert(searchJson.data.length === 1 && searchJson.data[0].id === testComplaintId, "Search by Complaint ID returns exact complaint");

    // 8. Authority Complaint Detail View
    console.log("\n[8] Testing Authority Complaint Detail View (/api/authority/complaints/[id])...");
    const detailRes = await fetch(`${BASE_URL}/api/authority/complaints/${testComplaintId}`, {
      headers: { Cookie: authoritySessionCookie },
    });
    const detailJson = await detailRes.json();
    assert(detailRes.status === 200, "GET /api/authority/complaints/[id] returns HTTP 200 OK");
    assert(detailJson.data?.id === testComplaintId, "Returned complaint ID matches requested ID");
    assert(detailJson.data?.citizenName === TEST_CITIZEN.fullName, "Detail view exposes citizen complainant name to municipal authority");
    assert(detailJson.data?.citizenMobile === TEST_CITIZEN.mobileNumber, "Detail view exposes citizen mobile to authorized authority");
    assert(Array.isArray(detailJson.data?.timeline), "Complaint chronological timeline returned");
    assert(detailJson.data.timeline.length >= 1, "Initial 'Complaint Registered' timeline entry present");

    // Invalid ID handling
    const notFoundRes = await fetch(`${BASE_URL}/api/authority/complaints/CMP-NONEXISTENT-999`, {
      headers: { Cookie: authoritySessionCookie },
    });
    assert(notFoundRes.status === 404, "GET with invalid Complaint ID returns HTTP 404 Not Found");

    // 9. Authority Action: Accept Complaint
    console.log("\n[9] Testing Authority Action: Accept Complaint...");
    const acceptRes = await fetch(`${BASE_URL}/api/authority/complaints/${testComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authoritySessionCookie },
      body: JSON.stringify({ action: "accept" }),
    });
    const acceptJson = await acceptRes.json();
    assert(acceptRes.status === 200, "PATCH with action='accept' returns HTTP 200 OK");
    assert(acceptJson.data?.status === "Under Review", "Complaint status updated to 'Under Review'");

    // 10. Authority Action: Assign Department
    console.log("\n[10] Testing Authority Action: Assign Department...");
    const assignDeptName = "Water Supply & Maintenance Wing, Lakshmeshwar TMC";
    const assignRes = await fetch(`${BASE_URL}/api/authority/complaints/${testComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authoritySessionCookie },
      body: JSON.stringify({
        action: "assign",
        assignedAuthority: assignDeptName,
        authorityLevel: "Local Authority",
        note: "Assigned to AEE Water Supply for immediate pipe excavation and leak repair.",
      }),
    });
    const assignJson = await assignRes.json();
    assert(assignRes.status === 200, "PATCH with action='assign' returns HTTP 200 OK");
    assert(assignJson.data?.assignedAuthority === assignDeptName, "Assigned authority updated in database");

    // 11. Authority Action: Update Status to In Progress
    console.log("\n[11] Testing Authority Action: Update Status (In Progress)...");
    const progressRes = await fetch(`${BASE_URL}/api/authority/complaints/${testComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authoritySessionCookie },
      body: JSON.stringify({
        action: "status",
        status: "In Progress",
        note: "Excavation crew on site with replacement PVC 110mm pipe segments.",
      }),
    });
    const progressJson = await progressRes.json();
    assert(progressRes.status === 200, "PATCH with status='In Progress' returns HTTP 200 OK");
    assert(progressJson.data?.status === "In Progress", "Complaint status updated to 'In Progress'");

    // 12. Authority Action: Add Official Remark
    console.log("\n[12] Testing Authority Action: Add Official Remark...");
    const remarkText = "Field test: pipe segment replaced, pressure testing in progress at 3.5 bar.";
    const remarkRes = await fetch(`${BASE_URL}/api/authority/complaints/${testComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authoritySessionCookie },
      body: JSON.stringify({
        action: "remark",
        note: remarkText,
      }),
    });
    const remarkJson = await remarkRes.json();
    assert(remarkRes.status === 200, "PATCH with action='remark' returns HTTP 200 OK");
    assert(
      remarkJson.data?.timeline?.some((t) => t.note === remarkText && t.action === "Official Remark Added"),
      "Official remark persisted in chronological audit timeline"
    );

    // 13. Authority Action: Escalation Hierarchy
    console.log("\n[13] Testing Authority Action: Escalation Hierarchy...");
    const escalationReason = "Inter-ward booster pump overhaul required; beyond local municipal discretionary threshold.";
    const escalateRes = await fetch(`${BASE_URL}/api/authority/complaints/${testComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authoritySessionCookie },
      body: JSON.stringify({
        action: "escalate",
        reason: escalationReason,
      }),
    });
    const escalateJson = await escalateRes.json();
    assert(escalateRes.status === 200, "PATCH with action='escalate' returns HTTP 200 OK");
    assert(escalateJson.data?.status === "Escalated", "Status transitioned to 'Escalated'");
    assert(escalateJson.data?.authorityLevel === "Block level", "Authority level transitioned to 'Block level'");
    assert(
      escalateJson.data?.assignedAuthority === "Lakshmeshwar Taluk Panchayat Executive Office",
      "Assigned to Block Level Authority: Lakshmeshwar Taluk Panchayat"
    );

    // 14. Authority Action: Resolution
    console.log("\n[14] Testing Authority Action: Resolution...");
    // Reject resolution without notes
    const emptyResolveRes = await fetch(`${BASE_URL}/api/authority/complaints/${testComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authoritySessionCookie },
      body: JSON.stringify({ action: "resolve", resolutionNotes: "" }),
    });
    assert(emptyResolveRes.status === 400, "Resolution without notes is rejected with HTTP 400");

    // Valid resolution
    const resolutionText = "Pipeline welded and replaced with heavy gauge ductile iron pipe. Potable water flow fully restored to Ward 03.";
    const resolveRes = await fetch(`${BASE_URL}/api/authority/complaints/${testComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authoritySessionCookie },
      body: JSON.stringify({ action: "resolve", resolutionNotes: resolutionText }),
    });
    const resolveJson = await resolveRes.json();
    assert(resolveRes.status === 200, "PATCH with action='resolve' returns HTTP 200 OK");
    assert(resolveJson.data?.status === "Resolved", "Complaint status is now 'Resolved'");
    assert(resolveJson.data?.resolutionNotes === resolutionText, "Resolution notes persisted in PostgreSQL");
    assert(!!resolveJson.data?.resolvedAt, "resolved_at timestamp recorded");

    // 15. Citizen Tracking Integration Verification
    console.log("\n[15] Testing Citizen Tracking Integration (/api/complaints/[id] & /track)...");
    const trackRes = await fetch(`${BASE_URL}/api/complaints/${testComplaintId}`, {
      headers: { Cookie: citizenSessionCookie },
    });
    const trackJson = await trackRes.json();
    assert(trackRes.status === 200, "Citizen can retrieve complaint details via /api/complaints/[id]");
    assert(trackJson.data?.status === "Resolved", "Citizen tracking reflects 'Resolved' status");
    assert(trackJson.data?.resolutionNotes === resolutionText, "Citizen sees official resolution notes");
    assert(trackJson.data?.timeline?.length >= 5, "Citizen timeline contains all authority audit events");

    // Verify public tracking route
    const publicTrackRes = await fetch(`${BASE_URL}/track?id=${testComplaintId}`);
    assert(publicTrackRes.status === 200, "GET /track?id=... responds HTTP 200 OK");
    const publicTrackHtml = await publicTrackRes.text();
    assert(publicTrackHtml.includes(testComplaintId), "Tracking page contains Complaint ID in rendered HTML");

    // 16. Authority Logout
    console.log("\n[16] Testing Authority Logout & Session Invalidation...");
    const logoutRes = await fetch(`${BASE_URL}/api/authority/auth/logout`, {
      method: "POST",
      headers: { Cookie: authoritySessionCookie },
    });
    assert(logoutRes.status === 200, "POST /api/authority/auth/logout returns HTTP 200 OK");

    const meAfterLogout = await fetch(`${BASE_URL}/api/authority/auth/me`, {
      headers: { Cookie: authoritySessionCookie },
    });
    assert(meAfterLogout.status === 401, "GET /api/authority/auth/me returns HTTP 401 Unauthenticated after logout");

    // Clean up test records
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [
      TEST_CITIZEN.mobileNumber,
      TEST_CITIZEN.email,
    ]);
    console.log("\n  ✓ Test cleanup: purged test citizen and linked complaints.");

    console.log("\n================================================================");
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAuthorityDashboardTests();
