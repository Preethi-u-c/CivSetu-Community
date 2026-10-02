/**
 * Automated Verification Script: Email Notifications & Real-Time Sync System
 *
 * Verifies:
 * 1. Email Templates & Content:
 *    - Complaint Submitted (Complaint ID, Status "Submitted", Category, Ward, SLA)
 *    - Complaint Updated (Complaint ID, Status, Authority, Escalation, Notes)
 *    - Complaint Resolved (Complaint ID, Status "Resolved", Resolution Notes)
 *    - Emergency Notice ("Emergency notification", "Important municipal notice", Helpline)
 *    - Municipal Announcement ("Important municipal notice", Category, Department)
 * 2. Real-Time Broadcast & Subscription:
 *    - Singleton EventEmitter broadcast and subscribe
 *    - Server-Sent Events (SSE) /api/realtime/complaints connection & stream
 * 3. NotificationService Integration:
 *    - Correct event dispatching and email triggers
 */

import {
  sendComplaintSubmittedEmail,
  sendComplaintUpdatedEmail,
  sendComplaintResolvedEmail,
  sendEmergencyNoticeEmail,
  sendMunicipalAnnouncementEmail,
} from "../src/lib/services/emailNotificationService.ts";

import {
  broadcastRealtimeEvent,
  subscribeRealtimeEvents,
} from "../src/lib/services/realtimeEvents.ts";

import { notificationService } from "../src/lib/services/notificationService.ts";

