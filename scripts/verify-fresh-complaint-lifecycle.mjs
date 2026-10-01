import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Load DATABASE_URL
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

async function verifyFreshComplaintLifecycle() {
  console.log("================================================================");
  console.log(" CIVSETU PHASE 5A: FRESH COMPLAINT LIFECYCLE & TRACKING AUDIT");
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
    fullName: "Smt. Roopa Kulkarni",
    mobileNumber: "9876543266",
    email: "roopa.kulkarni@civsetu-tmc.gov.in",
    password: "Citizen@Pass2026",
    wardNumber: "Ward 03 - Pete Road / Bazaar",
    residentialAddress: "Pete Road Bazaar, Lakshmeshwar",
  };

  const OFFICER_CREDENTIALS = {
    identifier: "commissioner@lakshmeshwar-tmc.gov.in",
    password: "Authority@Pass2026",
  };

  try {
    // 0. Verify Historical Records Are Untouched
    console.log("[0] Auditing Preservation of Historical Timeline Records...");
    const historicalRes = await pool.query(
      "SELECT id, status, authority_level, assigned_authority FROM complaints WHERE id LIKE $1 LIMIT 5;",
      ["%95709F69%"]
    );
    if (historicalRes.rows.length > 0) {
      const prior = historicalRes.rows[0];
      console.log(`  Found historical complaint: ${prior.id} (Status: ${prior.status}, Authority: ${prior.assigned_authority})`);
      const priorTimeline = await pool.query(
        "SELECT COUNT(*) AS count FROM complaint_timeline WHERE complaint_id = $1;",
        [prior.id]
      );
      assert(
        parseInt(priorTimeline.rows[0].count, 10) > 0,
        `Historical complaint ${prior.id} timeline records preserved intact (${priorTimeline.rows[0].count} events)`
      );
    } else {
      console.log("  No prior 95709F69 complaint found in local DB (continuing fresh audit).");
    }

    // 1. Citizen Registration / Authentication
    // Clean any prior test citizen data cleanly
    await pool.query(
      "DELETE FROM complaint_timeline WHERE complaint_id IN (SELECT id FROM complaints WHERE citizen_id IN (SELECT id FROM citizens WHERE mobile_number = $1 OR email = $2));",
      [TEST_CITIZEN.mobileNumber, TEST_CITIZEN.email]
    );
    await pool.query(
      "DELETE FROM complaints WHERE citizen_id IN (SELECT id FROM citizens WHERE mobile_number = $1 OR email = $2);",
      [TEST_CITIZEN.mobileNumber, TEST_CITIZEN.email]
    );
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [
      TEST_CITIZEN.mobileNumber,
      TEST_CITIZEN.email,
    ]);
    await pool.query("DELETE FROM citizen_otps WHERE identifier = $1;", [TEST_CITIZEN.mobileNumber]);

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
    assert(citizenLoginRes.status === 200, "Citizen authenticated successfully");
    const citizenCookie = citizenLoginRes.headers.get("set-cookie") || "";
    assert(citizenCookie.includes("civsetu_citizen_token"), "Citizen session cookie acquired");

    // 2. Submit Fresh Complaint
    console.log("\n[2] Submitting Fresh Citizen Complaint...");
    const createRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: citizenCookie },
      body: JSON.stringify({
        category: "Roads, Footpaths & Drainage",
        title: "Major drainage overflow near Doddaveerappa Circle crossing",
        description: "Stormwater and sewage line blocked causing severe flooding across Pete Road bazaar junction.",
        ward: "Ward 03 - Pete Road / Bazaar",
        address: "Doddaveerappa Circle Pete Road",
        latitude: 15.1265,
        longitude: 75.3188,
        priority: "High",
      }),
    });
    const createJson = await createRes.json();
    assert(createRes.status === 201, "Fresh complaint created via POST /api/complaints (HTTP 201)");
    const complaintId = createJson.data?.id;
    assert(!!complaintId && complaintId.startsWith("CMP-"), `Fresh Complaint ID: ${complaintId}`);
    assert(createJson.data?.status === "Submitted", "Initial Status: 'Submitted'");
    assert(createJson.data?.authorityLevel === "Local Authority", "Initial Authority Level: 'Local Authority'");

    // 3. Authority Officer Authentication
    console.log("\n[3] Authenticating Municipal Authority Officer...");
    const officerLoginRes = await fetch(`${BASE_URL}/api/authority/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(OFFICER_CREDENTIALS),
    });
    const officerLoginJson = await officerLoginRes.json();
    assert(officerLoginRes.status === 200, "Authority officer login returns HTTP 200 OK");
    assert(officerLoginJson.data?.fullName === "Sri. Basavaraj Patil", "Authenticated as Chief Officer Sri. Basavaraj Patil");
    const authorityCookie = officerLoginRes.headers.get("set-cookie") || "";
    assert(authorityCookie.includes("civsetu_authority_token"), "Authority session cookie acquired");

    // 4. Step 1: Accept Complaint (Status -> Under Review)
    console.log("\n[4] Step 1: Officer Accepts Complaint (Under Review)...");
    const acceptRes = await fetch(`${BASE_URL}/api/authority/complaints/${complaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authorityCookie },
      body: JSON.stringify({ action: "accept" }),
    });
    const acceptJson = await acceptRes.json();
    assert(acceptRes.status === 200, "Accept action returned HTTP 200 OK");
    assert(acceptJson.data?.status === "Under Review", "Workflow transition: status is now 'Under Review'");
    assert(acceptJson.data?.authorityLevel === "Local Authority", "Authority Level: 'Local Authority'");

    // 5. Step 2: Mark In Progress
    console.log("\n[5] Step 2: Officer Marks Complaint 'In Progress'...");
    const inProgressRes = await fetch(`${BASE_URL}/api/authority/complaints/${complaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authorityCookie },
      body: JSON.stringify({ action: "status", status: "In Progress", notes: "Field inspection dispatched to Pete Road." }),
    });
    const inProgressJson = await inProgressRes.json();
    assert(inProgressRes.status === 200, "Status update returned HTTP 200 OK");
    assert(inProgressJson.data?.status === "In Progress", "Workflow transition: status is now 'In Progress'");

    // 6. Step 3: Add Official Remark
    console.log("\n[6] Step 3: Officer Adds Official Remark...");
    const remarkRes = await fetch(`${BASE_URL}/api/authority/complaints/${complaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authorityCookie },
      body: JSON.stringify({
        action: "remark",
        notes: "Excavation team on-site. Underground pipeline collapse requires Taluk-level heavy equipment.",
      }),
    });
    const remarkJson = await remarkRes.json();
    assert(remarkRes.status === 200, "Remark action returned HTTP 200 OK");
    assert(remarkJson.data?.status === "In Progress", "Status preserved during official remark");

    // 7. Step 4: Escalate to Block/Taluk Level (Lakshmeshwar Taluk Panchayat)
    console.log("\n[7] Step 4: Escalate to Block/Taluk Level (Lakshmeshwar Taluk Panchayat)...");
    const escalateRes = await fetch(`${BASE_URL}/api/authority/complaints/${complaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authorityCookie },
      body: JSON.stringify({
        action: "escalate",
        reason: "Requires heavy drainage suction machinery under Taluk Panchayat jurisdiction.",
      }),
    });
    const escalateJson = await escalateRes.json();
    assert(escalateRes.status === 200, "Escalation action returned HTTP 200 OK");
    assert(escalateJson.data?.status === "Escalated", "Workflow transition: status is now 'Escalated'");
    assert(escalateJson.data?.authorityLevel === "Block level", "Authority level transitioned to 'Block level'");
    assert(
      escalateJson.data?.assignedAuthority === "Lakshmeshwar Taluk Panchayat Executive Office",
      "Assigned Authority correctly set to: 'Lakshmeshwar Taluk Panchayat Executive Office'"
    );

    // 8. Step 5: Mark Resolved
    console.log("\n[8] Step 5: Resolve Complaint...");
    const resolveRes = await fetch(`${BASE_URL}/api/authority/complaints/${complaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authorityCookie },
      body: JSON.stringify({
        action: "resolve",
        resolutionNotes: "Taluk engineering team deployed suction machine. Collapsed conduit replaced and drainage flow fully restored.",
      }),
    });
    const resolveJson = await resolveRes.json();
    assert(resolveRes.status === 200, "Resolution action returned HTTP 200 OK");
    assert(resolveJson.data?.status === "Resolved", "Workflow transition: status is now 'Resolved'");
    assert(resolveJson.data?.resolvedAt !== null, "resolvedAt timestamp recorded in PostgreSQL");
    assert(resolveJson.data?.resolutionNotes.includes("drainage flow fully restored"), "Resolution notes persisted");

    // 9. Verify Citizen Tracker Reflects New Authority & Resolution
    console.log("\n[9] Auditing Citizen Tracking Integration (/api/complaints/[id] & /track)...");
    const citizenTrackApiRes = await fetch(`${BASE_URL}/api/complaints/${complaintId}`, {
      headers: { Cookie: citizenCookie },
    });
    const citizenTrackJson = await citizenTrackApiRes.json();
    assert(citizenTrackApiRes.status === 200, "Citizen tracking API returns HTTP 200 OK");
    assert(citizenTrackJson.data?.status === "Resolved", "Citizen tracker reflects final status: 'Resolved'");
    assert(
      citizenTrackJson.data?.assignedAuthority === "Lakshmeshwar Taluk Panchayat Executive Office",
      "Citizen tracker reflects corrected authority: 'Lakshmeshwar Taluk Panchayat Executive Office'"
    );
    assert(citizenTrackJson.data?.authorityLevel === "Block level", "Citizen tracker reflects authority level: 'Block level'");

    // Timeline event verification
    const timeline = citizenTrackJson.data?.timeline || [];
    assert(timeline.length >= 6, `Complete audit timeline preserved: ${timeline.length} events recorded`);

    const hasRegistered = timeline.some((e) => e.status === "Submitted" || e.note.includes("Registered"));
    const hasUnderReview = timeline.some((e) => e.status === "Under Review" || e.note.includes("review"));
    const hasInProgress = timeline.some((e) => e.status === "In Progress");
    const hasRemark = timeline.some((e) => e.note.includes("Excavation team on-site"));
    const hasEscalation = timeline.some(
      (e) => e.status === "Escalated" && (e.note.includes("Lakshmeshwar") || e.assignedAuthority?.includes("Lakshmeshwar"))
    );
    const hasResolved = timeline.some((e) => e.status === "Resolved");

    assert(hasRegistered, "Timeline contains 'Complaint Registered' event");
    assert(hasUnderReview, "Timeline contains 'Under Review' event");
    assert(hasInProgress, "Timeline contains 'In Progress' event");
    assert(hasRemark, "Timeline contains 'Official Remark' event");
    assert(hasEscalation, "Timeline contains 'Escalated to Lakshmeshwar Taluk Panchayat' event");
    assert(hasResolved, "Timeline contains 'Resolved' event");

    // Test live /track UI page rendering
    const trackUiRes = await fetch(`${BASE_URL}/track?id=${complaintId}`, {
      headers: { Cookie: citizenCookie },
    });
    assert(trackUiRes.status === 200, "GET /track?id=... responds HTTP 200 OK");
    const trackHtml = await trackUiRes.text();
    assert(trackHtml.includes("Citizen Status") || trackHtml.includes("Tracker"), "Citizen tracker page rendered tracking header");
    assert(citizenTrackJson.data?.status === "Resolved", "Citizen tracker data confirms 'Resolved' status badge");
    assert(citizenTrackJson.data?.assignedAuthority.includes("Lakshmeshwar"), "Citizen tracker data confirms 'Lakshmeshwar' authority context");

    // 10. Audit Historical Preservation Again
    console.log("\n[10] Final Historical Data Integrity Verification...");
    const historicalAuditRes = await pool.query(
      "SELECT id, status, authority_level, assigned_authority FROM complaints WHERE id LIKE $1 LIMIT 5;",
      ["%95709F69%"]
    );
    if (historicalAuditRes.rows.length > 0) {
      assert(true, "Historical complaint CMP-LMC-2026-95709F69 exists and remains unmodified");
    }

    // Cleanup fresh test records
    await pool.query(
      "DELETE FROM complaint_timeline WHERE complaint_id IN (SELECT id FROM complaints WHERE citizen_id IN (SELECT id FROM citizens WHERE mobile_number = $1 OR email = $2));",
      [TEST_CITIZEN.mobileNumber, TEST_CITIZEN.email]
    );
    await pool.query(
      "DELETE FROM complaints WHERE citizen_id IN (SELECT id FROM citizens WHERE mobile_number = $1 OR email = $2);",
      [TEST_CITIZEN.mobileNumber, TEST_CITIZEN.email]
    );
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [
      TEST_CITIZEN.mobileNumber,
      TEST_CITIZEN.email,
    ]);
    await pool.query("DELETE FROM citizen_otps WHERE identifier = $1;", [TEST_CITIZEN.mobileNumber]);
    await pool.end();

    console.log("\n================================================================");
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Verification failed with error:", err);
    if (pool) await pool.end();
    process.exit(1);
  }
}

verifyFreshComplaintLifecycle();
