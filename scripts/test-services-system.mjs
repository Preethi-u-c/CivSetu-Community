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
  console.log(" Citizen Services Directory: Public API, Web Pages & Admin CRUD");
  console.log("==================================================================\n");

  // 1. Check Public Services API
  console.log("--- Section 1: Public Services API & Filtering ---");
  const pubRes = await fetch(`${BASE_URL}/api/services`);
  assert(pubRes.status === 200, "GET /api/services returns HTTP 200");
  const pubJson = await pubRes.json();
  assert(pubJson.success === true, "Response has success: true");
  assert(Array.isArray(pubJson.data), "Response contains data array of services");
  assert(pubJson.count >= 8, "All 8 default municipal services returned");

  // Check required fields based on user specification
  const firstService = pubJson.data?.[0];
  assert(Boolean(firstService?.id), "Service has valid id");
  assert(Boolean(firstService?.name), "Service has name");
  assert(Boolean(firstService?.department), "Service has department");
  assert(Boolean(firstService?.category), "Service has category");
  assert(Boolean(firstService?.description), "Service has description");
  assert(Boolean(firstService?.eligibility), "Service has eligibility");
  assert(Array.isArray(firstService?.requiredDocuments), "Service has requiredDocuments array");
  assert(firstService?.requiredDocuments.length > 0, "Service has required documents listed");
  assert(Boolean(firstService?.procedure), "Service has procedure");
  assert(Boolean(firstService?.expectedTimeline), "Service has expectedTimeline (SLA)");
  assert(Boolean(firstService?.contact), "Service has contact");
  assert(firstService?.status === "Active", "Public service has status Active");

  // Verify all 8 example types requested by the user are present
  const categoriesPresent = new Set(pubJson.data.map((s) => s.category));
  assert(categoriesPresent.has("Water Services"), "Water Services category present");
  assert(categoriesPresent.has("Sanitation & Waste Management"), "Sanitation & Waste Management category present");
  assert(categoriesPresent.has("Property & Khata Services"), "Property & Khata Services category present");
  assert(categoriesPresent.has("Birth & Death Registry"), "Birth & Death Registry category present");
  assert(categoriesPresent.has("Certificates & Licenses"), "Certificates & Licenses category present");
  assert(categoriesPresent.has("Municipal Applications"), "Municipal Applications category present");
  assert(categoriesPresent.has("Grievance Services"), "Grievance Services category present");
  assert(categoriesPresent.has("Emergency Contacts"), "Emergency Contacts category present");

  // Category filter
  const catRes = await fetch(`${BASE_URL}/api/services?category=Water%20Services`);
  assert(catRes.status === 200, "GET /api/services?category=Water Services returns HTTP 200");
  const catJson = await catRes.json();
  assert(catJson.data?.every((s) => s.category === "Water Services"), "Filtered services match category");

  // Department filter
  const deptRes = await fetch(`${BASE_URL}/api/services?department=Water%20Supply%20%26%20Engineering%20Section`);
  assert(deptRes.status === 200, "GET /api/services?department=Water Supply & Engineering Section returns HTTP 200");
  const deptJson = await deptRes.json();
  assert(deptJson.data?.every((s) => s.department === "Water Supply & Engineering Section"), "Filtered services match department");

  // Keyword search
  const searchRes = await fetch(`${BASE_URL}/api/services?search=Khata`);
  assert(searchRes.status === 200, "GET /api/services?search=Khata returns HTTP 200");
  const searchJson = await searchRes.json();
  assert(searchJson.count >= 1, "Search for 'Khata' returns records");

  // Emergency services category lookup
  const emerRes = await fetch(`${BASE_URL}/api/services?category=Emergency%20Contacts`);
  assert(emerRes.status === 200, "GET /api/services?category=Emergency Contacts returns HTTP 200");
  const emerJson = await emerRes.json();
  assert(emerJson.data?.every((s) => s.category === "Emergency Contacts"), "Filtered services have category Emergency Contacts");
  assert(emerJson.count >= 1, "At least one emergency contacts service returned");

  // 2. Public Single Service Details API
  console.log("\n--- Section 2: Public Single Service Detail API ---");
  const testServiceId = firstService.id;
  const detailRes = await fetch(`${BASE_URL}/api/services/${testServiceId}`);
  assert(detailRes.status === 200, `GET /api/services/${testServiceId} returns HTTP 200`);
  const detailJson = await detailRes.json();
  assert(detailJson.success === true, "Detail response has success: true");
  assert(detailJson.data?.id === testServiceId, "Detail matches requested service ID");

  // Non-existent ID returns 404
  const notFoundRes = await fetch(`${BASE_URL}/api/services/SRV-NONEXISTENT-9999`);
  assert(notFoundRes.status === 404, "GET /api/services/SRV-NONEXISTENT returns HTTP 404");

  // 3. Admin Authentication & Security
  console.log("\n--- Section 3: Admin Authorization & Security ---");
  const unauthListRes = await fetch(`${BASE_URL}/api/admin/services`);
  assert(unauthListRes.status === 401, "GET /api/admin/services without credentials returns HTTP 401 Unauthorized");

  const unauthPostRes = await fetch(`${BASE_URL}/api/admin/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Unauthorized Service Creation" }),
  });
  assert(unauthPostRes.status === 401, "POST /api/admin/services without credentials returns HTTP 401 Unauthorized");

  // 4. Admin Login & Authorized Operations
  console.log("\n--- Section 4: Admin Session Login & CRUD Lifecycle ---");
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usernameOrEmail: "admin",
      password: "Admin@Pass2026",
    }),
  });
  assert(loginRes.status === 200, "Admin login with default credentials returns HTTP 200");
  const setCookie = loginRes.headers.get("set-cookie") || "";
  assert(Boolean(setCookie), "Admin login returns session cookie");
  const adminCookieHeader = setCookie.split(";")[0];

  const adminHeaders = {
    Cookie: adminCookieHeader,
    "Content-Type": "application/json",
  };

  // Admin GET with stats
  const adminListRes = await fetch(`${BASE_URL}/api/admin/services`, { headers: adminHeaders });
  assert(adminListRes.status === 200, "GET /api/admin/services with admin session returns HTTP 200");
  const adminListJson = await adminListRes.json();
  assert(adminListJson.success === true, "Admin services response has success: true");
  assert(Boolean(adminListJson.stats), "Admin services response includes stats object");
  assert(typeof adminListJson.stats.total === "number", "Stats includes total count");
  assert(typeof adminListJson.stats.active === "number", "Stats includes active count");
  assert(typeof adminListJson.stats.drafts === "number", "Stats includes drafts count");
  assert(typeof adminListJson.stats.suspended === "number", "Stats includes suspended count");

  // Admin POST create service
  const newServiceData = {
    name: "Underground Drainage (UGD) Connection Authorization",
    category: "Sanitation & Waste Management",
    department: "Public Health & Sanitation Section",
    description: "Application for connecting residential or commercial premises to the Lakshmeshwar Town UGD network with engineer site inspection.",
    eligibility: "Owner of registered property within Lakshmeshwar TMC jurisdiction having valid building permission.",
    requiredDocuments: [
      "Property Tax Paid Receipt (Current Year)",
      "Site Layout Plan / Building Approval",
      "Aadhaar Card of Property Owner",
      "Plumber Certificate & Route Sketch",
    ],
    procedure: "1. Apply online or at TMC Seva Kendra with required documents.\n2. Assistant Executive Engineer (UGD) site survey within 3 working days.\n3. Payment of connection fee & road restoration deposit at municipal treasury.\n4. Sanction letter & official connection hookup under junior engineer supervision.",
    expectedTimeline: "7 working days from fee payment",
    fee: "₹1,500 connection fee + road restoration charges",
    onlineApplicationLink: "https://sevasindhu.karnataka.gov.in",
    contact: "TMC Sanitary & Drainage Section, Phone: 08378-220029, Email: ugd.lakshmeshwar@karnataka.gov.in",
    status: "Active",
  };

  const createRes = await fetch(`${BASE_URL}/api/admin/services`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(newServiceData),
  });
  assert(createRes.status === 201, "POST /api/admin/services creates service and returns HTTP 201");
  const createJson = await createRes.json();
  assert(createJson.success === true, "Service creation successful");
  const createdServiceId = createJson.data?.id;
  assert(Boolean(createdServiceId), `Created service has ID: ${createdServiceId}`);
  assert(createJson.data?.name === newServiceData.name, "Created service matches submitted name");
  assert(createJson.data?.requiredDocuments.length === 4, "All 4 required documents stored in array");

  // Admin GET single service
  const adminGetRes = await fetch(`${BASE_URL}/api/admin/services/${createdServiceId}`, {
    headers: adminHeaders,
  });
  assert(adminGetRes.status === 200, `GET /api/admin/services/${createdServiceId} returns HTTP 200`);
  const adminGetJson = await adminGetRes.json();
  assert(adminGetJson.data?.id === createdServiceId, "Retrieved service matches ID");

  // Admin PATCH update service
  const patchRes = await fetch(`${BASE_URL}/api/admin/services/${createdServiceId}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({
      expectedTimeline: "5 working days from fee payment (Fast Track)",
      status: "Active",
    }),
  });
  assert(patchRes.status === 200, `PATCH /api/admin/services/${createdServiceId} returns HTTP 200`);
  const patchJson = await patchRes.json();
  assert(patchJson.data?.expectedTimeline.includes("Fast Track"), "Expected timeline updated successfully");

  // Verify in public search
  const pubVerifyRes = await fetch(`${BASE_URL}/api/services?search=Drainage`);
  const pubVerifyJson = await pubVerifyRes.json();
  assert(
    pubVerifyJson.data?.some((s) => s.id === createdServiceId),
    "Updated service appears in public search query"
  );

  // Admin DELETE service
  const deleteRes = await fetch(`${BASE_URL}/api/admin/services/${createdServiceId}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  assert(deleteRes.status === 200, `DELETE /api/admin/services/${createdServiceId} returns HTTP 200`);

  // Verify deleted from public
  const verifyDeleteRes = await fetch(`${BASE_URL}/api/services/${createdServiceId}`);
  assert(verifyDeleteRes.status === 404, "Deleted service returns HTTP 404 on public endpoint");

  // 5. Public and Admin Web Page Routes
  console.log("\n--- Section 5: Web Page HTTP Status Checks ---");
  const pubPageRes = await fetch(`${BASE_URL}/services`);
  assert(pubPageRes.status === 200, "GET /services returns HTTP 200");

  const pubDetailRes = await fetch(`${BASE_URL}/services/${testServiceId}`);
  assert(pubDetailRes.status === 200, `GET /services/${testServiceId} returns HTTP 200`);

  const redirectRes = await fetch(`${BASE_URL}/citizen-services`, { redirect: "manual" });
  assert(
    redirectRes.status === 307 || redirectRes.status === 308 || redirectRes.status === 200,
    "GET /citizen-services handles redirect or loads successfully"
  );

  const adminPageRes = await fetch(`${BASE_URL}/admin/services`, {
    headers: { Cookie: adminCookieHeader },
  });
  assert(adminPageRes.status === 200, "GET /admin/services returns HTTP 200 with admin session");

  console.log("\n==================================================================");
  console.log(` Citizen Services Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
