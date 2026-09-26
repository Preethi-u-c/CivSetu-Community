import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

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

async function runComplaintTrackingTests() {
  console.log("================================================================");
  console.log(" CIVSETU COMPLAINT TRACKING INTEGRATION REGRESSION TESTS");
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

  const PRIMARY_CITIZEN = {
    id: "CTZ-TRACK-001",
    fullName: "Mallikarjun Kharge",
    mobileNumber: "9876500001",
    email: "mallikarjun.track@civsetu.gov.in",
    password: "Password123!Track",
    wardNumber: "Ward 03",
    residentialAddress: "Near Someshwara Temple, Lakshmeshwar",
  };

  const SECONDARY_CITIZEN = {
    id: "CTZ-TRACK-002",
    fullName: "Siddaramaiah Gowda",
    mobileNumber: "9876500002",
    email: "siddu.track@civsetu.gov.in",
    password: "Password123!Track2",
    wardNumber: "Ward 07",
    residentialAddress: "Near APMC Market, Lakshmeshwar",
  };

  let primarySessionCookie = "";
  let secondarySessionCookie = "";
  let createdComplaintId = "";

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Source Code Audit of /track Implementation
    // -------------------------------------------------------------------------
    console.log("[Test 1] Auditing src/app/track/page.tsx Implementation...");
    const trackPagePath = path.join(__dirname, "..", "src", "app", "track", "page.tsx");
    assert(fs.existsSync(trackPagePath), "Tracking page exists at src/app/track/page.tsx");
    const trackPageCode = fs.readFileSync(trackPagePath, "utf-8");

    // Endpoint connection
    assert(
      trackPageCode.includes("/api/complaints/"),
      "Connects to existing PostgreSQL complaint endpoint /api/complaints/[id]"
    );
    assert(
      trackPageCode.includes("CMP-") || trackPageCode.includes("CMP-LMC-"),
      "Identifies CMP- and CMP-LMC- complaint reference prefix"
    );

    // URL and manual input support
    assert(
      trackPageCode.includes("searchParams.get(\"id\")"),
      "Accepts Complaint ID from ?id= URL query parameter"
    );
    assert(
      trackPageCode.includes("trackingInput") && trackPageCode.includes("handleSearch"),
      "Supports manual Complaint ID lookup via interactive input box"
    );

    // Display fields
    assert(trackPageCode.includes("result.id"), "Displays official Complaint ID");
    assert(trackPageCode.includes("result.status"), "Displays live status of complaint");
    assert(trackPageCode.includes("result.categoryOrService"), "Displays complaint category/department");
    assert(trackPageCode.includes("result.ward"), "Displays incident ward jurisdiction");
    assert(trackPageCode.includes("result.location"), "Displays incident location/landmark");
    assert(trackPageCode.includes("result.createdAt"), "Displays submission timestamp");
    assert(trackPageCode.includes("result.deadline"), "Displays SLA resolution deadline");
    assert(trackPageCode.includes("result.timeline"), "Displays chronological processing timeline & audit trail");

    // Security & Ownership
    assert(
      trackPageCode.includes("status === 401") || trackPageCode.includes("401"),
      "Handles 401 unauthenticated state with clear login prompt"
    );
    assert(
      trackPageCode.includes("status === 403") || trackPageCode.includes("403"),
      "Handles 403 access denied state preserving citizen ownership rules"
    );

    // -------------------------------------------------------------------------
    // TEST 2: Setup Test Citizens in PostgreSQL
    // -------------------------------------------------------------------------
    console.log("\n[Test 2] Preparing Test Citizens in Database...");
    const hash1 = await bcrypt.hash(PRIMARY_CITIZEN.password, 10);
    const hash2 = await bcrypt.hash(SECONDARY_CITIZEN.password, 10);

    await pool.query("DELETE FROM citizens WHERE mobile_number IN ($1, $2) OR email IN ($3, $4)", [
      PRIMARY_CITIZEN.mobileNumber,
      SECONDARY_CITIZEN.mobileNumber,
      PRIMARY_CITIZEN.email,
      SECONDARY_CITIZEN.email,
    ]);

    await pool.query(
      `INSERT INTO citizens (id, full_name, mobile_number, mobile_verified, email, password_hash, ward_number, residential_address)
       VALUES ($1, $2, $3, true, $4, $5, $6, $7)`,
      [
        PRIMARY_CITIZEN.id,
        PRIMARY_CITIZEN.fullName,
        PRIMARY_CITIZEN.mobileNumber,
        PRIMARY_CITIZEN.email,
        hash1,
        PRIMARY_CITIZEN.wardNumber,
        PRIMARY_CITIZEN.residentialAddress,
      ]
    );

    await pool.query(
      `INSERT INTO citizens (id, full_name, mobile_number, mobile_verified, email, password_hash, ward_number, residential_address)
       VALUES ($1, $2, $3, true, $4, $5, $6, $7)`,
      [
        SECONDARY_CITIZEN.id,
        SECONDARY_CITIZEN.fullName,
        SECONDARY_CITIZEN.mobileNumber,
        SECONDARY_CITIZEN.email,
        hash2,
        SECONDARY_CITIZEN.wardNumber,
        SECONDARY_CITIZEN.residentialAddress,
      ]
    );

    // Log in primary citizen
    const loginRes1 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: PRIMARY_CITIZEN.mobileNumber,
        password: PRIMARY_CITIZEN.password,
      }),
    });
    assert(loginRes1.status === 200, "Primary citizen logged in successfully");
    primarySessionCookie = (loginRes1.headers.get("set-cookie") || "").split(";")[0];

    // Log in secondary citizen
    const loginRes2 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: SECONDARY_CITIZEN.mobileNumber,
        password: SECONDARY_CITIZEN.password,
      }),
    });
    assert(loginRes2.status === 200, "Secondary citizen logged in successfully");
    secondarySessionCookie = (loginRes2.headers.get("set-cookie") || "").split(";")[0];

    // -------------------------------------------------------------------------
    // TEST 3: Create a Real Complaint in PostgreSQL
    // -------------------------------------------------------------------------
    console.log("\n[Test 3] Creating Real Citizen Complaint via POST /api/complaints...");
    const complaintPayload = {
      category: "Water Supply & Drainage",
      title: "Broken municipal water valve outside Ward 03 community center",
      description:
        "Continuous clean water leakage flooding street pavement. Immediate plumbing inspection and valve replacement required.",
      ward: "Ward 03",
      address: "Opposite Someshwara Temple West Gate, Ward 03, Lakshmeshwar",
      latitude: 15.1245,
      longitude: 75.4744,
      priority: "High",
      photoUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    };

    const createRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: primarySessionCookie,
      },
      body: JSON.stringify(complaintPayload),
    });

    assert(createRes.status === 201, "POST /api/complaints returns HTTP 201 Created");
    const createJson = await createRes.json();
    assert(createJson.success === true, "Response reports success: true");
    createdComplaintId = createJson.data?.id;
    assert(
      createdComplaintId && createdComplaintId.startsWith("CMP-LMC-2026-"),
      `Generated Complaint ID: ${createdComplaintId}`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Tracking Retrieval via Existing Complaint Backend
    // -------------------------------------------------------------------------
    console.log("\n[Test 4] Retrieving Complaint via GET /api/complaints/[id] (Tracking Flow)...");
    const trackApiRes = await fetch(`${BASE_URL}/api/complaints/${encodeURIComponent(createdComplaintId)}`, {
      headers: { Cookie: primarySessionCookie },
    });

    assert(trackApiRes.status === 200, `GET /api/complaints/${createdComplaintId} returns HTTP 200 OK`);
    const trackApiJson = await trackApiRes.json();
    assert(trackApiJson.success === true, "Tracking response reports success: true");

    const complaintData = trackApiJson.data;
    assert(complaintData?.id === createdComplaintId, "Returns correct Complaint ID");
    assert(complaintData?.status === "Submitted", "Returns current status 'Submitted'");
    assert(complaintData?.category === complaintPayload.category, "Returns correct Category");
    assert(complaintData?.ward === complaintPayload.ward, "Returns correct Incident Ward");
    assert(complaintData?.address === complaintPayload.address, "Returns correct Incident Location/Landmark");
    assert(Boolean(complaintData?.createdAt), "Returns Submission Date (createdAt)");
    assert(Boolean(complaintData?.deadline), "Returns SLA Resolution Deadline");
    assert(complaintData?.priority === "High", "Returns Priority level");
    assert(complaintData?.citizenName === PRIMARY_CITIZEN.fullName, "Returns citizen complainant name");
    assert(Array.isArray(complaintData?.timeline), "Returns chronological audit timeline array");
    assert(complaintData?.timeline?.length >= 1, "Timeline contains at least 1 audit event");
    assert(
      complaintData?.timeline?.[0]?.action === "Complaint Registered",
      "Timeline event indicates 'Complaint Registered'"
    );
    assert(
      Boolean(complaintData?.timeline?.[0]?.createdAt),
      "Timeline event contains timestamp"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Security & Ownership Enforcement
    // -------------------------------------------------------------------------
    console.log("\n[Test 5] Verifying Authentication & Ownership Enforcement...");
    // 1. Unauthenticated request must return 401
    const unauthRes = await fetch(`${BASE_URL}/api/complaints/${encodeURIComponent(createdComplaintId)}`);
    assert(unauthRes.status === 401, "Unauthenticated tracking lookup returns HTTP 401");
    const unauthJson = await unauthRes.json();
    assert(unauthJson.success === false, "401 response reports success: false");

    // 2. Different citizen request must return 403
    const unauthorizedRes = await fetch(`${BASE_URL}/api/complaints/${encodeURIComponent(createdComplaintId)}`, {
      headers: { Cookie: secondarySessionCookie },
    });
    assert(unauthorizedRes.status === 403, "Tracking lookup by non-owning citizen returns HTTP 403 Access Denied");
    const unauthzJson = await unauthorizedRes.json();
    assert(unauthzJson.success === false, "403 response reports success: false");

    // -------------------------------------------------------------------------
    // TEST 6: Live /track Page Route Verification
    // -------------------------------------------------------------------------
    console.log("\n[Test 6] Verifying Live /track Page Route with ?id= Parameter...");
    const livePageRes = await fetch(`${BASE_URL}/track?id=${encodeURIComponent(createdComplaintId)}`, {
      headers: { Cookie: primarySessionCookie },
    });
    assert(livePageRes.status === 200, "GET /track?id=... returns HTTP 200 OK");
    const livePageHtml = await livePageRes.text();
    assert(
      livePageHtml.includes("Citizen Status &amp; Grievance Tracker") ||
      livePageHtml.includes("Citizen Status & Grievance Tracker"),
      "Renders Citizen Status & Grievance Tracker heading"
    );
    assert(
      livePageHtml.includes("Tracking Reference ID") || livePageHtml.includes("Track Status"),
      "Contains tracking search form elements"
    );

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------
    console.log("\n[Cleanup] Purging test records from PostgreSQL...");
    if (createdComplaintId) {
      await pool.query("DELETE FROM complaint_timeline WHERE complaint_id = $1", [createdComplaintId]);
      await pool.query("DELETE FROM complaints WHERE id = $1", [createdComplaintId]);
    }
    await pool.query("DELETE FROM citizens WHERE id IN ($1, $2)", [PRIMARY_CITIZEN.id, SECONDARY_CITIZEN.id]);
    console.log("  ✓ Test complaint and citizen records purged successfully.");

  } catch (err) {
    console.error("Test execution failed:", err);
    failed++;
  } finally {
    await pool.end();
  }

  console.log("\n================================================================");
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runComplaintTrackingTests();
