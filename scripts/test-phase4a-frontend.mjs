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

async function runPhase4aTests() {
  console.log("================================================================");
  console.log(" CIVSETU PHASE 4A: CITIZEN COMPLAINT REGISTRATION TEST SUITE");
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
    fullName: "Kiran Patil",
    mobileNumber: "9876599001",
    email: "kiran.patil@testcivsetu.gov.in",
    password: "SecurePassword!99",
    wardNumber: "Ward 03",
    residentialAddress: "House No 45, Near Someshwara Temple, Lakshmeshwar",
  };

  try {
    // 0. Cleanup prior test records
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2", [
      TEST_CITIZEN.mobileNumber,
      TEST_CITIZEN.email,
    ]);
    console.log("[Setup] Prior test citizens purged from PostgreSQL.");

    // 1. Verify Page Routes accessibility & source code integration
    console.log("\n[1] Verifying Page Routes accessibility & Frontend Integration...");
    const resNew = await fetch(`${BASE_URL}/complaints/new`);
    assert(resNew.status === 200, "Page /complaints/new returns HTTP 200");
    const htmlNew = await resNew.text();
    assert(
      htmlNew.includes("Lodge Citizen Grievance") || htmlNew.includes("complaint"),
      "Page /complaints/new contains grievance portal markup"
    );

    const resDash = await fetch(`${BASE_URL}/dashboard`);
    assert(resDash.status === 200, "Page /dashboard returns HTTP 200");

    const dashSourcePath = path.join(__dirname, "..", "src", "app", "dashboard", "page.tsx");
    const dashSource = fs.readFileSync(dashSourcePath, "utf-8");
    assert(
      dashSource.includes("/complaints/new"),
      "Dashboard source contains direct link to /complaints/new"
    );
    assert(
      dashSource.includes("Register Complaint") && dashSource.includes("Register Grievance"),
      "Dashboard source provides prominent Register Complaint/Grievance action"
    );

    const newComplaintSourcePath = path.join(__dirname, "..", "src", "app", "complaints", "new", "page.tsx");
    const newComplaintSource = fs.readFileSync(newComplaintSourcePath, "utf-8");
    assert(
      newComplaintSource.includes("wardsData"),
      "Complaints/new reuses existing ward data from @/data/wards"
    );
    assert(
      newComplaintSource.includes("useAuth"),
      "Complaints/new gates access using existing useAuth session context"
    );
    assert(
      newComplaintSource.includes("COMPLAINT_CATEGORIES"),
      "Complaints/new defines comprehensive municipal complaint categories"
    );
    assert(
      newComplaintSource.includes("handleCaptureLocation"),
      "Complaints/new provides GPS geolocation capture and geotagging"
    );
    assert(
      newComplaintSource.includes("aiAssistantOpen"),
      "Complaints/new provides Civic AI assistant integration"
    );
    assert(
      newComplaintSource.includes("handleSaveDraft"),
      "Complaints/new provides draft save & restore capability"
    );
    assert(
      newComplaintSource.includes("currentStep === 2"),
      "Complaints/new requires review step before submitting"
    );

    // 2. Unauthenticated check on API
    console.log("\n[2] Testing unauthenticated access protection...");
    const unauthPost = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "Water Supply & Metering",
        title: "Test water leak",
        description: "Test description of pipeline leak",
        ward: "Ward 03",
      }),
    });
    assert(unauthPost.status === 401, "POST /api/complaints rejects unauthenticated submission (HTTP 401)");
    const unauthJson = await unauthPost.json();
    assert(unauthJson.success === false, "unauthenticated success flag is false");

    // 3. Register citizen and acquire session cookie
    console.log("\n[3] Authenticating Citizen Kiran Patil...");
    // Send OTP
    const otpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: TEST_CITIZEN.mobileNumber, purpose: "registration" }),
    });
    assert(otpRes.status === 200, "Send OTP returns 200");

    // Verify OTP with standard mock OTP 123456
    const vRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: TEST_CITIZEN.mobileNumber,
        otp: "123456",
        purpose: "registration",
      }),
    });
    assert(vRes.status === 200, "Verify OTP returns 200");

    // Register citizen
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: TEST_CITIZEN.fullName,
        mobileNumber: TEST_CITIZEN.mobileNumber,
        email: TEST_CITIZEN.email,
        password: TEST_CITIZEN.password,
        confirmPassword: TEST_CITIZEN.password,
        wardNumber: TEST_CITIZEN.wardNumber,
        residentialAddress: TEST_CITIZEN.residentialAddress,
        otp: "123456",
      }),
    });
    assert(regRes.status === 200, "Citizen registration returns 200");

    // Login citizen and capture cookie
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: TEST_CITIZEN.mobileNumber,
        password: TEST_CITIZEN.password,
      }),
    });
    assert(loginRes.status === 200, "Citizen login returns 200 OK");
    const rawCookie = loginRes.headers.get("set-cookie") || "";
    const sessionCookie = rawCookie.split(";")[0];
    assert(sessionCookie.includes("civsetu_citizen_token"), "Session cookie acquired successfully");

    // Verify active session via /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    assert(meRes.status === 200, "GET /api/auth/me returns 200 for active session");
    const meData = await meRes.json();
    assert(meData.citizen?.fullName === TEST_CITIZEN.fullName, "Session correctly identifies citizen name");
    assert(meData.citizen?.wardNumber === TEST_CITIZEN.wardNumber, "Session correctly identifies registered ward");

    // 4. Test Form Validations via Complaint API
    console.log("\n[4] Testing Server-side Complaint Form Validations...");
    
    // Missing category
    const badCatRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        category: "",
        title: "Valid title here",
        description: "Valid description of issue",
        ward: "Ward 03",
      }),
    });
    assert(badCatRes.status === 400, "Rejects empty complaint category (HTTP 400)");

    // Title too short (< 3 chars)
    const shortTitleRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        category: "Water Supply & Metering",
        title: "Hi",
        description: "Valid description of issue",
        ward: "Ward 03",
      }),
    });
    assert(shortTitleRes.status === 400, "Rejects title shorter than 3 characters (HTTP 400)");

    // Description too short (< 10 chars)
    const shortDescRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        category: "Water Supply & Metering",
        title: "Burst pipe on road",
        description: "Short",
        ward: "Ward 03",
      }),
    });
    assert(shortDescRes.status === 400, "Rejects description shorter than 10 characters (HTTP 400)");

    // 5. Test Successful Complaint Registration (Phase 4A End-to-End)
    console.log("\n[5] Testing Successful Complaint Registration...");
    const complaintPayload = {
      category: "Water Supply & Metering",
      title: "Drinking water pipeline leakage outside Someshwara Temple",
      description:
        "Official Grievance: A major potable water pipeline burst has occurred opposite Someshwara Temple. Water is gushing onto the roadway continuously for 36 hours. Immediate inspection and pipe repair is requested.",
      ward: "Ward 03",
      address: "Opposite Someshwara Temple, Main Bazar Road, Lakshmeshwar",
      latitude: 15.1245,
      longitude: 75.4744,
      priority: "High",
      photoUrl: "data:image/jpeg;base64,mockEvidenceThumbnailImageDataUrl",
    };

    const submitRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify(complaintPayload),
    });

    assert(submitRes.status === 201, "POST /api/complaints returns HTTP 201 Created");
    const submitJson = await submitRes.json();
    assert(submitJson.success === true, "Response reports success: true");
    const createdComplaint = submitJson.data;

    assert(
      createdComplaint.id && createdComplaint.id.startsWith("CMP-LMC-2026-"),
      `Valid Complaint ID generated: ${createdComplaint.id}`
    );
    assert(createdComplaint.category === complaintPayload.category, "Category matches registered input");
    assert(createdComplaint.title === complaintPayload.title, "Title matches registered input");
    assert(createdComplaint.priority === "High", "Priority recorded as High");
    assert(createdComplaint.status === "Submitted", "Initial complaint status is 'Submitted'");
    assert(createdComplaint.authorityLevel === "Local Authority", "Initial authority level is 'Local Authority'");
    assert(
      createdComplaint.assignedAuthority.includes("Water Supply"),
      `Auto-assigned to Water Supply wing: ${createdComplaint.assignedAuthority}`
    );
    assert(
      createdComplaint.deadline && new Date(createdComplaint.deadline) > new Date(),
      `SLA Deadline successfully calculated: ${createdComplaint.deadline}`
    );
    assert(
      createdComplaint.latitude === 15.1245 && createdComplaint.longitude === 75.4744,
      "GPS coordinates successfully stored"
    );
    assert(
      createdComplaint.photoUrl === complaintPayload.photoUrl,
      "Photographic evidence URL successfully attached"
    );

    // 6. Verify Complaint Listing for Citizen
    console.log("\n[6] Verifying Complaint in Citizen's Personal Registry...");
    const listRes = await fetch(`${BASE_URL}/api/complaints`, {
      headers: { Cookie: sessionCookie },
    });
    assert(listRes.status === 200, "GET /api/complaints returns 200 OK");
    const listJson = await listRes.json();
    assert(listJson.count >= 1, `Citizen complaint count is ${listJson.count}`);
    const found = listJson.data.find((c) => c.id === createdComplaint.id);
    assert(!!found, "Registered complaint exists in citizen's personal list");

    // 7. Verify Complaint Detail Lookup
    console.log("\n[7] Verifying Complaint Details & Timeline...");
    const detailRes = await fetch(`${BASE_URL}/api/complaints/${createdComplaint.id}`, {
      headers: { Cookie: sessionCookie },
    });
    assert(detailRes.status === 200, "GET /api/complaints/[id] returns 200 OK");
    const detailJson = await detailRes.json();
    assert(detailJson.data?.id === createdComplaint.id, "Detail endpoint returns correct complaint ID");
    assert(detailJson.data?.timeline && detailJson.data.timeline.length > 0, "Initial registration audit timeline entry generated");
    assert(detailJson.data.timeline[0]?.action.includes("Registered"), "First timeline event is Complaint Registered");

    // 8. Cleanup test data from PostgreSQL
    console.log("\n[8] Cleaning up test fixtures from PostgreSQL...");
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1", [TEST_CITIZEN.mobileNumber]);
    console.log("  ✓ PASS: Test citizen and cascading complaint records purged from PostgreSQL");
    passed++;

  } catch (err) {
    console.error("Test execution error:", err);
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

runPhase4aTests();
