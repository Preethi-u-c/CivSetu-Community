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
  console.log(" CivSetu Phase Verification: Applications, Dashboard & Polish");
  console.log("==================================================================\n");

  // 1. Applications Module API & Workflow
  console.log("--- Section 1: Applications Module (Architecture & Lifecycle) ---");
  const listAppsRes = await fetch(`${BASE_URL}/api/applications`);
  assert(listAppsRes.status === 200, "GET /api/applications returns HTTP 200");
  const listAppsJson = await listAppsRes.json();
  assert(listAppsJson.success === true, "Response has success: true");
  assert(Array.isArray(listAppsJson.data), "Response contains data array of applications");

  // Submit a new application
  const testMobile = "9845099881";
  const newAppPayload = {
    serviceCode: "Form TMC-W1",
    serviceName: "Application for Piped Drinking Water Connection",
    applicantName: "Girish Pattanashetti",
    mobileNumber: testMobile,
    email: "girish.p@example.com",
    wardNumber: "Ward 04",
    address: "Plot 42, Near Someshwara Temple, Lakshmeshwar",
    details: {
      connectionType: "Residential Domestic (0.5 inch)",
      uploadedDocuments: "tax_receipt: tax_receipt_verified.pdf; title_deed: title_deed_verified.pdf; aadhaar: aadhaar_verified.pdf",
      applicantRemarks: "New residential house construction completed; need drinking water line hookup.",
    },
  };

  const createRes = await fetch(`${BASE_URL}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newAppPayload),
  });
  assert(createRes.status === 200, "POST /api/applications returns HTTP 200");
  const createJson = await createRes.json();
  assert(createJson.success === true, "Application submitted successfully");
  const createdAppId = createJson.data?.id;
  assert(Boolean(createdAppId), `Application ID generated: ${createdAppId}`);
  assert(createJson.data?.status === "SUBMITTED", "Initial application status is SUBMITTED");

  // Lookup by mobile filter (for Citizen Dashboard)
  const mobileRes = await fetch(`${BASE_URL}/api/applications?mobile=${testMobile}`);
  assert(mobileRes.status === 200, `GET /api/applications?mobile=${testMobile} returns HTTP 200`);
  const mobileJson = await mobileRes.json();
  assert(
    mobileJson.data?.some((a) => a.id === createdAppId),
    "Application is discoverable by citizen's registered mobile number"
  );

  // 2. Complaint Categories Verification
  console.log("\n--- Section 2: Complaint Categories Complete Set Verification ---");
  const categoriesRes = await fetch(`${BASE_URL}/api/complaint-categories`);
  assert(categoriesRes.status === 200, "GET /api/complaint-categories returns HTTP 200");
  const categoriesJson = await categoriesRes.json();
  assert(Array.isArray(categoriesJson.data), "Complaint categories returned as array");

  const catIds = new Set(categoriesJson.data.map((c) => c.id.toLowerCase()));
  const requiredCategories = [
    "water",
    "electricity",
    "sanitation",
    "roads",
    "drainage",
    "streetlights",
    "waste",
    "public_health", // or health
    "other",
  ];

  assert(catIds.has("water"), "Category 'water' exists");
  assert(catIds.has("electricity"), "Category 'electricity' exists");
  assert(catIds.has("sanitation"), "Category 'sanitation' exists");
  assert(catIds.has("roads"), "Category 'roads' exists");
  assert(catIds.has("drainage"), "Category 'drainage' exists");
  assert(catIds.has("streetlights") || catIds.has("streetlighting"), "Category 'streetlights' exists");
  assert(catIds.has("waste"), "Category 'waste' exists");
  assert(catIds.has("health") || catIds.has("public_health"), "Category 'public health' exists");
  assert(catIds.has("other"), "Category 'other' exists");

  // 3. Web Pages Availability Check
  console.log("\n--- Section 3: Web Page Rendering Checks ---");
  const appsPageRes = await fetch(`${BASE_URL}/applications`);
  assert(appsPageRes.status === 200, "GET /applications loads successfully (HTTP 200)");

  const dashboardPageRes = await fetch(`${BASE_URL}/dashboard`);
  assert(dashboardPageRes.status === 200, "GET /dashboard loads successfully (HTTP 200)");

  const trackPageRes = await fetch(`${BASE_URL}/track?id=${createdAppId}`);
  assert(trackPageRes.status === 200, `GET /track?id=${createdAppId} loads successfully (HTTP 200)`);

  const newComplaintRes = await fetch(`${BASE_URL}/complaints/new`);
  assert(newComplaintRes.status === 200, "GET /complaints/new loads successfully (HTTP 200)");

  console.log("\n==================================================================");
  console.log(` Polish & Applications Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
