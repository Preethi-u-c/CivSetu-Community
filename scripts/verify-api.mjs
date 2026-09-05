/**
 * Live HTTP Verification Script for CivSetu Phase 2 APIs
 */

const BASE_URL = "http://localhost:3000";

async function runLiveTests() {
  console.log("=================================================");
  console.log(" LIVE HTTP TEST SUITE: http://localhost:3000     ");
  console.log("=================================================\n");

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

  try {
    // 1. GET /api/stats
    console.log("[1] Testing GET /api/stats...");
    const statsRes = await fetch(`${BASE_URL}/api/stats`);
    const statsJson = await statsRes.json();
    assert(statsRes.status === 200, "GET /api/stats returns 200");
    assert(statsJson.success === true, "Response has success: true");
    assert(typeof statsJson.data.counts.totalGrievances === "number", "Grievance count is present");
    assert(typeof statsJson.data.visitorStats.totalVisitors === "number", "Visitor stats present");

    // 2. POST /api/stats/visit
    console.log("\n[2] Testing POST /api/stats/visit...");
    const visitRes = await fetch(`${BASE_URL}/api/stats/visit`, { method: "POST" });
    const visitJson = await visitRes.json();
    assert(visitRes.status === 200, "POST /api/stats/visit returns 200");
    assert(visitJson.success === true, "Visit recorded successfully");
    assert(typeof visitJson.data.totalVisitors === "number", "Incremented total visitors returned");

    // 3. POST /api/grievances
    console.log("\n[3] Testing POST /api/grievances (Register Grievance)...");
    const newGrvPayload = {
      citizenName: "Santosh Naik",
      mobileNumber: "9845012345",
      wardNumber: "3",
      category: "streetlights",
      subject: "Flickering high mast light at Ward 3 chowk",
      description: "Streetlight flickering intermittently causing traffic hazard.",
      priority: "HIGH",
    };
    const createGrvRes = await fetch(`${BASE_URL}/api/grievances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGrvPayload),
    });
    const createGrvJson = await createGrvRes.json();
    assert(createGrvRes.status === 200, "POST /api/grievances returns 200");
    assert(createGrvJson.success === true, "Grievance created successfully");
    const grvId = createGrvJson.data.id;
    assert(grvId.startsWith("LMC-GRV-"), `Statutory tracking ID assigned: ${grvId}`);

    // 4. GET /api/grievances/[id]
    console.log("\n[4] Testing GET /api/grievances/[id] (Public Status Lookup)...");
    const getGrvRes = await fetch(`${BASE_URL}/api/grievances/${grvId}`);
    const getGrvJson = await getGrvRes.json();
    assert(getGrvRes.status === 200, `GET /api/grievances/${grvId} returns 200`);
    assert(getGrvJson.data.citizenName === "Santosh Naik", "Retrieved applicant name matches");
    assert(getGrvJson.data.status === "SUBMITTED", "Initial status is SUBMITTED");

    // 5. PATCH /api/grievances/[id] (Admin Status Update)
    console.log("\n[5] Testing PATCH /api/grievances/[id] (Officer Desk Update)...");
    const patchGrvRes = await fetch(`${BASE_URL}/api/grievances/${grvId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "IN_PROGRESS",
        assignedDepartment: "Electrical Cell",
        officialRemarks: "Junior Engineer dispatched for bulb and ballast replacement.",
        note: "Field inspection scheduled.",
        updatedBy: "Assistant Executive Engineer",
      }),
    });
    const patchGrvJson = await patchGrvRes.json();
    assert(patchGrvRes.status === 200, "PATCH /api/grievances/[id] returns 200");
    assert(patchGrvJson.data.status === "IN_PROGRESS", "Status updated to IN_PROGRESS");
    assert(patchGrvJson.data.timeline.length === 2, "Timeline contains 2 milestone events");

    // 6. POST /api/applications (Submit Municipal Application)
    console.log("\n[6] Testing POST /api/applications (Apply Online)...");
    const newAppPayload = {
      serviceCode: "Form TMC-W1",
      serviceName: "Application for Piped Drinking Water Connection",
      applicantName: "Mahadevi Patil",
      mobileNumber: "9480123999",
      email: "mahadevi@gmail.com",
      wardNumber: "7",
      address: "House 19, Bus Stand Road, Lakshmeshwar",
      details: { pipeRequirement: "Residential 1/2 inch", propertyTaxPaid: "Yes" },
    };
    const createAppRes = await fetch(`${BASE_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAppPayload),
    });
    const createAppJson = await createAppRes.json();
    assert(createAppRes.status === 200, "POST /api/applications returns 200");
    const appId = createAppJson.data.id;
    assert(appId.startsWith("LMC-APP-"), `Application tracking ID assigned: ${appId}`);

    // 7. GET /api/applications/[id] & PATCH
    console.log("\n[7] Testing GET & PATCH /api/applications/[id]...");
    const getAppRes = await fetch(`${BASE_URL}/api/applications/${appId}`);
    const getAppJson = await getAppRes.json();
    assert(getAppRes.status === 200, "GET /api/applications/[id] returns 200");
    assert(getAppJson.data.applicantName === "Mahadevi Patil", "Applicant name matches");

    const patchAppRes = await fetch(`${BASE_URL}/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "APPROVED",
        officialRemarks: "Pipeline feasibility confirmed. Sanction order LMC-SO-2026-88 issued.",
        note: "Approved by Chief Officer.",
      }),
    });
    const patchAppJson = await patchAppRes.json();
    assert(patchAppRes.status === 200, "PATCH /api/applications/[id] returns 200");
    assert(patchAppJson.data.status === "APPROVED", "Status updated to APPROVED");

    // 8. POST & GET /api/feedback
    console.log("\n[8] Testing /api/feedback...");
    const fbRes = await fetch(`${BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        citizenName: "Veeranna Angadi",
        mobileNumber: "9740556677",
        wardNumber: "2",
        category: "sanitation",
        suggestion: "Please arrange extra dry waste bins during weekly market day.",
      }),
    });
    const fbJson = await fbRes.json();
    assert(fbRes.status === 200, "POST /api/feedback returns 200");
    assert(fbJson.data.id.startsWith("LMC-FB-"), `Feedback ID generated: ${fbJson.data.id}`);

    // 9. POST /api/notices & GET /api/notices
    console.log("\n[9] Testing /api/notices (Publish Notice)...");
    const newNoticePayload = {
      title: "Special Summer Water Distribution Schedule 2026",
      titleKn: "ವಿಶೇಷ ಬೇಸಿಗೆ ಕುಡಿಯುವ ನೀರಿನ ಸರಬರಾಜು ವೇಳಾಪಟ್ಟಿ ೨೦೨೬",
      category: "Water Resources",
      categoryKn: "ಜಲ ಸಂಪನ್ಮೂಲ",
      content: "Revised tanker filling and ward supply hours across Lakshmeshwar municipal area.",
      contentKn: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಬೇಸಿಗೆ ನೀರಿನ ಸರಬರಾಜು ವೇಳಾಪಟ್ಟಿ ಪರಿಷ್ಕರಣೆ.",
      isPinned: true,
    };
    const createNoticeRes = await fetch(`${BASE_URL}/api/notices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNoticePayload),
    });
    const createNoticeJson = await createNoticeRes.json();
    assert(createNoticeRes.status === 200, "POST /api/notices returns 200");
    assert(createNoticeJson.data.slug.includes("water-distribution"), "Notice slug generated");

    // Lookup created notice by slug
    const getNoticeRes = await fetch(`${BASE_URL}/api/notices/${createNoticeJson.data.slug}`);
    const getNoticeJson = await getNoticeRes.json();
    assert(getNoticeRes.status === 200, "GET /api/notices/[slug] returns 200");
    assert(getNoticeJson.data.title === newNoticePayload.title, "Notice title matches");

    // 10. GET /api/wards & /api/officials
    console.log("\n[10] Testing /api/wards & /api/officials...");
    const wardsRes = await fetch(`${BASE_URL}/api/wards`);
    const wardsJson = await wardsRes.json();
    assert(wardsRes.status === 200 && wardsJson.count > 0, "GET /api/wards returns wards data");

    const officialsRes = await fetch(`${BASE_URL}/api/officials`);
    const officialsJson = await officialsRes.json();
    assert(officialsRes.status === 200 && officialsJson.count > 0, "GET /api/officials returns officials data");

    console.log("\n=================================================");
    console.log(` ALL LIVE TESTS FINISHED: ${passed} PASSED, ${failed} FAILED `);
    console.log("=================================================");

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Live test suite error:", err);
    process.exit(1);
  }
}

runLiveTests();
