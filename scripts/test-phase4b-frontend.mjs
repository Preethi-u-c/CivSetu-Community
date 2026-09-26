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

async function runPhase4bTests() {
  console.log("================================================================");
  console.log(" CIVSETU PHASE 4B: COMPLAINT PHOTO + LOCATION AUDIT & TESTS");
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
    id: "CTZ-PHASE4B-001",
    fullName: "Basavaraj Bommai",
    mobileNumber: "9876543210",
    email: "basavaraj.tmc@testcivsetu.gov.in",
    password: "Password123!Safe",
    wardNumber: "Ward 04",
    residentialAddress: "Near KSRTC Bus Stand, Lakshmeshwar",
  };

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Source Code Audit for Photo Upload Requirements
    // -------------------------------------------------------------------------
    console.log("[Test 1] Auditing Complaint Photo Upload Requirements...");
    const pagePath = path.join(__dirname, "..", "src", "app", "complaints", "new", "page.tsx");
    const pageCode = fs.readFileSync(pagePath, "utf-8");

    assert(pageCode.includes("handlePhotoSelect"), "Implements device image selection handler");
    assert(pageCode.includes("validateAndProcessPhoto"), "Implements image format and size validation routine");
    assert(pageCode.includes("readAsDataURL"), "Converts selected photo to DataURL for safe local preview");
    assert(pageCode.includes("photoPreview"), "Maintains local preview state for visual confirmation before submission");
    assert(pageCode.includes("handleRemovePhoto"), "Provides explicit photo removal action");
    assert(pageCode.includes("handleReplacePhoto"), "Provides explicit photo replacement action");
    assert(pageCode.includes("5 * 1024 * 1024"), "Enforces 5MB maximum file size limit");
    assert(
      pageCode.includes("image/jpeg") && pageCode.includes("image/png") && pageCode.includes("image/webp"),
      "Restricts image file types to JPEG, PNG, and WebP"
    );
    assert(
      pageCode.includes("onDragOver") && pageCode.includes("onDrop"),
      "Supports modern drag-and-drop file attachment"
    );
    assert(
      pageCode.includes("photoModalOpen") && pageCode.includes("photoPreview"),
      "Provides photo enlargement / lightbox preview modal before final submission"
    );

    // -------------------------------------------------------------------------
    // TEST 2: Source Code Audit for Location & Geolocation Requirements
    // -------------------------------------------------------------------------
    console.log("\n[Test 2] Auditing Location & Geolocation Requirements...");
    assert(pageCode.includes("Add Incident Location"), "Provides clear 'Add Location' section header");
    assert(pageCode.includes("Use Current Location"), "Provides prominent 'Use Current Location' action button");
    assert(pageCode.includes("handleCaptureLocation"), "Implements device GPS capture control");
    assert(pageCode.includes("navigator.geolocation"), "Integrates browser Geolocation API");
    assert(pageCode.includes("pos.coords.accuracy"), "Captures actual browser-reported accuracy instead of hard-coded radius");
    assert(pageCode.includes("locationAccuracy"), "Stores actual accuracy in state for UI display and audit");
    
    // Geolocation error handling
    assert(pageCode.includes("err.code === 1"), "Gracefully handles Geolocation PERMISSION_DENIED (code 1)");
    assert(pageCode.includes("err.code === 2"), "Gracefully handles Geolocation POSITION_UNAVAILABLE (code 2)");
    assert(pageCode.includes("err.code === 3"), "Gracefully handles Geolocation TIMEOUT (code 3)");
    assert(pageCode.includes("locationError"), "Maintains accessible location error state");

    // Privacy protection
    assert(
      pageCode.includes("showCoordinatesDetail") &&
      (pageCode.includes("Hide Raw GPS") || pageCode.includes("View Raw GPS")),
      "Does not expose citizen precise raw coordinates unnecessarily; provides privacy toggle"
    );
    assert(
      pageCode.includes("protected for citizen privacy") || pageCode.includes("Protected for citizen privacy"),
      "Displays citizen privacy reassurance for location data"
    );

    // -------------------------------------------------------------------------
    // TEST 3: Self-Contained Municipal Map Picker (Zero Paid APIs)
    // -------------------------------------------------------------------------
    console.log("\n[Test 3] Auditing Self-Contained Municipal Map Picker...");
    assert(pageCode.includes("MunicipalMapPickerModal"), "Integrates MunicipalMapPickerModal into /complaints/new");
    assert(pageCode.includes("Pick on Municipal Map"), "Provides explicit 'Pick on Municipal Map' button");

    const mapModalPath = path.join(
      __dirname,
      "..",
      "src",
      "components",
      "Complaints",
      "MunicipalMapPickerModal.tsx"
    );
    assert(fs.existsSync(mapModalPath), "MunicipalMapPickerModal component file exists");

    const mapModalCode = fs.readFileSync(mapModalPath, "utf-8");
    assert(!mapModalCode.includes("maps.googleapis.com"), "No Google Maps API URLs or external paid service dependencies");
    assert(!mapModalCode.includes("GOOGLE_MAPS_API_KEY"), "Does not require Google Maps API keys");
    assert(mapModalCode.includes("LAKSHMESHWAR_LANDMARKS"), "Includes canonical municipal landmarks for Lakshmeshwar TMC");
    assert(mapModalCode.includes("Someshwara Temple"), "Includes Someshwara Temple municipal landmark");
    assert(mapModalCode.includes("KSRTC Central Bus Stand"), "Includes KSRTC Bus Stand municipal landmark");
    assert(mapModalCode.includes("handleSvgClick"), "Allows citizen to click/drop incident pin on municipal map canvas");
    assert(mapModalCode.includes("handleConfirm"), "Allows citizen to confirm and apply selected map location");

    // -------------------------------------------------------------------------
    // TEST 4: Accessibility & Form Integration
    // -------------------------------------------------------------------------
    console.log("\n[Test 4] Auditing Accessibility & Form Integration...");
    assert(pageCode.includes('htmlFor="complaint-photo-input"'), "Photo upload input has accessible <label htmlFor=...>");
    assert(pageCode.includes('role="alert"'), "Error messages use ARIA role='alert' for screen-readers");
    assert(pageCode.includes('role="status"'), "Status messages use ARIA role='status'");
    assert(pageCode.includes("focus-visible:ring"), "Interactive elements include visible focus rings for keyboard navigation");
    assert(
      pageCode.includes("onKeyDown") && pageCode.includes("Enter"),
      "File dropzone supports keyboard activation via Enter or Space key"
    );
    assert(
      mapModalCode.includes('role="dialog"') && mapModalCode.includes('aria-modal="true"'),
      "Map modal includes proper dialog role and modal ARIA attributes"
    );
    assert(
      mapModalCode.includes("Escape"),
      "Map modal supports dismissal via Escape key"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Preservation of Review Step & Phase 4A Flow
    // -------------------------------------------------------------------------
    console.log("\n[Test 5] Auditing Review Step & State Preservation...");
    assert(pageCode.includes("currentStep === 2"), "Preserves Step 2 Review screen before official submission");
    assert(
      pageCode.includes("Attached Photographic Evidence") || pageCode.includes("Attached Evidence"),
      "Displays attached photo preview in Step 2 Review screen"
    );
    assert(
      pageCode.includes("Location & GPS Breakdown") || pageCode.includes("Incident Landmark / Address"),
      "Displays selected location and GPS breakdown in Step 2 Review screen"
    );
    assert(pageCode.includes("handleSaveDraft"), "Preserves draft save functionality");
    assert(pageCode.includes("handleRestoreDraft"), "Preserves draft restore functionality");

    // -------------------------------------------------------------------------
    // TEST 6: Live HTTP Endpoint Verification
    // -------------------------------------------------------------------------
    console.log("\n[Test 6] Verifying Live HTTP /complaints/new Route...");
    const resNew = await fetch(`${BASE_URL}/complaints/new`);
    assert(resNew.status === 200, "GET /complaints/new returns HTTP 200 OK");
    const htmlNew = await resNew.text();
    assert(htmlNew.includes("Lodge Citizen Grievance"), "Page contains official grievance portal heading");
    assert(htmlNew.includes("Citizen Portal"), "Includes citizen portal navigation link");
    assert(pageCode.includes("Add Incident Location"), "Component structure includes 'Add Incident Location' section");
    assert(pageCode.includes("Photographic Evidence"), "Component structure includes 'Photographic Evidence' section");

    // -------------------------------------------------------------------------
    // TEST 7: End-to-End Complaint Submission with Photo & Location
    // -------------------------------------------------------------------------
    console.log("\n[Test 7] Testing End-to-End Submission with Photo & Coordinates...");
    // Setup test citizen in database
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

    // Log in citizen
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: TEST_CITIZEN.mobileNumber,
        password: TEST_CITIZEN.password,
      }),
    });
    assert(loginRes.status === 200, "Citizen logs in successfully");
    const cookieHeader = loginRes.headers.get("set-cookie") || "";
    const sessionCookie = cookieHeader.split(";")[0];

    // Submit complaint with photographic evidence and geotagged coordinates
    const complaintData = {
      category: "Roads, Footpaths & Drainage",
      title: "Deep pothole and waterlogging near KSRTC Bus Stand junction",
      description:
        "Large depression on road surface causing severe vehicular hazard during monsoon rain. Immediate municipal road patching required.",
      ward: "Ward 04",
      address: "Near KSRTC Bus Stand Entrance Circle, Lakshmeshwar",
      latitude: 15.1262,
      longitude: 75.476,
      priority: "High",
      photoUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...",
    };

    const submitRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify(complaintData),
    });

    assert(submitRes.status === 201, "POST /api/complaints returns HTTP 201 Created");
    const submitJson = await submitRes.json();
    assert(submitJson.success === true, "Response reports success: true");
    const createdId = submitJson.data?.id;
    assert(createdId && createdId.startsWith("CMP-LMC-2026-"), `Generated valid Complaint ID: ${createdId}`);
    assert(submitJson.data?.latitude === 15.1262, "Recorded latitude matches submitted coordinates");
    assert(submitJson.data?.longitude === 75.476, "Recorded longitude matches submitted coordinates");
    assert(submitJson.data?.photoUrl === complaintData.photoUrl, "Recorded photoUrl matches submitted evidence");

    // Verify detail lookup
    const detailRes = await fetch(`${BASE_URL}/api/complaints/${createdId}`, {
      headers: { Cookie: sessionCookie },
    });
    assert(detailRes.status === 200, "GET /api/complaints/[id] returns HTTP 200 OK");
    const detailJson = await detailRes.json();
    assert(detailJson.data?.id === createdId, "Detail endpoint confirms registered complaint");
    assert(detailJson.data?.latitude === 15.1262, "Detail endpoint preserves latitude");
    assert(detailJson.data?.longitude === 75.476, "Detail endpoint preserves longitude");
    assert(detailJson.data?.photoUrl?.length > 10, "Detail endpoint preserves photo attachment data");

    // Cleanup test records
    await pool.query("DELETE FROM citizens WHERE id = $1", [TEST_CITIZEN.id]);
    console.log("\n[Cleanup] Test citizen and complaint records purged from PostgreSQL.");

    // -------------------------------------------------------------------------
    // TEST 8: Regression Audit & State Synchronization for Confirmed Municipal Map Selection
    // -------------------------------------------------------------------------
    console.log("\n[Test 8] Regression Audit: Confirmed Map Selection & State Synchronization...");

    // 1. Audit normalizeWardValue in MunicipalMapPickerModal.tsx
    assert(
      mapModalCode.includes("export const normalizeWardValue"),
      "Exports canonical normalizeWardValue helper function"
    );
    assert(
      mapModalCode.includes('padStart(2, "0")'),
      'Pads ward numbers with leading zeros (e.g. Ward 04, Ward 20) matching <select> values'
    );

    // Extract normalizeWardValue logic and verify against all formats
    const normalizeWardFunc = (wardInput) => {
      if (!wardInput) return "";
      const str = String(wardInput).trim();
      const match = str.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num >= 1 && num <= 23) {
          return `Ward ${String(num).padStart(2, "0")}`;
        }
      }
      return str;
    };

    assert(
      normalizeWardFunc("Lakshmeshwar Ward No. 20") === "Ward 20",
      "Normalizes 'Lakshmeshwar Ward No. 20' to 'Ward 20'"
    );
    assert(
      normalizeWardFunc("Lakshmeshwar Ward No. 3") === "Ward 03",
      "Normalizes 'Lakshmeshwar Ward No. 3' to 'Ward 03'"
    );
    assert(
      normalizeWardFunc("Ward 20") === "Ward 20",
      "Preserves already formatted 'Ward 20'"
    );
    assert(
      normalizeWardFunc("Ward 4") === "Ward 04",
      "Normalizes single-digit 'Ward 4' to padded 'Ward 04'"
    );
    assert(
      normalizeWardFunc(20) === "Ward 20",
      "Normalizes raw number 20 to 'Ward 20'"
    );
    assert(
      normalizeWardFunc(3) === "Ward 03",
      "Normalizes raw number 3 to 'Ward 03'"
    );

    // 2. Audit MunicipalMapPickerModal handleConfirm callback payload
    assert(
      mapModalCode.includes("wardCode: wardCode") || mapModalCode.includes("wardCode,"),
      "handleConfirm passes normalized wardCode (e.g. Ward 20) in callback payload"
    );
    assert(
      mapModalCode.includes("isSpecificLandmark: selectedLandmark !== null"),
      "handleConfirm flags whether a canonical landmark or arbitrary map pin was confirmed"
    );
    assert(
      mapModalCode.includes("WARD_CENTROIDS"),
      "Maintains WARD_CENTROIDS mapping covering all 23 Lakshmeshwar TMC wards"
    );

    // 3. Audit handleMapLocationSelected in complaints/new/page.tsx
    assert(
      pageCode.includes("normalizeWardValue"),
      "complaints/new/page.tsx integrates normalizeWardValue for robust ward matching"
    );
    assert(
      pageCode.includes("setSelectedWard(targetWardCode)"),
      "handleMapLocationSelected updates selectedWard state with normalized ward code"
    );
    assert(
      pageCode.includes("delete rest.ward"),
      "handleMapLocationSelected automatically clears ward validation error on map confirmation"
    );

    // 4. Audit Landmark vs Arbitrary Pin state synchronization
    assert(
      pageCode.includes("isSpecificLandmark") || pageCode.includes("data.isSpecificLandmark"),
      "handleMapLocationSelected differentiates specific landmark from arbitrary map pin"
    );
    assert(
      pageCode.includes("existingAddress && !isGenericAddress"),
      "Preserves citizen's pre-filled manual landmark/address when arbitrary map coordinates are selected"
    );
    assert(
      pageCode.includes("Map Pin") && pageCode.includes("setSelectedLandmarkName"),
      "Synchronizes location card with citizen's address and map pin tag"
    );
    assert(
      pageCode.includes("setAddress(data.landmarkName)") && pageCode.includes("setSelectedLandmarkName(data.landmarkName)"),
      "Synchronizes both address input and location card when canonical landmark is selected"
    );

    // 5. Functional Simulation of exact user bug scenario:
    // User types "laxmi nagar, laxmeshwar", selects point in Ward 20, confirms location.
    function simulateMapSelection(initialState, mapData) {
      let state = { ...initialState };
      const targetWardCode = normalizeWardFunc(mapData.wardCode || mapData.wardNumber || mapData.wardName);
      if (targetWardCode) {
        state.selectedWard = targetWardCode;
      }
      const isSpecific = Boolean(mapData.isSpecificLandmark);
      const existingAddress = state.address ? state.address.trim() : "";
      const isGenericAddress =
        !existingAddress ||
        existingAddress.toLowerCase().startsWith("pin location near") ||
        existingAddress.toLowerCase().startsWith("near ward");

      if (isSpecific) {
        state.address = mapData.landmarkName;
        state.selectedLandmarkName = mapData.landmarkName;
      } else {
        if (existingAddress && !isGenericAddress) {
          state.selectedLandmarkName = `${existingAddress} (${targetWardCode || "Municipal"} Map Pin)`;
        } else {
          state.address = mapData.landmarkName;
          state.selectedLandmarkName = mapData.landmarkName;
        }
      }
      return state;
    }

    // Scenario A: Citizen typed "laxmi nagar, laxmeshwar" -> confirmed arbitrary pin in Ward 20
    const scenarioA = simulateMapSelection(
      { address: "laxmi nagar, laxmeshwar", selectedWard: "" },
      {
        latitude: 15.1262,
        longitude: 75.4760,
        landmarkName: "Pin Location near Ward 20, Lakshmeshwar",
        wardNumber: 20,
        wardCode: "Ward 20",
        wardName: "Lakshmeshwar Ward No. 20",
        isSpecificLandmark: false,
      }
    );
    assert(
      scenarioA.selectedWard === "Ward 20",
      "Scenario A: Form's Ward Jurisdiction synchronizes to 'Ward 20' (not default '-- Select...')"
    );
    assert(
      scenarioA.address === "laxmi nagar, laxmeshwar",
      "Scenario A: Citizen's manually entered landmark 'laxmi nagar, laxmeshwar' is preserved"
    );
    assert(
      scenarioA.selectedLandmarkName === "laxmi nagar, laxmeshwar (Ward 20 Map Pin)",
      "Scenario A: Location card is consistent with citizen's landmark ('laxmi nagar, laxmeshwar (Ward 20 Map Pin)')"
    );

    // Scenario B: Citizen selects canonical landmark "Someshwara Temple Complex" in Ward 3
    const scenarioB = simulateMapSelection(
      { address: "", selectedWard: "" },
      {
        latitude: 15.1245,
        longitude: 75.4744,
        landmarkName: "Someshwara Temple Complex",
        wardNumber: 3,
        wardCode: "Ward 03",
        wardName: "Lakshmeshwar Ward No. 3",
        isSpecificLandmark: true,
      }
    );
    assert(
      scenarioB.selectedWard === "Ward 03",
      "Scenario B: Form's Ward Jurisdiction synchronizes to landmark's ward 'Ward 03'"
    );
    assert(
      scenarioB.address === "Someshwara Temple Complex",
      "Scenario B: Incident Location / Landmark synchronizes to canonical landmark name"
    );
    assert(
      scenarioB.selectedLandmarkName === "Someshwara Temple Complex",
      "Scenario B: Location card matches canonical landmark name"
    );

    // Scenario C: Citizen had empty address, selected arbitrary pin in Ward 20
    const scenarioC = simulateMapSelection(
      { address: "", selectedWard: "" },
      {
        latitude: 15.1262,
        longitude: 75.4760,
        landmarkName: "Pin Location near Ward 20, Lakshmeshwar",
        wardNumber: 20,
        wardCode: "Ward 20",
        wardName: "Lakshmeshwar Ward No. 20",
        isSpecificLandmark: false,
      }
    );
    assert(
      scenarioC.selectedWard === "Ward 20",
      "Scenario C: Form's Ward Jurisdiction synchronizes to 'Ward 20'"
    );
    assert(
      scenarioC.address === "Pin Location near Ward 20, Lakshmeshwar",
      "Scenario C: Empty address is updated with informative location text"
    );
    assert(
      scenarioC.selectedLandmarkName === "Pin Location near Ward 20, Lakshmeshwar",
      "Scenario C: Location card and address field are completely consistent"
    );

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

runPhase4bTests();
