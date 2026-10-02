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
  console.log(" Government Schemes Module: Public API, Web Pages & Admin CRUD");
  console.log("==================================================================\n");

  // 1. Check Public Schemes API
  console.log("--- Section 1: Public Schemes API & Filtering ---");
  const pubRes = await fetch(`${BASE_URL}/api/schemes`);
  assert(pubRes.status === 200, "GET /api/schemes returns HTTP 200");
  const pubJson = await pubRes.json();
  assert(pubJson.success === true, "Response has success: true");
  assert(Array.isArray(pubJson.data), "Response contains data array of schemes");
  assert(pubJson.count >= 1, "At least 1 scheme returned");

  // Check required fields
  const firstScheme = pubJson.data?.[0];
  assert(Boolean(firstScheme?.id), "Scheme has valid id");
  assert(Boolean(firstScheme?.name), "Scheme has name");
  assert(Boolean(firstScheme?.department), "Scheme has department");
  assert(Boolean(firstScheme?.category), "Scheme has category");
  assert(Boolean(firstScheme?.description), "Scheme has description");
  assert(Boolean(firstScheme?.eligibility), "Scheme has eligibility");
  assert(Array.isArray(firstScheme?.documentsRequired), "Scheme has documentsRequired array");
  assert(firstScheme?.documentsRequired.length > 0, "Scheme has required documents listed");
  assert(Boolean(firstScheme?.applicationProcess), "Scheme has applicationProcess");
  assert(Boolean(firstScheme?.benefits), "Scheme has benefits");
  assert(Boolean(firstScheme?.contactInfo), "Scheme has contactInfo");
  assert(firstScheme?.status === "Active", "Public scheme has status Active");

  // Category filter
  const catRes = await fetch(`${BASE_URL}/api/schemes?category=Housing%20%26%20Urban%20Development`);
  assert(catRes.status === 200, "GET /api/schemes?category=Housing & Urban Development returns HTTP 200");
  const catJson = await catRes.json();
  assert(catJson.data?.every((s) => s.category === "Housing & Urban Development"), "Filtered schemes match category");

  // Department filter
  const deptRes = await fetch(`${BASE_URL}/api/schemes?department=Directorate%20of%20Municipal%20Administration%20(DMA)`);
  assert(deptRes.status === 200, "GET /api/schemes?department=DMA returns HTTP 200");
  const deptJson = await deptRes.json();
  assert(deptJson.data?.every((s) => s.department.includes("Municipal Administration")), "Filtered schemes match department");

  // Keyword search
  const searchRes = await fetch(`${BASE_URL}/api/schemes?search=PM-SVANidhi`);
  assert(searchRes.status === 200, "GET /api/schemes?search=PM-SVANidhi returns HTTP 200");
  const searchJson = await searchRes.json();
  assert(searchJson.count >= 1, "Search for 'PM-SVANidhi' returns records");

  // 2. Public Single Scheme Details API
  console.log("\n--- Section 2: Public Single Scheme Detail API ---");
  const testSchemeId = firstScheme.id;
  const detailRes = await fetch(`${BASE_URL}/api/schemes/${testSchemeId}`);
  assert(detailRes.status === 200, `GET /api/schemes/${testSchemeId} returns HTTP 200`);
  const detailJson = await detailRes.json();
  assert(detailJson.success === true, "Detail response has success: true");
  assert(detailJson.data?.id === testSchemeId, "Detail matches requested scheme ID");

  // Non-existent ID returns 404
  const notFoundRes = await fetch(`${BASE_URL}/api/schemes/SCH-NONEXISTENT-9999`);
  assert(notFoundRes.status === 404, "GET /api/schemes/SCH-NONEXISTENT returns HTTP 404");

  // 3. Admin Authentication & Security
  console.log("\n--- Section 3: Admin Authorization & Security ---");
  const unauthListRes = await fetch(`${BASE_URL}/api/admin/schemes`);
  assert(unauthListRes.status === 401, "GET /api/admin/schemes without credentials returns HTTP 401 Unauthorized");

  const unauthPostRes = await fetch(`${BASE_URL}/api/admin/schemes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Hack scheme" }),
  });
  assert(unauthPostRes.status === 401, "POST /api/admin/schemes without credentials returns HTTP 401 Unauthorized");

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
  const adminListRes = await fetch(`${BASE_URL}/api/admin/schemes`, { headers: adminHeaders });
  assert(adminListRes.status === 200, "GET /api/admin/schemes with admin session returns HTTP 200");
  const adminListJson = await adminListRes.json();
  assert(adminListJson.success === true, "Admin schemes response has success: true");
  assert(Boolean(adminListJson.stats), "Admin schemes response includes stats object");
  assert(typeof adminListJson.stats.total === "number", "Stats includes total count");
  assert(typeof adminListJson.stats.active === "number", "Stats includes active count");
  assert(typeof adminListJson.stats.drafts === "number", "Stats includes drafts count");
  assert(typeof adminListJson.stats.closed === "number", "Stats includes closed count");

  // Admin POST create scheme
  const newSchemeData = {
    name: "Chief Minister's Urban Micro-Enterprise Grant 2026",
    department: "Skill Development, Entrepreneurship & Livelihood",
    category: "Livelihood & Skill Development",
    description: "Seed capital subsidy and equipment support for young entrepreneurs establishing small enterprises in Lakshmeshwar municipal area.",
    eligibility: "Age between 18-35 years, resident of Lakshmeshwar TMC, passed minimum SSLC.",
    documentsRequired: [
      "Aadhaar Card",
      "SSLC Marks Card",
      "Ward Domicile Certificate",
      "Bank Account Details",
      "Business Project Proposal",
    ],
    applicationProcess: "Step 1: Register on Seva Sindhu portal. Step 2: Submit project plan to TMC Skill Cell. Step 3: Ward verification and bank sanction.",
    benefits: "Up to ₹50,000 direct subsidy and collateral-free bank linkage at subsidized interest rates.",
    deadline: "31 March 2027",
    officialLink: "https://kaushalkar.karnataka.gov.in",
    contactInfo: "TMC Skill Development Officer: 08378-220034",
    status: "Active",
  };

  const createRes = await fetch(`${BASE_URL}/api/admin/schemes`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(newSchemeData),
  });
  assert(createRes.status === 201, "POST /api/admin/schemes creates scheme and returns HTTP 201");
  const createJson = await createRes.json();
  assert(createJson.success === true, "Scheme creation successful");
  const createdSchemeId = createJson.data?.id;
  assert(Boolean(createdSchemeId), `Created scheme has ID: ${createdSchemeId}`);
  assert(createJson.data?.name === newSchemeData.name, "Created scheme matches submitted name");
  assert(createJson.data?.documentsRequired.length === 5, "All 5 documents stored in array");

  // Admin GET single scheme
  const adminGetRes = await fetch(`${BASE_URL}/api/admin/schemes/${createdSchemeId}`, {
    headers: adminHeaders,
  });
  assert(adminGetRes.status === 200, `GET /api/admin/schemes/${createdSchemeId} returns HTTP 200`);
  const adminGetJson = await adminGetRes.json();
  assert(adminGetJson.data?.id === createdSchemeId, "Retrieved scheme matches ID");

  // Admin PATCH update scheme
  const patchRes = await fetch(`${BASE_URL}/api/admin/schemes/${createdSchemeId}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({
      benefits: "Up to ₹75,000 direct subsidy and collateral-free bank linkage at subsidized interest rates.",
      status: "Active",
    }),
  });
  assert(patchRes.status === 200, `PATCH /api/admin/schemes/${createdSchemeId} returns HTTP 200`);
  const patchJson = await patchRes.json();
  assert(patchJson.data?.benefits.includes("₹75,000"), "Benefits updated successfully");

  // Verify in public list
  const pubVerifyRes = await fetch(`${BASE_URL}/api/schemes?search=Micro-Enterprise`);
  const pubVerifyJson = await pubVerifyRes.json();
  assert(
    pubVerifyJson.data?.some((s) => s.id === createdSchemeId),
    "Updated scheme appears in public search query"
  );

  // Admin DELETE scheme
  const deleteRes = await fetch(`${BASE_URL}/api/admin/schemes/${createdSchemeId}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  assert(deleteRes.status === 200, `DELETE /api/admin/schemes/${createdSchemeId} returns HTTP 200`);

  // Verify deleted from public
  const verifyDeleteRes = await fetch(`${BASE_URL}/api/schemes/${createdSchemeId}`);
  assert(verifyDeleteRes.status === 404, "Deleted scheme returns HTTP 404 on public endpoint");

  // 5. Public and Admin Web Page Routes
  console.log("\n--- Section 5: Web Page HTTP Status Checks ---");
  const pubPageRes = await fetch(`${BASE_URL}/schemes`);
  assert(pubPageRes.status === 200, "GET /schemes returns HTTP 200");

  const pubDetailRes = await fetch(`${BASE_URL}/schemes/${testSchemeId}`);
  assert(pubDetailRes.status === 200, `GET /schemes/${testSchemeId} returns HTTP 200`);

  const adminPageRes = await fetch(`${BASE_URL}/admin/schemes`, {
    headers: { Cookie: adminCookieHeader },
  });
  assert(adminPageRes.status === 200, "GET /admin/schemes returns HTTP 200 with admin session");

  console.log("\n==================================================================");
  console.log(` Schemes Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
