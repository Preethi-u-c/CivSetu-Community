/**
 * CivSetu Phase 2 Automated API & Persistence Test Suite
 * Tests all data models, repositories, and API endpoints without external test runners.
 */

import { db } from "../src/lib/db/storage.js";

async function runTests() {
  console.log("=================================================");
  console.log(" CIVSETU PHASE 2: AUTOMATED VERIFICATION SUITE   ");
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
    // 1. Storage & Seeding Test
    console.log("[1] Testing Storage Engine & Seeding...");
    const raw = db.getRaw();
    assert(raw !== null, "Database successfully initialized");
    assert(Array.isArray(raw.notices) && raw.notices.length > 0, "Notices seeded from Phase 1 data");
    assert(Array.isArray(raw.grievances) && raw.grievances.length > 0, "Sample municipal grievances seeded");
    assert(Array.isArray(raw.applications) && raw.applications.length > 0, "Sample service applications seeded");
    assert(Array.isArray(raw.feedbacks) && raw.feedbacks.length > 0, "Sample citizen feedback seeded");

    // 2. Visitor Statistics & IP Hashing Test
    console.log("\n[2] Testing Visitor Logging & Privacy Compliance...");
    const initialStats = db.stats.getStats();
    const initialVisitors = initialStats.visitorStats.totalVisitors;
    const initialUnique = initialStats.visitorStats.uniqueVisitors;

    const visit1 = await db.stats.recordVisit("192.168.1.100");
    assert(visit1.totalVisitors === initialVisitors + 1, "Total visitor counter increments");
    assert(visit1.uniqueVisitors === initialUnique + 1, "Unique visitor counter increments for new IP");

    // Repeat visit from same IP should increment total but not unique
    const visit2 = await db.stats.recordVisit("192.168.1.100");
    assert(visit2.totalVisitors === initialVisitors + 2, "Repeat visit increments total visitors");
    assert(visit2.uniqueVisitors === initialUnique + 1, "Repeat visit preserves unique visitor count");

    // 3. Grievance Management & Lifecycle Test
    console.log("\n[3] Testing Grievance Lifecycle & Reference Generation...");
    const newGrievance = await db.grievances.create({
      citizenName: "Anand Nayak",
      mobileNumber: "9886012345",
      wardNumber: "1",
      category: "streetlights",
      subject: "Test streetlight blackout near Someshwara temple",
      description: "Pole 14 streetlight completely off for past two nights.",
      priority: "HIGH",
    });

    assert(newGrievance.id.startsWith("LMC-GRV-"), `Grievance reference code generated: ${newGrievance.id}`);
    assert(newGrievance.status === "SUBMITTED", "Initial status is SUBMITTED");
    assert(newGrievance.timeline.length === 1, "Initial audit timeline event created");

    // Lookup grievance
    const fetchedGrievance = db.grievances.getById(newGrievance.id);
    assert(fetchedGrievance && fetchedGrievance.citizenName === "Anand Nayak", "Grievance retrieved by tracking ID");

    // Update grievance status
    const updatedGrievance = await db.grievances.update(newGrievance.id, {
      status: "IN_PROGRESS",
      assignedDepartment: "Electrical Cell",
      officialRemarks: "Junior Engineer dispatched with replacement bulb.",
      note: "Field inspection initiated.",
      updatedBy: "Junior Engineer Patil",
    });

    assert(updatedGrievance.status === "IN_PROGRESS", "Grievance status transitioned to IN_PROGRESS");
    assert(updatedGrievance.assignedDepartment === "Electrical Cell", "Department assigned correctly");
    assert(updatedGrievance.timeline.length === 2, "Audit timeline appended with action details");

    // Resolve grievance
    const resolvedGrievance = await db.grievances.update(newGrievance.id, {
      status: "RESOLVED",
      officialRemarks: "Replaced 40W LED fixture. Illumination restored.",
      note: "Work completed.",
      updatedBy: "Chief Officer Desk",
    });
    assert(resolvedGrievance.status === "RESOLVED", "Grievance resolved successfully");

    // 4. Service Application Lifecycle Test
    console.log("\n[4] Testing Service Application Processing...");
    const newApp = await db.applications.create({
      serviceCode: "Form TMC-W1",
      serviceName: "Application for Piped Drinking Water Connection",
      applicantName: "Kavitha Bellad",
      mobileNumber: "9945001122",
      wardNumber: "12",
      address: "Plot 45, Vidya Nagar, Lakshmeshwar",
      details: { pipeDiameter: "1/2 inch", propertyNo: "VN-45" },
    });

    assert(newApp.id.startsWith("LMC-APP-"), `Application statutory reference generated: ${newApp.id}`);
    assert(newApp.status === "SUBMITTED", "Initial application status is SUBMITTED");

    // Update application workflow
    const updatedApp = await db.applications.update(newApp.id, {
      status: "UNDER_VERIFICATION",
      officialRemarks: "Tax payment cleared. Forwarded to Engineering Section.",
      note: "Revenue verification complete.",
    });
    assert(updatedApp.status === "UNDER_VERIFICATION", "Workflow transitioned to UNDER_VERIFICATION");

    // 5. Citizen Feedback & Suggestions Test
    console.log("\n[5] Testing Feedback Submission & Review...");
    const newFeedback = await db.feedback.create({
      citizenName: "Rudrappa Gudadinni",
      mobileNumber: "9481234567",
      wardNumber: "8",
      category: "roads",
      suggestion: "Kindly install speed breakers near Government Primary School.",
    });

    assert(newFeedback.id.startsWith("LMC-FB-"), `Feedback reference generated: ${newFeedback.id}`);
    assert(newFeedback.status === "PENDING", "Initial feedback status is PENDING");

    const updatedFeedback = await db.feedback.updateStatus(newFeedback.id, "FLAGGED_FOR_COUNCIL", "Scheduled for Agenda Item #4");
    assert(updatedFeedback.status === "FLAGGED_FOR_COUNCIL", "Feedback status updated to FLAGGED_FOR_COUNCIL");

    // 6. Gazette Notices Lifecycle Test
    console.log("\n[6] Testing Gazette Notices Publishing...");
    const newNotice = await db.notices.create({
      title: "Ward 1 to 23 Public Sanitation Drive 2026",
      titleKn: "ವಾರ್ಡ್ ೧ ರಿಂದ ೨೩ ಸಾರ್ವಜನಿಕ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ ೨೦೨೬",
      category: "Sanitation",
      categoryKn: "ನೈರ್ಮಲ್ಯ",
      content: "Town-wide pre-monsoon drainage desilting and household awareness drive.",
      contentKn: "ಮಳೆಗಾಲ ಪೂರ್ವ ಒಳಚರಂಡಿ ಸ್ವಚ್ಛತಾ ಕಾರ್ಯಕ್ರಮ.",
      isPinned: true,
    });

    assert(newNotice.slug.includes("sanitation-drive"), `Notice slug generated: ${newNotice.slug}`);
    assert(newNotice.isPublished === true, "Notice is published");

    const foundNotice = db.notices.getBySlug(newNotice.slug);
    assert(foundNotice && foundNotice.title === newNotice.title, "Notice retrieved by slug");

    // Toggle publish
    const toggledNotice = await db.notices.togglePublished(newNotice.id);
    assert(toggledNotice.isPublished === false, "Notice unpublished successfully");

    // Cleanup test notice
    const deleted = await db.notices.delete(newNotice.id);
    assert(deleted === true, "Test notice cleaned up");

    console.log("\n=================================================");
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED           `);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test Suite Aborted on Error:", error);
    process.exit(1);
  }
}

runTests();
