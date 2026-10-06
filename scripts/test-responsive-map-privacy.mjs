/**
 * test-responsive-map-privacy.mjs
 * Verification suite for:
 * 17. Mobile Responsive Design (320px, 375px, 390px, 430px, 768px, 1024px, 1280px+)
 * 18. Real Map / GPS Privacy (Multi-provider map, 23 wards, municipal landmarks, privacy fuzzing)
 */

import fs from "fs";
import path from "path";
import assert from "assert";

const BASE_DIR = process.cwd();

console.log("===============================================================================");
console.log("  CIVSETU: MOBILE RESPONSIVE DESIGN & REAL MAP/GPS PRIVACY VERIFICATION");
console.log("===============================================================================\n");

let passed = 0;
let total = 0;

function runTest(description, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] #${total}: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] #${total}: ${description}`);
    console.error(`         ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// SECTION 1: REAL MAP & GPS PRIVACY (Feature 18)
// -----------------------------------------------------------------------------
console.log("--- 1. REAL MAP & GPS PRIVACY TESTS ---");

runTest("wardsData contains all 23 Lakshmeshwar wards with Kannada and councillors", () => {
  const wardsContent = fs.readFileSync(path.join(BASE_DIR, "src/data/wards.ts"), "utf-8");
  assert.ok(wardsContent.includes("wardNumber: 23"), "Should contain Ward 23");
  assert.ok(wardsContent.includes("nameKn:"), "Should contain Kannada names");
  assert.ok(wardsContent.includes("representative:"), "Should contain councillor names");
  assert.ok(wardsContent.includes("lat:"), "Should contain centroid latitude");
  assert.ok(wardsContent.includes("lng:"), "Should contain centroid longitude");
});

runTest("WardMapSection supports multi-provider: Municipal GIS, OpenStreetMap, and Google", () => {
  const mapContent = fs.readFileSync(path.join(BASE_DIR, "src/components/WardMap/WardMapSection.tsx"), "utf-8");
  assert.ok(mapContent.includes('"gis"'), "Should support 23 Wards GIS");
  assert.ok(mapContent.includes('"osm"'), "Should support OpenStreetMap");
  assert.ok(mapContent.includes('"google"'), "Should support Google Maps");
  assert.ok(mapContent.includes("openstreetmap.org/export/embed.html"), "Should have OpenStreetMap slippy map embed");
});

runTest("WardMapSection renders SVG boundaries and centroids for all 23 wards", () => {
  const mapContent = fs.readFileSync(path.join(BASE_DIR, "src/components/WardMap/WardMapSection.tsx"), "utf-8");
  for (let w = 1; w <= 23; w++) {
    assert.ok(mapContent.includes(`wardNumber: ${w}`), `Should contain boundary geometry for ward ${w}`);
  }
});

runTest("Official municipal landmarks include core civic infrastructure with GPS", () => {
  const pickerContent = fs.readFileSync(path.join(BASE_DIR, "src/components/Complaints/MunicipalMapPickerModal.tsx"), "utf-8");
  assert.ok(pickerContent.includes("someshwara"), "Should include Someshwara temple");
  assert.ok(pickerContent.includes("tmc_office"), "Should include TMC Municipal Council");
  assert.ok(pickerContent.includes("govt_hospital"), "Should include Govt Hospital");
  assert.ok(pickerContent.includes("bus_stand"), "Should include KSRTC Bus Stand");
  assert.ok(pickerContent.includes("police_station"), "Should include Police Station");
  assert.ok(pickerContent.includes("taluk_panchayat"), "Should include Taluk Panchayat");
  assert.ok(pickerContent.includes("fire_station"), "Should include Fire Station");
  assert.ok(pickerContent.includes("hescom_station"), "Should include Electrical Substation");
});

runTest("Complaint form provides explicit Location Access & Privacy Notice modal", () => {
  const complaintFormContent = fs.readFileSync(path.join(BASE_DIR, "src/app/complaints/new/page.tsx"), "utf-8");
  assert.ok(complaintFormContent.includes("locationPrivacyModalOpen"), "Should have privacy notice state");
  assert.ok(complaintFormContent.includes("Location Access & Privacy Notice"), "Should have modal title");
  assert.ok(complaintFormContent.includes("Neighborhood Privacy Mode (~100m)"), "Should offer neighborhood privacy option");
  assert.ok(complaintFormContent.includes("Precise Infrastructure Mode"), "Should offer precise option for public assets");
});

runTest("Location capture preserves domestic privacy by fuzzing coordinates to ~100m", () => {
  const complaintFormContent = fs.readFileSync(path.join(BASE_DIR, "src/app/complaints/new/page.tsx"), "utf-8");
  assert.ok(complaintFormContent.includes("lat.toFixed(3)"), "Should fuzz latitude to 3 decimal places (~100m)");
  assert.ok(complaintFormContent.includes("lng.toFixed(3)"), "Should fuzz longitude to 3 decimal places (~100m)");
  assert.ok(complaintFormContent.includes("Neighborhood Privacy"), "Should display privacy indicator in UI");
});

runTest("MunicipalMapPickerModal contains privacy toggle and OpenStreetMap tab", () => {
  const pickerContent = fs.readFileSync(path.join(BASE_DIR, "src/components/Complaints/MunicipalMapPickerModal.tsx"), "utf-8");
  assert.ok(pickerContent.includes("privacyMode"), "Should support privacyMode");
  assert.ok(pickerContent.includes("Protect Residential Privacy"), "Should have residential privacy toggle");
  assert.ok(pickerContent.includes("mapView === \"osm\""), "Should have OpenStreetMap live view tab");
});

runTest("Complaints POST API enforces server-side privacy-preserving coordinate sanitization", () => {
  const apiContent = fs.readFileSync(path.join(BASE_DIR, "src/app/api/complaints/route.ts"), "utf-8");
  assert.ok(apiContent.includes("privacyMode"), "API should parse privacyMode");
  assert.ok(apiContent.includes('privacyMode === "fuzzed" ? parseFloat(lat.toFixed(3))'), "Server should enforce 3 decimal fuzzing");
  assert.ok(apiContent.includes('privacyMode === "ward_only"'), "Server should support stripping coordinates completely");
});

// -----------------------------------------------------------------------------
// SECTION 2: MOBILE RESPONSIVE DESIGN (Feature 17)
// -----------------------------------------------------------------------------
console.log("\n--- 2. MOBILE RESPONSIVE DESIGN TESTS ---");

runTest("NavBar uses xl breakpoint to prevent link overflow on 768px and 1024px tablets", () => {
  const navContent = fs.readFileSync(path.join(BASE_DIR, "src/components/Navigation/NavBar.tsx"), "utf-8");
  assert.ok(navContent.includes("hidden xl:flex"), "Desktop navigation should use xl breakpoint");
  assert.ok(navContent.includes("flex xl:hidden"), "Mobile/tablet hamburger button should use xl breakpoint");
  assert.ok(navContent.includes("xl:hidden border-t"), "Mobile/tablet drawer should use xl breakpoint");
});

runTest("MainHeader scales gracefully for 320px screens with responsive text and emblem", () => {
  const headerContent = fs.readFileSync(path.join(BASE_DIR, "src/components/Header/MainHeader.tsx"), "utf-8");
  assert.ok(headerContent.includes("w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"), "Emblem should scale from 48px on 320px screens");
  assert.ok(headerContent.includes("text-2xl sm:text-3xl md:text-4xl"), "Portal title should scale down on 320px screens");
});

runTest("AdminLayout includes min-w-0 on main container to contain wide data tables", () => {
  const adminContent = fs.readFileSync(path.join(BASE_DIR, "src/app/admin/layout.tsx"), "utf-8");
  assert.ok(adminContent.includes("min-w-0 w-full"), "Admin main container must have min-w-0 w-full");
});

runTest("AuthorityDashboard includes min-w-0 on main container to contain dashboard views", () => {
  const authContent = fs.readFileSync(path.join(BASE_DIR, "src/app/authority/dashboard/page.tsx"), "utf-8");
  assert.ok(authContent.includes("min-w-0 w-full"), "Authority dashboard main container must have min-w-0 w-full");
});

runTest("Authority dashboard renders responsive mobile card view for screens under lg", () => {
  const authContent = fs.readFileSync(path.join(BASE_DIR, "src/app/authority/dashboard/page.tsx"), "utf-8");
  assert.ok(authContent.includes("hidden lg:block overflow-x-auto"), "Desktop table should be hidden below lg");
  assert.ok(authContent.includes("lg:hidden divide-y"), "Mobile card view should be active below lg");
});

runTest("All data tables are wrapped in overflow-x-auto for small screen horizontal safety", () => {
  const filesWithTables = [
    "src/app/admin/citizens/page.tsx",
    "src/app/admin/complaints/page.tsx",
    "src/app/admin/events/page.tsx",
    "src/app/admin/news/page.tsx",
    "src/app/admin/schemes/page.tsx",
    "src/app/admin/services/page.tsx",
    "src/app/city-summary/page.tsx",
  ];
  for (const relPath of filesWithTables) {
    const content = fs.readFileSync(path.join(BASE_DIR, relPath), "utf-8");
    assert.ok(content.includes("overflow-x-auto"), `${relPath} must wrap table in overflow-x-auto`);
  }
});

runTest("Modals define max-h and overflow-y-auto to avoid off-screen overflow on mobile", () => {
  const modals = [
    "src/components/AI/AskCivSetuModal.tsx",
    "src/components/Complaints/MunicipalMapPickerModal.tsx",
  ];
  for (const relPath of modals) {
    const content = fs.readFileSync(path.join(BASE_DIR, relPath), "utf-8");
    assert.ok(content.includes("overflow-"), `${relPath} must define overflow scroll handling`);
    assert.ok(content.includes("max-h-"), `${relPath} must limit max-height to viewport`);
  }
});

runTest("globals.css defines responsive normalization for mobile screens", () => {
  const cssContent = fs.readFileSync(path.join(BASE_DIR, "src/app/globals.css"), "utf-8");
  assert.ok(cssContent.includes("ticket-id-break"), "Should define break-all helper for ticket IDs");
  assert.ok(cssContent.includes("table-responsive-container"), "Should define table scrolling touch helper");
});

console.log("\n===============================================================================");
console.log(`  VERIFICATION RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
console.log("===============================================================================\n");

if (passed !== total) {
  process.exit(1);
}
