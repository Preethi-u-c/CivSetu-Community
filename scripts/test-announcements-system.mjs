const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  console.log("==================================================================");
  console.log(" Public Information Module: Announcements & Ward Targeting Tests");
  console.log("==================================================================\n");

  // 1. Check Public API
  console.log("--- Section 1: Public Announcements API & Filtering ---");
  const pubRes = await fetch(`${BASE_URL}/api/notices`);
  assert(pubRes.status === 200, "GET /api/notices returns HTTP 200");
  const pubJson = await pubRes.json();
  assert(pubJson.success === true, "Response has success: true");
  assert(Array.isArray(pubJson.data), "Response contains data array of notices");
  assert(pubJson.count >= 6, "At least 6 initial seed notices returned");

  // Check specific categories
  const categories = pubJson.data?.map((n) => n.category) || [];
  assert(categories.includes("Water Supply Announcements"), "Includes 'Water Supply Announcements' category");
  assert(categories.includes("Electricity Interruptions"), "Includes 'Electricity Interruptions' category");
  assert(categories.includes("Sanitation Notices"), "Includes 'Sanitation Notices' category");
  assert(categories.includes("Road Work"), "Includes 'Road Work' category");
  assert(categories.includes("Emergency Alerts"), "Includes 'Emergency Alerts' category");
  assert(categories.includes("Municipal Announcements"), "Includes 'Municipal Announcements' category");

  // Emergency filter
  const emRes = await fetch(`${BASE_URL}/api/notices?isEmergency=true`);
  assert(emRes.status === 200, "GET /api/notices?isEmergency=true returns HTTP 200");
  const emJson = await emRes.json();
  assert(emJson.data?.every((n) => n.isEmergency === true), "All returned notices have isEmergency === true");

  // Ward targeting filter
  const wardRes = await fetch(`${BASE_URL}/api/notices?ward=Ward%2003`);
  assert(wardRes.status === 200, "GET /api/notices?ward=Ward 03 returns HTTP 200");
  const wardJson = await wardRes.json();
  assert(
    wardJson.data?.every(
      (n) =>
        n.targetScope === "Entire municipality" ||
        n.targetScope === "Entire Municipality" ||
        n.targetScope === "All citizens" ||
        n.targetScope === "Emergency / city-wide" ||
        n.isEmergency ||
        (n.targetWards && n.targetWards.includes("Ward 03"))
    ),
    "Ward filter returns city-wide notices and notices targeting Ward 03"
  );

  // 2. Ward Targeting Deep-Dive: All 4 Scopes
  console.log("\n--- Section 2: Ward-Based Announcement Targeting (All 4 Scopes) ---");

  // Admin login to seed specific test notices for each scope
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernameOrEmail: "admin", password: "Admin@Pass2026" }),
  });
  assert(loginRes.status === 200, "Admin login returns HTTP 200");
  const cookie = loginRes.headers.get("set-cookie") || "";
  const adminCookieHeader = cookie.split(";")[0];

  const createdNoticeIds = [];

  // Scope 1: "All citizens"
  const allCitizensRes = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookieHeader },
    body: JSON.stringify({
      title: "Lakshmeshwar Property Tax Filing Open For All Citizens",
      description: "Annual municipal tax assessment window is now open for all property owners across all wards.",
      category: "Municipal Announcements",
      targetScope: "All citizens",
      priority: "Normal",
      status: "Published",
    }),
  });
  assert(allCitizensRes.status === 201, "Scope 1: Created 'All citizens' notice (HTTP 201)");
  const allCitizensData = (await allCitizensRes.json()).data;
  createdNoticeIds.push(allCitizensData.id);

  // Scope 2: "Specific ward(s)"
  const specificWardRes = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookieHeader },
    body: JSON.stringify({
      title: "Ward 07 Pipeline Maintenance Notice",
      description: "Scheduled valve replacement in Ward 07 and Ward 08 between 10 AM and 2 PM.",
      category: "Water Supply Announcements",
      targetScope: "Specific ward(s)",
      targetWards: "Ward 07, Ward 08",
      priority: "High",
      status: "Published",
    }),
  });
  assert(specificWardRes.status === 201, "Scope 2: Created 'Specific ward(s)' notice (HTTP 201)");
  const specificWardData = (await specificWardRes.json()).data;
  createdNoticeIds.push(specificWardData.id);

  // Scope 3: "Entire municipality"
  const entireMuniRes = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookieHeader },
    body: JSON.stringify({
      title: "City-Wide Solid Waste Segregation Campaign",
      description: "TMC announces strict wet and dry waste segregation rules across the entire municipality.",
      category: "Sanitation Notices",
      targetScope: "Entire municipality",
      priority: "Normal",
      status: "Published",
    }),
  });
  assert(entireMuniRes.status === 201, "Scope 3: Created 'Entire municipality' notice (HTTP 201)");
  const entireMuniData = (await entireMuniRes.json()).data;
  createdNoticeIds.push(entireMuniData.id);

  // Scope 4: "Emergency / city-wide"
  const emergencyRes = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookieHeader },
    body: JSON.stringify({
      title: "Urgent Storm and Flash Flood Warning",
      description: "Heavy rain advisory issued. Emergency control room activated for all 23 wards.",
      category: "Emergency Alerts",
      targetScope: "Emergency / city-wide",
      status: "Published",
    }),
  });
  assert(emergencyRes.status === 201, "Scope 4: Created 'Emergency / city-wide' notice (HTTP 201)");
  const emergencyData = (await emergencyRes.json()).data;
  createdNoticeIds.push(emergencyData.id);

  // Verify Scope 4 auto-defaults
  assert(emergencyData.isEmergency === true, "Scope 4: isEmergency automatically set to true");
  assert(emergencyData.priority === "Urgent", "Scope 4: priority automatically set to 'Urgent'");

  // Verification 2A: Query Ward 07 citizen perspective
  const ward7Res = await fetch(`${BASE_URL}/api/notices?ward=Ward%2007`);
  const ward7Json = await ward7Res.json();
  const ward7Ids = ward7Json.data?.map((n) => n.id) || [];
  assert(ward7Ids.includes(specificWardData.id), "Ward 07 citizen receives notice targeted to Ward 07");
  assert(ward7Ids.includes(allCitizensData.id), "Ward 07 citizen receives 'All citizens' broadcast");
  assert(ward7Ids.includes(entireMuniData.id), "Ward 07 citizen receives 'Entire municipality' notice");
  assert(ward7Ids.includes(emergencyData.id), "Ward 07 citizen receives 'Emergency / city-wide' broadcast");

  // Verification 2B: Query Ward 02 citizen perspective (should NOT see Ward 07 notice)
  const ward2Res = await fetch(`${BASE_URL}/api/notices?ward=Ward%2002`);
  const ward2Json = await ward2Res.json();
  const ward2Ids = ward2Json.data?.map((n) => n.id) || [];
  assert(!ward2Ids.includes(specificWardData.id), "Ward 02 citizen does NOT receive notice targeted to Ward 07");
  assert(ward2Ids.includes(allCitizensData.id), "Ward 02 citizen still receives 'All citizens' notice");
  assert(ward2Ids.includes(entireMuniData.id), "Ward 02 citizen still receives 'Entire municipality' notice");
  assert(ward2Ids.includes(emergencyData.id), "Ward 02 citizen still receives 'Emergency / city-wide' alert");

  // Verification 2C: onlyWard=true filter
  const onlyWard7Res = await fetch(`${BASE_URL}/api/notices?ward=Ward%2007&onlyWard=true`);
  const onlyWard7Json = await onlyWard7Res.json();
  const onlyWard7Ids = onlyWard7Json.data?.map((n) => n.id) || [];
  assert(onlyWard7Ids.includes(specificWardData.id), "onlyWard=true includes notice specifically targeting Ward 07");
  assert(!onlyWard7Ids.includes(entireMuniData.id), "onlyWard=true excludes general 'Entire municipality' notices");
  assert(!onlyWard7Ids.includes(allCitizensData.id), "onlyWard=true excludes general 'All citizens' notices");

  // Verification 2D: Single digit unpadded ward matching (ward=7)
  const unpaddedRes = await fetch(`${BASE_URL}/api/notices?ward=7`);
  const unpaddedJson = await unpaddedRes.json();
  const unpaddedIds = unpaddedJson.data?.map((n) => n.id) || [];
  assert(unpaddedIds.includes(specificWardData.id), "ward=7 successfully matches notice targeted to 'Ward 07, Ward 08'");

  // Clean up the 4 test notices
  for (const id of createdNoticeIds) {
    await fetch(`${BASE_URL}/api/admin/notices/${id}`, {
      method: "DELETE",
      headers: { Cookie: adminCookieHeader },
    });
  }

  // 3. Check Public Web Pages
  console.log("\n--- Section 3: Public Web Display Pages ---");
  const noticesPageRes = await fetch(`${BASE_URL}/notices`);
  assert(noticesPageRes.status === 200, "/notices page returns HTTP 200");

  const noticesWardQueryRes = await fetch(`${BASE_URL}/notices?ward=Ward%2003`);
  assert(noticesWardQueryRes.status === 200, "/notices?ward=Ward 03 returns HTTP 200");

  const homePageRes = await fetch(`${BASE_URL}/`);
  assert(homePageRes.status === 200, "Homepage / returns HTTP 200");

  const dashboardPageRes = await fetch(`${BASE_URL}/dashboard`);
  assert(dashboardPageRes.status === 200, "Citizen /dashboard page returns HTTP 200");

  const sampleNoticeId = pubJson.data?.[0]?.id;
  if (sampleNoticeId) {
    const detailRes = await fetch(`${BASE_URL}/notices/${sampleNoticeId}`);
    assert(detailRes.status === 200, `/notices/${sampleNoticeId} returns HTTP 200`);
  }

  // 4. Admin Management CRUD Lifecycle
  console.log("\n--- Section 4: Admin Management CRUD Lifecycle ---");
  const testTitle = `Automated Test Announcement ${Date.now()}`;
  const createRes = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookieHeader },
    body: JSON.stringify({
      title: testTitle,
      description: "Detailed description for automated verification test regarding power grid maintenance.",
      category: "Electricity Interruptions",
      targetScope: "Specific ward(s)",
      targetWards: "Ward 11, Ward 12",
      priority: "High",
      isEmergency: false,
      status: "Published",
      publishDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000).toISOString(),
    }),
  });

  const createJson = await createRes.json();
  assert(createRes.status === 201, `POST /api/admin/notices creates notice with HTTP 201`);
  const createdNoticeId = createJson?.data?.id;
  assert(Boolean(createdNoticeId), `Created notice returned ID: #${createdNoticeId}`);
  assert(createJson?.data?.category === "Electricity Interruptions", "Category correctly persisted");
  assert(createJson?.data?.priority === "High", "Priority correctly persisted");
  assert(createJson?.data?.targetWards === "Ward 11, Ward 12", "Target wards correctly persisted");

  // Admin Update Notice
  const updateRes = await fetch(`${BASE_URL}/api/admin/notices/${createdNoticeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookieHeader },
    body: JSON.stringify({
      priority: "Urgent",
      isEmergency: true,
      status: "Published",
    }),
  });

  const updateJson = await updateRes.json();
  assert(updateRes.status === 200, `PATCH /api/admin/notices/${createdNoticeId} returns HTTP 200`);
  assert(updateJson?.data?.priority === "Urgent", "Priority updated to Urgent");
  assert(updateJson?.data?.isEmergency === true, "Emergency flag set to true");

  // Admin Delete Notice
  const deleteRes = await fetch(`${BASE_URL}/api/admin/notices/${createdNoticeId}`, {
    method: "DELETE",
    headers: { Cookie: adminCookieHeader },
  });
  assert(deleteRes.status === 200, `DELETE /api/admin/notices/${createdNoticeId} returns HTTP 200`);

  // Verify deletion
  const verifyDeleteRes = await fetch(`${BASE_URL}/api/admin/notices/${createdNoticeId}`, {
    headers: { Cookie: adminCookieHeader },
  });
  assert(verifyDeleteRes.status === 404, "Deleted notice returns HTTP 404");

  console.log("\n==================================================================");
  console.log(` Announcements & Ward Targeting Test Results:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
