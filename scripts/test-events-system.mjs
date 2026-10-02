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
  console.log(" Events & Festivals Module: Public API, Web Pages & Admin CRUD");
  console.log("==================================================================\n");

  // 1. Check Public Events API
  console.log("--- Section 1: Public Events API & Filtering ---");
  const pubRes = await fetch(`${BASE_URL}/api/events`);
  assert(pubRes.status === 200, "GET /api/events returns HTTP 200");
  const pubJson = await pubRes.json();
  assert(pubJson.success === true, "Response has success: true");
  assert(Array.isArray(pubJson.data), "Response contains data array of events");
  assert(pubJson.count >= 1, "At least 1 event returned");

  // Check required fields
  const firstEvent = pubJson.data?.[0];
  assert(Boolean(firstEvent?.id), "Event has valid id");
  assert(Boolean(firstEvent?.title), "Event has title");
  assert(Boolean(firstEvent?.description), "Event has description");
  assert(Boolean(firstEvent?.eventDate), "Event has eventDate");
  assert(Boolean(firstEvent?.startTime), "Event has startTime");
  assert(Boolean(firstEvent?.location), "Event has location");
  assert(Boolean(firstEvent?.category), "Event has category");
  assert(Boolean(firstEvent?.organizer), "Event has organizer");
  assert(firstEvent?.status === "Published", "Public event has status Published");
  assert(typeof firstEvent?.isRegistrationRequired === "boolean", "Event has isRegistrationRequired boolean");

  // Time filter: upcoming
  const upcomingRes = await fetch(`${BASE_URL}/api/events?timeFilter=upcoming`);
  assert(upcomingRes.status === 200, "GET /api/events?timeFilter=upcoming returns HTTP 200");
  const upcomingJson = await upcomingRes.json();
  assert(upcomingJson.success === true, "Upcoming filter successful");

  // Time filter: all
  const allRes = await fetch(`${BASE_URL}/api/events?timeFilter=all`);
  assert(allRes.status === 200, "GET /api/events?timeFilter=all returns HTTP 200");
  const allJson = await allRes.json();
  assert(allJson.count >= upcomingJson.count, "Total events >= upcoming events count");

  // Category filter
  const catRes = await fetch(`${BASE_URL}/api/events?timeFilter=all&category=Cultural%20Events`);
  assert(catRes.status === 200, "GET /api/events?category=Cultural Events returns HTTP 200");
  const catJson = await catRes.json();
  assert(catJson.data?.every((e) => e.category === "Cultural Events"), "Filtered events all match Cultural Events");

  // Ward filter
  const wardRes = await fetch(`${BASE_URL}/api/events?timeFilter=all&ward=Ward%2004`);
  assert(wardRes.status === 200, "GET /api/events?ward=Ward 04 returns HTTP 200");
  const wardJson = await wardRes.json();
  assert(
    wardJson.data?.every(
      (e) =>
        e.wardRelevance.includes("All Wards") ||
        e.wardRelevance.includes("Entire Municipality") ||
        e.wardRelevance.includes("Ward 04") ||
        e.wardRelevance.includes("Ward 4")
    ),
    "Ward filter returns All Wards or events matching Ward 04"
  );

  // Keyword search
  const searchRes = await fetch(`${BASE_URL}/api/events?timeFilter=all&search=Someshwara`);
  assert(searchRes.status === 200, "GET /api/events?search=Someshwara returns HTTP 200");
  const searchJson = await searchRes.json();
  assert(searchJson.count >= 1, "Keyword search for 'Someshwara' returned matching records");

  // 2. Public Single Event Details API
  console.log("\n--- Section 2: Public Single Event Detail API ---");
  const testEventId = firstEvent.id;
  const detailRes = await fetch(`${BASE_URL}/api/events/${testEventId}`);
  assert(detailRes.status === 200, `GET /api/events/${testEventId} returns HTTP 200`);
  const detailJson = await detailRes.json();
  assert(detailJson.success === true, "Detail response has success: true");
  assert(detailJson.data?.id === testEventId, "Detail matches requested event ID");

  // Non-existent ID returns 404
  const notFoundRes = await fetch(`${BASE_URL}/api/events/EVT-NONEXISTENT-9999`);
  assert(notFoundRes.status === 404, "GET /api/events/EVT-NONEXISTENT returns HTTP 404");

  // 3. Admin Authentication & Security
  console.log("\n--- Section 3: Admin Authorization & Security ---");
  const unauthListRes = await fetch(`${BASE_URL}/api/admin/events`);
  assert(unauthListRes.status === 401, "GET /api/admin/events without credentials returns HTTP 401 Unauthorized");

  const unauthPostRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Hack event" }),
  });
  assert(unauthPostRes.status === 401, "POST /api/admin/events without credentials returns HTTP 401 Unauthorized");

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
  const adminListRes = await fetch(`${BASE_URL}/api/admin/events`, { headers: adminHeaders });
  assert(adminListRes.status === 200, "GET /api/admin/events with admin session returns HTTP 200");
  const adminListJson = await adminListRes.json();
  assert(adminListJson.success === true, "Admin events response has success: true");
  assert(Boolean(adminListJson.stats), "Admin events response includes stats object");
  assert(typeof adminListJson.stats.total === "number", "Stats includes total count");
  assert(typeof adminListJson.stats.upcoming === "number", "Stats includes upcoming count");
  assert(typeof adminListJson.stats.past === "number", "Stats includes past count");
  assert(typeof adminListJson.stats.registrationRequired === "number", "Stats includes registrationRequired count");

  // Admin POST create event
  const newEventData = {
    title: "Lakshmeshwar Youth Football Championship 2026",
    description: "Inter-ward annual sports tournament organized by TMC Lakshmeshwar for civic youth development.",
    eventDate: "2026-12-15",
    startTime: "09:00 AM",
    endTime: "06:00 PM",
    location: "Municipal Sports Ground, Ward 12",
    wardRelevance: "Ward 12, Ward 13",
    category: "Civic Events",
    organizer: "Lakshmeshwar Sports Committee & TMC",
    isRegistrationRequired: true,
    registrationLink: "https://lakshmeshwar.gov.in/sports/reg",
    capacity: 200,
    status: "Published",
  };

  const createRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(newEventData),
  });
  assert(createRes.status === 201, "POST /api/admin/events creates event and returns HTTP 201");
  const createJson = await createRes.json();
  assert(createJson.success === true, "Event creation successful");
  const createdEventId = createJson.data?.id;
  assert(Boolean(createdEventId), `Created event has ID: ${createdEventId}`);
  assert(createJson.data?.title === newEventData.title, "Created event matches submitted title");
  assert(createJson.data?.isRegistrationRequired === true, "isRegistrationRequired preserved");
  assert(createJson.data?.capacity === 200, "capacity preserved");

  // Admin GET single event
  const adminGetRes = await fetch(`${BASE_URL}/api/admin/events/${createdEventId}`, {
    headers: adminHeaders,
  });
  assert(adminGetRes.status === 200, `GET /api/admin/events/${createdEventId} returns HTTP 200`);
  const adminGetJson = await adminGetRes.json();
  assert(adminGetJson.data?.id === createdEventId, "Retrieved event matches ID");

  // Admin PATCH update event
  const patchRes = await fetch(`${BASE_URL}/api/admin/events/${createdEventId}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({
      title: "Lakshmeshwar Youth Football Tournament (Updated)",
      capacity: 350,
      status: "Published",
    }),
  });
  assert(patchRes.status === 200, `PATCH /api/admin/events/${createdEventId} returns HTTP 200`);
  const patchJson = await patchRes.json();
  assert(patchJson.data?.title === "Lakshmeshwar Youth Football Tournament (Updated)", "Title updated successfully");
  assert(patchJson.data?.capacity === 350, "Capacity updated successfully");

  // Verify in public list
  const pubVerifyRes = await fetch(`${BASE_URL}/api/events?search=Football`);
  const pubVerifyJson = await pubVerifyRes.json();
  assert(
    pubVerifyJson.data?.some((e) => e.id === createdEventId),
    "Updated event appears in public search query"
  );

  // Admin DELETE event
  const deleteRes = await fetch(`${BASE_URL}/api/admin/events/${createdEventId}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  assert(deleteRes.status === 200, `DELETE /api/admin/events/${createdEventId} returns HTTP 200`);

  // Verify deleted from public
  const verifyDeleteRes = await fetch(`${BASE_URL}/api/events/${createdEventId}`);
  assert(verifyDeleteRes.status === 404, "Deleted event returns HTTP 404 on public endpoint");

  // 5. Public and Admin Web Page Routes
  console.log("\n--- Section 5: Web Page HTTP Status Checks ---");
  const pubPageRes = await fetch(`${BASE_URL}/events`);
  assert(pubPageRes.status === 200, "GET /events returns HTTP 200");

  const pubDetailRes = await fetch(`${BASE_URL}/events/${testEventId}`);
  assert(pubDetailRes.status === 200, `GET /events/${testEventId} returns HTTP 200`);

  const adminPageRes = await fetch(`${BASE_URL}/admin/events`, {
    headers: { Cookie: adminCookieHeader },
  });
  assert(adminPageRes.status === 200, "GET /admin/events returns HTTP 200 with admin session");

  console.log("\n==================================================================");
  console.log(` Events Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
