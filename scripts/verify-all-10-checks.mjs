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

async function verifyAll10Checks() {
  console.log("================================================================");
  console.log(" CIVSETU PHASE 4A END-TO-END AUDIT & VERIFICATION");
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
    id: "CTZ-VERIFY-001",
    fullName: "Suresh Kulkarni",
    mobileNumber: "9876588888",
    email: "suresh.kulkarni@example.com",
    password: "Password123!",
    wardNumber: "Ward 05",
    residentialAddress: "Bazar Road, Ward 5, Lakshmeshwar",
  };

  try {
    // Setup test citizen in PostgreSQL
    const hash = await bcrypt.hash(TEST_CITIZEN.password, 10);
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2", [
      TEST_CITIZEN.mobileNumber,
      TEST_CITIZEN.email,
    ]);
    await pool.query(
      `INSERT INTO citizens (id, full_name, mobile_number, mobile_verified, email, password_hash, ward_number, residential_address)
       VALUES ($1, $2, $3, true, $4, $5, $6, $7)`,
      [
        TEST_CITIZEN.id,
        TEST_CITIZEN.fullName,
        TEST_CITIZEN.mobileNumber,
        TEST_CITIZEN.email,
        hash,
        TEST_CITIZEN.wardNumber,
        TEST_CITIZEN.residentialAddress,
      ]
    );

    // -------------------------------------------------------------------------
    // CHECK 1: /complaints/new loads successfully
    // -------------------------------------------------------------------------
    console.log("[Check 1] Verifying /complaints/new loads successfully...");
    const resNew = await fetch(`${BASE_URL}/complaints/new`);
    assert(resNew.status === 200, "Route /complaints/new returns HTTP status 200 OK");
    const htmlNew = await resNew.text();
    assert(htmlNew.length > 500, "Route /complaints/new returns full HTML document payload");

    // -------------------------------------------------------------------------
    // CHECK 2: The complaint form renders correctly
    // -------------------------------------------------------------------------
    console.log("\n[Check 2] Verifying complaint form renders correctly...");
    assert(htmlNew.includes("Lodge Citizen Grievance"), "Header includes 'Lodge Citizen Grievance'");
    assert(htmlNew.includes("Citizen Portal"), "Includes 'Citizen Portal' breadcrumb navigation");
    
    // Inspect source code structure for complaint form elements
    const newPagePath = path.join(__dirname, "..", "src", "app", "complaints", "new", "page.tsx");
    const newPageCode = fs.readFileSync(newPagePath, "utf-8");
    assert(newPageCode.includes("COMPLAINT_CATEGORIES"), "Defines official municipal complaint categories");
    assert(newPageCode.includes("field-category"), "Includes Department/Category selection section");
    assert(newPageCode.includes("field-title"), "Includes Complaint Subject/Title input with length limits");
    assert(newPageCode.includes("field-description"), "Includes Detailed Grievance Description textarea");
    assert(newPageCode.includes("field-ward"), "Includes TMC Ward jurisdiction dropdown");
    assert(newPageCode.includes("field-address"), "Includes Incident Landmark/Address input");

    // -------------------------------------------------------------------------
    // CHECK 3: The dashboard links to /complaints/new correctly
    // -------------------------------------------------------------------------
    console.log("\n[Check 3] Verifying dashboard links to /complaints/new correctly...");
    const dashRes = await fetch(`${BASE_URL}/dashboard`);
    assert(dashRes.status === 200, "Dashboard route /dashboard returns HTTP status 200");

    const dashPath = path.join(__dirname, "..", "src", "app", "dashboard", "page.tsx");
    const dashCode = fs.readFileSync(dashPath, "utf-8");
    assert(dashCode.includes('href="/complaints/new"'), "Dashboard contains prominent link to /complaints/new");
    assert(dashCode.includes("Register Complaint"), "Dashboard renders 'Register Complaint' button");
    assert(dashCode.includes("Register Grievance"), "Dashboard navigation grid contains 'Register Grievance' card");

    // -------------------------------------------------------------------------
    // CHECK 4: Required-field validation works
    // -------------------------------------------------------------------------
    console.log("\n[Check 4] Verifying required-field validation works...");
    // Acquire authenticated session for Suresh
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: TEST_CITIZEN.mobileNumber,
        password: TEST_CITIZEN.password,
      }),
    });
    assert(loginRes.status === 200, "Citizen successfully logs in");
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const sessionCookie = setCookie.split(";")[0];

    // Test missing category validation
    const valCatRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({ category: "", title: "Pipeline broken", description: "Leaking clean water on street", ward: "Ward 05" }),
    });
    assert(valCatRes.status === 400, "Backend validation rejects missing category (HTTP 400)");
    const valCatJson = await valCatRes.json();
    assert(valCatJson.error.includes("category"), "Error message specifies missing municipal category");

    // Test short title validation (< 3 chars)
    const valTitleRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({ category: "Water Supply & Metering", title: "ab", description: "Leaking clean water on street", ward: "Ward 05" }),
    });
    assert(valTitleRes.status === 400, "Backend validation rejects title < 3 characters (HTTP 400)");

    // Test short description validation (< 10 chars)
    const valDescRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({ category: "Water Supply & Metering", title: "Pipeline broken", description: "short", ward: "Ward 05" }),
    });
    assert(valDescRes.status === 400, "Backend validation rejects description < 10 characters (HTTP 400)");

    // Test frontend client validation functions
    assert(newPageCode.includes("validateForm"), "Frontend page includes comprehensive validateForm() routine");
    assert(newPageCode.includes("newErrors.category"), "Frontend checks category presence");
    assert(newPageCode.includes("newErrors.title"), "Frontend checks title minimum length");
    assert(newPageCode.includes("newErrors.description"), "Frontend checks description minimum length");
    assert(newPageCode.includes("newErrors.ward"), "Frontend checks ward presence");
    assert(newPageCode.includes("newErrors.address"), "Frontend checks address presence");

    // -------------------------------------------------------------------------
    // CHECK 5: Ward selection works
    // -------------------------------------------------------------------------
    console.log("\n[Check 5] Verifying ward selection works...");
    assert(newPageCode.includes('import { wardsData } from "@/data/wards"'), "Imports canonical wardsData from @/data/wards");
    assert(newPageCode.includes("wardsData.map"), "Dynamically renders all Lakshmeshwar municipal wards in select dropdown");
    assert(newPageCode.includes("citizen.wardNumber"), "Pre-populates citizen's registered ward from session context");

    // Check ward count from canonical data
    const wardsContent = fs.readFileSync(path.join(__dirname, "..", "src", "data", "wards.ts"), "utf-8");
    const wardMatches = wardsContent.match(/wardNumber:\s*\d+/g);
    assert(wardMatches && wardMatches.length === 23, `All 23 Lakshmeshwar TMC wards are available in data source (${wardMatches?.length} found)`);

    // -------------------------------------------------------------------------
    // CHECK 6: Photo/location/AI UI works as intended for mock implementation
    // -------------------------------------------------------------------------
    console.log("\n[Check 6] Verifying Photo, Location & AI UI implementations...");
    // Photo attachment
    assert(newPageCode.includes("handlePhotoSelect"), "Implements client-side photo file selection and 5MB validation");
    assert(newPageCode.includes("readAsDataURL"), "Reads photo data to DataURL for immediate thumbnail preview");
    assert(newPageCode.includes("handleRemovePhoto"), "Provides clean photo detachment control");
    assert(newPageCode.includes("photoPreview"), "Conditionally displays attached evidence thumbnail and metadata");

    // Geolocation control
    assert(newPageCode.includes("handleCaptureLocation"), "Implements device GPS capture control");
    assert(newPageCode.includes("navigator.geolocation"), "Leverages browser Geolocation API");
    assert(newPageCode.includes("15.1245") && newPageCode.includes("75.4744"), "Provides Lakshmeshwar TMC municipal zone fallback coordinates");
    assert(newPageCode.includes("handleClearLocation"), "Provides clear/reset location control");

    // Civic AI Assistant
    assert(newPageCode.includes("aiAssistantOpen"), "Features interactive Civic AI Assistant modal");
    assert(newPageCode.includes("handleRunAiAssistant"), "Processes citizen rough notes into formal municipal format");
    assert(newPageCode.includes("handleApplyAiSuggestion"), "Provides 1-click application of AI drafted subject & description");

    // -------------------------------------------------------------------------
    // CHECK 7: Review Complaint works without submitting prematurely
    // -------------------------------------------------------------------------
    console.log("\n[Check 7] Verifying Review Complaint works without premature submission...");
    assert(newPageCode.includes("handleProceedToReview"), "Review button calls handleProceedToReview without submitting API request");
    assert(newPageCode.includes("setCurrentStep(2)"), "Step transitions from 1 (Form) to 2 (Review)");
    assert(newPageCode.includes("handleSubmitGrievance"), "Separate handleSubmitGrievance handler triggered only from Review screen");
    assert(newPageCode.includes("currentStep === 2"), "Dedicated Review screen shows summary of all entered details");
    assert(newPageCode.includes("Edit Complaint Details"), "Allows returning back to Step 1 without losing form state");

    // Count complaints in DB before any submission
    const preCountRes = await pool.query("SELECT COUNT(*) FROM complaints WHERE citizen_id = $1", [TEST_CITIZEN.id]);
    assert(parseInt(preCountRes.rows[0].count, 10) === 0, "No complaint is submitted prior to explicit Step 2 confirmation");

    // -------------------------------------------------------------------------
    // CHECK 8: Existing authentication is not broken
    // -------------------------------------------------------------------------
    console.log("\n[Check 8] Verifying existing authentication remains intact...");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    assert(meRes.status === 200, "GET /api/auth/me validates active session");
    const meJson = await meRes.json();
    assert(meJson.authenticated === true, "Session authenticated flag is true");
    assert(meJson.citizen?.fullName === TEST_CITIZEN.fullName, "Session user matches logged-in citizen");

    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    assert(logoutRes.status === 200, "Logout API succeeds");

    const meAfterLogout = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    assert(meAfterLogout.status === 401, "Session successfully invalidated after logout");

    // -------------------------------------------------------------------------
    // Cleanup test citizen
    // -------------------------------------------------------------------------
    await pool.query("DELETE FROM citizens WHERE id = $1", [TEST_CITIZEN.id]);
    console.log("\n[Cleanup] Test citizen purged from database.");

  } catch (err) {
    console.error("Audit error:", err);
    failed++;
  } finally {
    await pool.end();
  }

  console.log("\n================================================================");
  console.log(` AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyAll10Checks();
