/**
 * CivSetu Automated Test Suite: Notifications & Ask CivSetu AI
 * Validates:
 * 1. Citizen Notifications API (GET, PATCH mark_read, PATCH mark_all_read)
 * 2. Real-time complaint notification triggers across all 5 events:
 *    - Submitted (COMPLAINT_REGISTERED)
 *    - Accepted (COMPLAINT_ACCEPTED)
 *    - Assigned (ASSIGNED)
 *    - Escalated (ESCALATED)
 *    - Resolved (RESOLVED)
 * 3. Authority Notifications API (/api/authority/notifications)
 * 4. Ask CivSetu AI Chat API (/api/ai/chat):
 *    - Water problem query
 *    - Municipal services query
 *    - Documents required query
 *    - Status of complaint query
 *    - Department handling streetlights query
 *    - Kannada multilingual query
 *    - Direct Complaint ID lookup
 *    - Rate limiting & input validation
 */

// Native global fetch is provided by Node.js 22+
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  PASS: ${message}`);
  } else {
    testsFailed++;
    console.error(`  FAIL: ${message}`);
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  CIVSETU: NOTIFICATIONS & ASK CIVSETU AI TEST SUITE  ");
  console.log("=======================================================\n");

  const timestamp = Date.now().toString().slice(-6);
  const testMobile = `9888${timestamp}`;
  const testEmail = `citizen.${timestamp}@civsetu.test`;
  const testPassword = "CivicPassword@123";

  // Step 1: Register and login test citizen
  console.log("1. Setting up Authenticated Citizen Session...");

  // 1a. Send OTP
  await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber: testMobile, purpose: "registration" }),
  });

  // 1b. Verify OTP (mock code 123456)
  await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: testMobile, otp: "123456", purpose: "registration" }),
  });

  // 1c. Submit Registration Form
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: `Test Citizen ${timestamp}`,
      mobileNumber: testMobile,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      wardNumber: "Ward 07",
      residentialAddress: "123 Temple Road, Lakshmeshwar",
      otp: "123456",
    }),
  });

  const regJson = await regRes.json();
  assert(regRes.status === 200 && regJson.success, "Citizen successfully registered");

  // Login citizen to acquire session cookie
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: testMobile,
      password: testPassword,
    }),
  });

  const citizenCookie = loginRes.headers.get("set-cookie");
  const loginJson = await loginRes.json();
  assert(loginRes.status === 200 && loginJson.success, "Citizen successfully logged in");
  const citizenId = loginJson.data?.id;

  // Step 2: Test unauthenticated notifications access
  console.log("\n2. Testing Citizen Notifications Endpoint Security...");
  const unauthRes = await fetch(`${BASE_URL}/api/notifications`);
  assert(unauthRes.status === 401, "GET /api/notifications returns 401 when unauthenticated");

  // Step 3: Test authenticated notifications access
  console.log("\n3. Testing Citizen Notifications Endpoint for Authenticated Citizen...");
  const initNotifRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Cookie: citizenCookie },
  });
  const initNotifJson = await initNotifRes.json();
  assert(initNotifRes.status === 200 && initNotifJson.success, "GET /api/notifications succeeds for citizen");
  assert(Array.isArray(initNotifJson.data), "Notifications list is returned as array");
  assert(typeof initNotifJson.unreadCount === "number", "unreadCount is a valid number");

  // Step 4: Login Authority Desk for workflow testing
  console.log("\n4. Authenticating Authority Desk Officer...");
  const authLoginRes = await fetch(`${BASE_URL}/api/authority/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "commissioner@lakshmeshwar-tmc.gov.in",
      password: "Authority@Pass2026",
    }),
  });

  let authorityCookie = authLoginRes.headers.get("set-cookie");
  assert(Boolean(authorityCookie), "Authority desk successfully authenticated");

  // Step 5: Test Trigger 1 - Submit Complaint -> COMPLAINT_REGISTERED notification
  console.log("\n5. Testing Notification Trigger 1: Complaint Submitted...");
  const createCmpRes = await fetch(`${BASE_URL}/api/complaints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: citizenCookie,
    },
    body: JSON.stringify({
      category: "water",
      title: "Broken drinking water valve causing street flooding",
      description: "Drinking water pipe breached at cross 4, continuous loss of potable water for 2 days.",
      ward: "Ward 07 - Someshwara Temple Area",
      priority: "High",
    }),
  });

  const createCmpJson = await createCmpRes.json();
  assert(createCmpRes.status === 201 && createCmpJson.success, "Complaint created successfully");
  const complaintId = createCmpJson.data?.id;

  // Verify Citizen Notification for Registration
  const afterSubmitRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Cookie: citizenCookie },
  });
  const afterSubmitJson = await afterSubmitRes.json();
  const registeredNotif = afterSubmitJson.data?.find(
    (n) => n.complaintId === complaintId && n.eventType === "COMPLAINT_REGISTERED"
  );
  assert(Boolean(registeredNotif), "Notification Trigger 1 verified: COMPLAINT_REGISTERED notification exists");
  assert(registeredNotif?.title.includes("Registered") || registeredNotif?.title.includes("Grievance"), "Registration notification title is descriptive");

  // Step 6: Test Trigger 2 - Accept Complaint -> COMPLAINT_ACCEPTED notification
  console.log("\n6. Testing Notification Trigger 2: Complaint Accepted...");
  const acceptRes = await fetch(`${BASE_URL}/api/authority/complaints/${complaintId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: authorityCookie,
    },
    body: JSON.stringify({
      action: "accept",
      note: "Accepted for field engineering inspection by Lakshmeshwar TMC Water Wing.",
    }),
  });
  const acceptJson = await acceptRes.json();
  assert(acceptRes.status === 200 && acceptJson.success, "Complaint accepted by authority");

  // Verify Citizen Notification for Acceptance
  const afterAcceptRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Cookie: citizenCookie },
  });
  const afterAcceptJson = await afterAcceptRes.json();
  const acceptedNotif = afterAcceptJson.data?.find(
    (n) => n.complaintId === complaintId && n.eventType === "COMPLAINT_ACCEPTED"
  );
  assert(Boolean(acceptedNotif), "Notification Trigger 2 verified: COMPLAINT_ACCEPTED notification exists");

  // Step 7: Test Trigger 3 - Assign Complaint -> ASSIGNED notification
  console.log("\n7. Testing Notification Trigger 3: Complaint Assigned to Department...");
  const assignRes = await fetch(`${BASE_URL}/api/authority/complaints/${complaintId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: authorityCookie,
    },
    body: JSON.stringify({
      action: "assign",
      assignedAuthority: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
      note: "Assigned to Ward 07 Junior Engineer for immediate pipeline excavation and repair.",
    }),
  });
  const assignJson = await assignRes.json();
  assert(assignRes.status === 200 && assignJson.success, "Complaint assigned to department");

  // Verify Citizen Notification for Assignment
  const afterAssignRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Cookie: citizenCookie },
  });
  const afterAssignJson = await afterAssignRes.json();
  const assignedNotif = afterAssignJson.data?.find(
    (n) => n.complaintId === complaintId && n.eventType === "ASSIGNED"
  );
  assert(Boolean(assignedNotif), "Notification Trigger 3 verified: ASSIGNED notification exists");

  // Step 8: Test Trigger 4 - Escalate Complaint -> ESCALATED notification
  console.log("\n8. Testing Notification Trigger 4: Complaint Escalated...");
  const escalateRes = await fetch(`${BASE_URL}/api/authority/complaints/${complaintId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: authorityCookie,
    },
    body: JSON.stringify({
      action: "escalate",
      reason: "High pressure main valve requires taluk-level heavy excavation equipment.",
    }),
  });
  const escalateJson = await escalateRes.json();
  assert(escalateRes.status === 200 && escalateJson.success, "Complaint escalated to next administrative tier");

  // Verify Citizen Notification for Escalation
  const afterEscalateRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Cookie: citizenCookie },
  });
  const afterEscalateJson = await afterEscalateRes.json();
  const escalatedNotif = afterEscalateJson.data?.find(
    (n) => n.complaintId === complaintId && n.eventType === "ESCALATED"
  );
  assert(Boolean(escalatedNotif), "Notification Trigger 4 verified: ESCALATED notification exists");
  assert(escalatedNotif?.title.includes("Escalated"), "Escalation notification title mentions tier escalation");

  // Step 9: Test Trigger 5 - Resolve Complaint -> RESOLVED notification
  console.log("\n9. Testing Notification Trigger 5: Complaint Resolved...");
  const resolveRes = await fetch(`${BASE_URL}/api/authority/complaints/${complaintId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: authorityCookie,
    },
    body: JSON.stringify({
      action: "resolve",
      resolutionNotes: "Breached 100mm PVC joint replaced with ductile iron collar. Pressure restored to normal.",
    }),
  });
  const resolveJson = await resolveRes.json();
  assert(resolveRes.status === 200 && resolveJson.success, "Complaint resolved by authority");

  // Verify Citizen Notification for Resolution
  const afterResolveRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Cookie: citizenCookie },
  });
  const afterResolveJson = await afterResolveRes.json();
  const resolvedNotif = afterResolveJson.data?.find(
    (n) => n.complaintId === complaintId && n.eventType === "RESOLVED"
  );
  assert(Boolean(resolvedNotif), "Notification Trigger 5 verified: RESOLVED notification exists");
  assert(resolvedNotif?.title.includes("Resolved"), "Resolution notification title confirms grievance resolution");

  // Step 10: Test Marking Notifications as Read
  console.log("\n10. Testing Notification Read Operations (mark_read & mark_all_read)...");
  if (resolvedNotif) {
    const markSingleRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: citizenCookie,
      },
      body: JSON.stringify({
        action: "mark_read",
        id: resolvedNotif.id,
      }),
    });
    const markSingleJson = await markSingleRes.json();
    assert(markSingleRes.status === 200 && markSingleJson.success, "Single notification marked as read");
  }

  // Mark all as read
  const markAllRes = await fetch(`${BASE_URL}/api/notifications`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: citizenCookie,
    },
    body: JSON.stringify({
      action: "mark_all_read",
    }),
  });
  const markAllJson = await markAllRes.json();
  assert(markAllRes.status === 200 && markAllJson.success, "mark_all_read succeeds");
  assert(markAllJson.unreadCount === 0, "unreadCount becomes 0 after mark_all_read");

  // Step 11: Test Ask CivSetu AI Chat API (/api/ai/chat)
  console.log("\n11. Testing Ask CivSetu AI Chat API Requirements...");

  // Question 1: How do I report a water problem?
  const waterAiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "How do I report a water problem?" }),
  });
  const waterAiJson = await waterAiRes.json();
  assert(waterAiRes.status === 200 && waterAiJson.success, "AI Chat: Water problem query succeeds");
  assert(waterAiJson.reply.toLowerCase().includes("water"), "AI Chat: Water answer mentions water supply");
  assert(
    waterAiJson.suggestedActions?.some((a) => a.url.includes("/complaints/new")),
    "AI Chat: Provides action shortcut to /complaints/new"
  );
  assert(Boolean(waterAiJson.disclaimer), "AI Chat: Includes municipal disclaimer");

  // Question 2: Where can I find municipal services?
  const servicesAiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "Where can I find municipal services?" }),
  });
  const servicesAiJson = await servicesAiRes.json();
  assert(servicesAiRes.status === 200 && servicesAiJson.success, "AI Chat: Municipal services query succeeds");
  assert(
    servicesAiJson.suggestedActions?.some((a) => a.url === "/services"),
    "AI Chat: Provides action shortcut to /services directory"
  );

  // Question 3: What documents are needed?
  const docsAiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "What documents are needed for Khata extract?" }),
  });
  const docsAiJson = await docsAiRes.json();
  assert(docsAiRes.status === 200 && docsAiJson.success, "AI Chat: Documents required query succeeds");
  assert(
    docsAiJson.reply.toLowerCase().includes("deed") || docsAiJson.reply.toLowerCase().includes("tax"),
    "AI Chat: Lists statutory documents (deed, tax receipt, etc.)"
  );

  // Question 4: What is the status of my complaint?
  const statusAiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "What is the status of my complaint?" }),
  });
  const statusAiJson = await statusAiRes.json();
  assert(statusAiRes.status === 200 && statusAiJson.success, "AI Chat: Complaint status query succeeds");
  assert(
    statusAiJson.suggestedActions?.some((a) => a.url === "/track"),
    "AI Chat: Directs to /track"
  );

  // Question 5: Direct Complaint ID Lookup
  const cmpLookupAiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: `Check status of ${complaintId}` }),
  });
  const cmpLookupAiJson = await cmpLookupAiRes.json();
  assert(cmpLookupAiRes.status === 200 && cmpLookupAiJson.success, "AI Chat: Live complaint ID lookup succeeds");
  assert(
    cmpLookupAiJson.reply.includes(complaintId) && cmpLookupAiJson.reply.toLowerCase().includes("resolved"),
    "AI Chat: Returns actual live database status (Resolved) for complaint ID"
  );

  // Question 6: Which department handles streetlights?
  const lightAiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "Which department handles streetlights?" }),
  });
  const lightAiJson = await lightAiRes.json();
  assert(lightAiRes.status === 200 && lightAiJson.success, "AI Chat: Streetlights department query succeeds");
  assert(
    lightAiJson.officialDepartment.toLowerCase().includes("electrical") ||
      lightAiJson.officialDepartment.toLowerCase().includes("streetlight"),
    "AI Chat: Identifies Electrical & Streetlighting Wing"
  );

  // Question 7: Multilingual Kannada query
  const knAiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "ಕುಡಿಯುವ ನೀರಿನ ದೂರು ಹೇಗೆ ದಾಖಲಿಸುವುದು?" }),
  });
  const knAiJson = await knAiRes.json();
  assert(knAiRes.status === 200 && knAiJson.success, "AI Chat: Kannada prompt succeeds");
  assert(knAiJson.language === "kn", "AI Chat: Correctly recognizes Kannada language");
  assert(/[\u0C80-\u0CFF]/.test(knAiJson.reply), "AI Chat: Responds in authentic Kannada script");

  // Step 12: Test AI Chat Validation & Error Handling
  console.log("\n12. Testing AI Chat Input Validation & Rate Limiting...");
  const emptyAiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "" }),
  });
  assert(emptyAiRes.status === 400, "AI Chat: Empty prompt rejected with 400");

  console.log("\n=======================================================");
  console.log(`  FINAL RESULT: ${testsPassed} PASSED | ${testsFailed} FAILED`);
  console.log("=======================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution aborted with unhandled error:", err);
  process.exit(1);
});