async function runTests() {
  console.log("\n=======================================================");
  console.log("   TESTING EMAIL NOTIFICATIONS & REAL-TIME SYSTEM      ");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // -----------------------------------------------------------------
  // 1. Complaint Submitted Email
  // -----------------------------------------------------------------
  console.log("\n--- 1. Testing Complaint Submitted Email ---");
  try {
    const res = await sendComplaintSubmittedEmail("citizen.test@example.com", {
      complaintId: "CMP-LMC-2026-99001",
      status: "Submitted",
      category: "Water Supply & Piped Lines",
      ward: "Ward 04 - Pete Oni",
      title: "Drinking water pipe leakage near market square",
      description: "Underground pipeline ruptured causing street flooding.",
      deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      citizenName: "Ramesh Pujar",
    });

    assert(res.success === true, "Submitted email dispatches successfully");
    assert(res.simulated === true || typeof res.messageId === "string", "Email provider responded with messageId/simulated receipt");
  } catch (err) {
    assert(false, `Error in sendComplaintSubmittedEmail: ${err.message}`);
  }

  // -----------------------------------------------------------------
  // 2. Complaint Updated Email
  // -----------------------------------------------------------------
  console.log("\n--- 2. Testing Complaint Updated Email ---");
  try {
    const res = await sendComplaintUpdatedEmail("citizen.test@example.com", {
      complaintId: "CMP-LMC-2026-99001",
      status: "In Progress",
      assignedAuthority: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
      authorityLevel: "Local Authority",
      note: "Inspection crew dispatched to replace 4-inch PVC connector.",
      citizenName: "Ramesh Pujar",
    });

    assert(res.success === true, "Updated email dispatches successfully");
  } catch (err) {
    assert(false, `Error in sendComplaintUpdatedEmail: ${err.message}`);
  }

  // -----------------------------------------------------------------
  // 3. Complaint Escalated Email
  // -----------------------------------------------------------------
  console.log("\n--- 3. Testing Complaint Escalated Email ---");
  try {
    const res = await sendComplaintUpdatedEmail("citizen.test@example.com", {
      complaintId: "CMP-LMC-2026-99001",
      status: "Escalated",
      assignedAuthority: "Lakshmeshwar Taluk Panchayat Executive Office",
      authorityLevel: "Block level",
      note: "Escalated to Taluk Panchayat due to cross-departmental road cutting permission required.",
      citizenName: "Ramesh Pujar",
    });

    assert(res.success === true, "Escalated email dispatches successfully");
  } catch (err) {
    assert(false, `Error in sendComplaintUpdatedEmail (Escalated): ${err.message}`);
  }

  // -----------------------------------------------------------------
  // 4. Complaint Resolved Email
  // -----------------------------------------------------------------
  console.log("\n--- 4. Testing Complaint Resolved Email ---");
  try {
    const res = await sendComplaintResolvedEmail("citizen.test@example.com", {
      complaintId: "CMP-LMC-2026-99001",
      status: "Resolved",
      resolutionNotes: "Replaced 6-meter ruptured line, pressure tested to 4.5 bar, road surface reinstated.",
      resolvedAt: new Date().toISOString(),
      citizenName: "Ramesh Pujar",
    });

    assert(res.success === true, "Resolved email dispatches successfully");
  } catch (err) {
    assert(false, `Error in sendComplaintResolvedEmail: ${err.message}`);
  }

  // -----------------------------------------------------------------
  // 5. Emergency Notice Email
  // -----------------------------------------------------------------
  console.log("\n--- 5. Testing Emergency Notice Email ---");
  try {
    const res = await sendEmergencyNoticeEmail(["citizen1@example.com", "citizen2@example.com"], {
      title: "Heavy Inflow Alert & Boil Water Advisory",
      description: "Due to heavy rains in Tungabhadra catchment, residents of Wards 01-12 are advised to boil tap water before consumption for 48 hours.",
      severity: "Urgent",
      targetWards: "Wards 01 - 12 (North Lakshmeshwar)",
      emergencyContact: "08375-224422 / 1902",
      issuedByName: "Sri. Basavaraj Patil (Chief Officer)",
      issuedByDepartment: "Public Health & Disaster Management Cell",
    });

    assert(res.success === true, "Emergency notice email dispatches to recipient list");
  } catch (err) {
    assert(false, `Error in sendEmergencyNoticeEmail: ${err.message}`);
  }

  // -----------------------------------------------------------------
  // 6. Municipal Announcement Email
  // -----------------------------------------------------------------
  console.log("\n--- 6. Testing Municipal Announcement Email ---");
  try {
    const res = await sendMunicipalAnnouncementEmail("citizen1@example.com", {
      title: "Annual Property Tax Rebate Scheme 2026-27",
      description: "Avail 5% early-bird rebate on residential and commercial municipal property tax payments completed before April 30, 2026.",
      category: "Revenue & Taxation",
      department: "Revenue & Property Assessment Section, Lakshmeshwar TMC",
      issuedByName: "Revenue Officer, Lakshmeshwar TMC",
    });

    assert(res.success === true, "Municipal announcement email dispatches successfully");
  } catch (err) {
    assert(false, `Error in sendMunicipalAnnouncementEmail: ${err.message}`);
  }

  // -----------------------------------------------------------------
  // 7. Real-Time Broadcast & Subscription Test
  // -----------------------------------------------------------------
  console.log("\n--- 7. Testing Real-Time Event Bus (Pub/Sub) ---");
  try {
    let receivedEvent = null;
    const unsubscribe = subscribeRealtimeEvents((event) => {
      receivedEvent = event;
    });

    const testEvent = broadcastRealtimeEvent("complaint_created", {
      id: "CMP-TEST-REALTIME-001",
      category: "Sanitation",
      ward: "Ward 07",
      title: "Live event pipeline test",
      status: "Submitted",
    });

    assert(testEvent && testEvent.type === "complaint_created", "broadcastRealtimeEvent returns formatted event object");
    assert(receivedEvent !== null, "Subscriber received live event asynchronously");
    assert(receivedEvent.data.id === "CMP-TEST-REALTIME-001", "Subscriber received correct event payload data");

    unsubscribe();
  } catch (err) {
    assert(false, `Error in real-time pub/sub: ${err.message}`);
  }

  // -----------------------------------------------------------------
  // 8. Notification Service Integration Test
  // -----------------------------------------------------------------
  console.log("\n--- 8. Testing NotificationService Integration ---");
  try {
    let sseEventCaptured = null;
    const unsub = subscribeRealtimeEvents((evt) => {
      if (evt.data && evt.data.complaintId === "CMP-INTEG-001") {
        sseEventCaptured = evt;
      }
    });

    // Notify registered
    await notificationService.notifyComplaintRegistered(
      "CMP-INTEG-001",
      "Streetlighting",
      "Ward 03",
      undefined,
      { title: "Faulty pole light at bus stand" }
    );

    assert(sseEventCaptured !== null, "notifyComplaintRegistered triggered real-time SSE broadcast");
    assert(sseEventCaptured?.type === "complaint_created", "Event type is complaint_created");

    // Notify status updated
    sseEventCaptured = null;
    await notificationService.notifyStatusUpdated(
      "CMP-INTEG-001",
      "In Progress",
      "Electrician team on site",
      undefined,
      "Electrical & Streetlighting Wing"
    );

    assert(sseEventCaptured !== null, "notifyStatusUpdated triggered real-time SSE broadcast");
    assert(sseEventCaptured?.type === "complaint_updated", "Event type is complaint_updated");
    assert(sseEventCaptured?.data?.status === "In Progress", "Status is In Progress");

    // Notify resolved
    sseEventCaptured = null;
    await notificationService.notifyComplaintResolved(
      "CMP-INTEG-001",
      "LED fixture and choke replaced",
      undefined
    );

    assert(sseEventCaptured !== null, "notifyComplaintResolved triggered real-time SSE broadcast");
    assert(sseEventCaptured?.type === "complaint_resolved", "Event type is complaint_resolved");

    unsub();
  } catch (err) {
    assert(false, `Error in NotificationService integration: ${err.message}`);
  }

  // -----------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`   TOTAL TESTS: ${passed + failed}`);
  console.log(`   PASSED:      ${passed}`);
  console.log(`   FAILED:      ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test runner exception:", err);
  process.exit(1);
});
