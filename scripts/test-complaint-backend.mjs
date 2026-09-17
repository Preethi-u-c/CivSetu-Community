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

async function runComplaintTests() {
  console.log("================================================================");
  console.log(" CIVSETU CITIZEN COMPLAINT BACKEND VERIFICATION SUITE");
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

  // Citizens test fixtures
  const citizenA = {
    fullName: "Ramesh Patil",
    mobile: "9876522222",
    email: "ramesh.patil@testcivsetu.org",
    password: "Password@Patil123",
    ward: "Ward 03",
    address: "Near Basaveshwara Circle, Lakshmeshwar",
  };

  const citizenB = {
    fullName: "Suresh Gowda",
    mobile: "9876533333",
    email: "suresh.gowda@testcivsetu.org",
    password: "Password@Gowda123",
    ward: "Ward 07",
    address: "Bazaar Road, Lakshmeshwar",
  };

  let cookieA = "";
  let cookieB = "";
  let createdComplaintId = "";

  try {
    // 0. Setup: Clean up any prior test records
    await pool.query("DELETE FROM citizens WHERE mobile_number IN ($1, $2, '9876544444') OR email IN ($3, $4, 'test44@test.org');", [
      citizenA.mobile,
      citizenB.mobile,
      citizenA.email,
      citizenB.email,
    ]);
    console.log("[Setup] Prior test fixtures cleaned up from PostgreSQL.");

    // Helper to register and login a citizen
    async function setupCitizen(cit) {
      // 1. Send OTP
      await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: cit.mobile, purpose: "registration" }),
      });
      // 2. Verify OTP
      await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cit.mobile, otp: "123456", purpose: "registration" }),
      });
      // 3. Register
      const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cit.fullName,
          mobileNumber: cit.mobile,
          email: cit.email,
          password: cit.password,
          confirmPassword: cit.password,
          wardNumber: cit.ward,
          residentialAddress: cit.address,
          otp: "123456",
        }),
      });
      // 4. Login
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cit.mobile, password: cit.password }),
      });
      return loginRes.headers.get("set-cookie") || "";
    }

    console.log("\n[1] Registering and authenticating test citizens A and B...");
    cookieA = await setupCitizen(citizenA);
    assert(!!cookieA, "Citizen A authenticated with session cookie");
    cookieB = await setupCitizen(citizenB);
    assert(!!cookieB, "Citizen B authenticated with session cookie");

    // 2. Unauthenticated Security Checks
    console.log("\n[2] Testing Unauthenticated Access Restrictions...");
    const unauthPost = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test" }),
    });
    assert(unauthPost.status === 401, "POST /api/complaints rejects unauthenticated requests (HTTP 401)");

    const unauthGet = await fetch(`${BASE_URL}/api/complaints`);
    assert(unauthGet.status === 401, "GET /api/complaints rejects unauthenticated requests (HTTP 401)");

    const unauthDetail = await fetch(`${BASE_URL}/api/complaints/CMP-UNKNOWN`);
    assert(unauthDetail.status === 401, "GET /api/complaints/[id] rejects unauthenticated requests (HTTP 401)");

    // 3. Server-side Validation Checks
    console.log("\n[3] Testing Server-side Input Validation...");
    const badCategoryRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({ title: "Valid Title", description: "Long enough description here" }),
    });
    assert(badCategoryRes.status === 400, "POST /api/complaints rejects missing category (HTTP 400)");

    const badTitleRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({ category: "Water", title: "ab", description: "Valid description longer than ten" }),
    });
    assert(badTitleRes.status === 400, "POST /api/complaints rejects short title < 3 chars (HTTP 400)");

    const badDescRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({ category: "Water", title: "Valid Title", description: "Short" }),
    });
    assert(badDescRes.status === 400, "POST /api/complaints rejects short description < 10 chars (HTTP 400)");

    const badCoordRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        category: "Water",
        title: "Valid Title",
        description: "Valid description longer than ten chars",
        latitude: 150, // Invalid lat > 90
      }),
    });
    assert(badCoordRes.status === 400, "POST /api/complaints rejects invalid latitude coordinate (HTTP 400)");

    // 4. Authenticated Complaint Creation (Citizen A)
    console.log("\n[4] Testing Authenticated Complaint Creation...");
    const createRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        category: "Drinking Water & Leakage",
        title: "Major pipeline burst near Basaveshwara Circle",
        description: "Drinking water pipeline has broken open, causing high-pressure water loss across the road.",
        ward: "Ward 03",
        address: "Near Basaveshwara Circle, Lakshmeshwar",
        latitude: 15.1278,
        longitude: 75.4722,
        priority: "High",
      }),
    });
    const createJson = await createRes.json();
    assert(createRes.status === 201, "POST /api/complaints returns 201 Created");
    assert(createJson.success === true, "Complaint created successfully");
    assert(
      typeof createJson.data?.id === "string" && createJson.data.id.startsWith("CMP-LMC-2026-"),
      "Valid Complaint ID generated: " + createJson.data?.id
    );
    assert(createJson.data?.status === "Submitted", "Initial complaint status is 'Submitted'");
    assert(createJson.data?.authorityLevel === "Local Authority", "Initial authority level is 'Local Authority'");
    assert(
      createJson.data?.assignedAuthority.includes("Water Supply"),
      "Auto-assigned to Water Supply section: " + createJson.data?.assignedAuthority
    );
    assert(!!createJson.data?.deadline, "SLA deadline computed: " + createJson.data?.deadline);

    createdComplaintId = createJson.data.id;

    // 5. Citizen Ownership & Detail Retrieval (Citizen A)
    console.log("\n[5] Testing Citizen Detail Retrieval & Ownership...");
    const detailResA = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
      headers: { Cookie: cookieA },
    });
    const detailJsonA = await detailResA.json();
    assert(detailResA.status === 200, "Citizen A can view their own complaint (HTTP 200)");
    assert(detailJsonA.data?.id === createdComplaintId, "Retrieved complaint ID matches");
    assert(detailJsonA.data?.timeline?.length >= 1, "Audit timeline attached with initial registration entry");

    // 6. Security Isolation: Citizen B Cannot Access Citizen A's Complaint
    console.log("\n[6] Testing Citizen Privacy & Cross-Tenant Access Restrictions...");
    const detailResB = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
      headers: { Cookie: cookieB },
    });
    assert(detailResB.status === 403, "Citizen B is FORBIDDEN from viewing Citizen A's complaint (HTTP 403)");

    const timelineResB = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}/timeline`, {
      headers: { Cookie: cookieB },
    });
    assert(timelineResB.status === 403, "Citizen B is FORBIDDEN from viewing Citizen A's timeline (HTTP 403)");

    const patchResB = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieB },
      body: JSON.stringify({ action: "reopen", reason: "Unauthorized attempt" }),
    });
    assert(patchResB.status === 403, "Citizen B is FORBIDDEN from modifying Citizen A's complaint (HTTP 403)");

    // 7. Complaint Listing Isolation
    console.log("\n[7] Testing Complaint Listing Isolation...");
    const listResA = await fetch(`${BASE_URL}/api/complaints`, { headers: { Cookie: cookieA } });
    const listJsonA = await listResA.json();
    assert(listResA.status === 200, "Citizen A listing returns 200");
    assert(listJsonA.total >= 1, "Citizen A listing contains their filed complaint");

    const listResB = await fetch(`${BASE_URL}/api/complaints`, { headers: { Cookie: cookieB } });
    const listJsonB = await listResB.json();
    assert(listResB.status === 200, "Citizen B listing returns 200");
    assert(listJsonB.total === 0, "Citizen B listing is empty (does not leak Citizen A's complaint)");

    // 8. Complaint Timeline API
    console.log("\n[8] Testing Dedicated Timeline API (/api/complaints/[id]/timeline)...");
    const timelineResA = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}/timeline`, {
      headers: { Cookie: cookieA },
    });
    const timelineJsonA = await timelineResA.json();
    assert(timelineResA.status === 200, "GET /api/complaints/[id]/timeline returns 200 OK");
    assert(timelineJsonA.data.length >= 1, "Timeline contains logged audit events");
    assert(timelineJsonA.data[0].action === "Complaint Registered", "Timeline starts with Complaint Registered");

    // 9. Status Transitions & Updates
    console.log("\n[9] Testing Status Transitions & Updates...");
    // 9a. Update to In Progress
    const progressRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        status: "In Progress",
        note: "TMC Junior Engineer dispatched repair crew with replacement valve to site.",
      }),
    });
    const progressJson = await progressRes.json();
    assert(progressRes.status === 200, "Status transition to 'In Progress' returns 200 OK");
    assert(progressJson.data?.status === "In Progress", "Status is now 'In Progress'");

    // 9b. Update to Resolved
    const resolvedRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        status: "Resolved",
        resolutionNotes: "Pipeline joint repaired, tested under normal water pressure, and asphalt restored.",
      }),
    });
    const resolvedJson = await resolvedRes.json();
    assert(resolvedRes.status === 200, "Status transition to 'Resolved' returns 200 OK");
    assert(resolvedJson.data?.status === "Resolved", "Status is now 'Resolved'");
    assert(!!resolvedJson.data?.resolvedAt, "resolvedAt timestamp is recorded");

    // 10. Reopening Complaint Flow
    console.log("\n[10] Testing Reopening Complaint Flow...");
    const reopenRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        action: "reopen",
        reason: "Slight seepage is still visible near the outer joint, needs secondary check.",
      }),
    });
    const reopenJson = await reopenRes.json();
    assert(reopenRes.status === 200, "Citizen reopening returns 200 OK");
    assert(reopenJson.data?.status === "Reopened", "Status updated to 'Reopened'");
    assert(
      reopenJson.data?.reopenedReason.includes("seepage"),
      "Reopen reason recorded in database"
    );

    // 11. Hierarchical Authority Escalation Flow
    console.log("\n[11] Testing Hierarchical Authority Escalation Flow...");
    const escalateRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieA },
      body: JSON.stringify({
        action: "escalate",
        reason: "No response within SLA window, requesting Block Level intervention.",
      }),
    });
    const escalateJson = await escalateRes.json();
    assert(escalateRes.status === 200, "Escalation returns 200 OK");
    assert(escalateJson.data?.status === "Escalated", "Status is now 'Escalated'");
    assert(escalateJson.data?.authorityLevel === "Block level", "Authority level transitioned to 'Block level'");
    assert(
      escalateJson.data?.assignedAuthority.includes("Taluk Panchayat"),
      "Assigned authority updated to Taluk Panchayat: " + escalateJson.data?.assignedAuthority
    );

    // Verify complete audit timeline in PostgreSQL
    const finalTimeline = await fetch(`${BASE_URL}/api/complaints/${createdComplaintId}/timeline`, {
      headers: { Cookie: cookieA },
    });
    const finalTimelineJson = await finalTimeline.json();
    assert(finalTimelineJson.data.length >= 4, "Complete audit trail recorded all status transitions: " + finalTimelineJson.data.length + " events");

    // 12. Logout & Session Invalidation
    console.log("\n[12] Testing Logout & Session Invalidation...");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookieA },
    });
    assert(logoutRes.status === 200, "Logout succeeds");

    const meAfterLogout = await fetch(`${BASE_URL}/api/auth/me`, { headers: { Cookie: cookieA } });
    assert(meAfterLogout.status === 401, "Session invalidated, /api/auth/me returns 401");

    // 13. Cleanup Test Citizens & Complaints (Cascade Deletion)
    console.log("\n[13] Cleaning up test fixtures from PostgreSQL...");
    const cleanupRes = await pool.query(
      "DELETE FROM citizens WHERE mobile_number IN ($1, $2);",
      [citizenA.mobile, citizenB.mobile]
    );
    assert(cleanupRes.rowCount === 2, "Test citizens removed; all linked complaints cascade-deleted");

    console.log("\n================================================================");
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runComplaintTests();
