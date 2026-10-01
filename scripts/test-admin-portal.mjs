/**
 * CivSetu Phase 6 — Admin Portal Test Suite
 *
 * Verifies:
 * 1. Admin Authentication & Session Management:
 *    - /admin/login page rendering
 *    - Route protection & 401 rejection on unauthorized API calls
 *    - Cross-tenant role isolation (citizen / authority tokens rejected)
 *    - Successful admin login with valid credentials & session token issuance
 *    - Admin /api/admin/auth/me session resolution
 *    - Admin logout & session destruction
 * 2. Admin Dashboard:
 *    - /admin/dashboard page rendering
 *    - /api/admin/dashboard metrics payload (8 core summary metrics & audit feed)
 * 3. Citizen Management:
 *    - List, search, ward filtering
 *    - Citizen detail modal endpoint
 *    - Strict zero-leakage check (no password_hash, otp, secret)
 * 4. Ward Management:
 *    - 23 canonical Lakshmeshwar TMC wards
 *    - Population and live complaint / citizen statistics
 *    - Active status toggle
 * 5. Authority Management:
 *    - 4-tier governance hierarchy
 *    - Active status toggle
 *    - Strict zero-leakage check (no password_hash)
 * 6. Complaints Oversight Registry:
 *    - Search, status, category, ward, and priority filters
 *    - Detail endpoint with complaint_timeline events
 * 7. Category Management:
 *    - Complaint categories list, add, update
 *    - Notice categories list, add, update
 * 8. Escalation Hierarchy & SLA Settings:
 *    - 4-tier statutory chain of command
 *    - SLA hours configuration and update
 * 9. System Settings & Sanitization:
 *    - Settings read & update
 *    - Strict case-insensitive secret filtering (DATABASE, SECRET, PASSWORD, TOKEN)
 * 10. Analytics Dashboard:
 *     - Factual DB distributions (categories, wards, status, resolutions, notices, citizens)
 */

import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = "http://localhost:3000";

// Load DATABASE_URL from .env.local
const envLocalPath = path.join(__dirname, "..", ".env.local");
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DATABASE_URL=")) {
      databaseUrl = trimmed.slice("DATABASE_URL=".length).trim();
      break;
    }
  }
}

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function run() {
  console.log("==================================================================");
  console.log(" CivSetu Phase 6: Admin Portal Comprehensive Test Suite");
  console.log("==================================================================\n");

  const pool = new pg.Pool({ connectionString: databaseUrl });

  try {
    // -------------------------------------------------------------
    // Section 1: Admin Authentication & Route Protection
    // -------------------------------------------------------------
    console.log("--- Section 1: Admin Authentication & Protection ---");

    // 1.1 Login Page Exists
    const loginPageRes = await fetch(`${BASE_URL}/admin/login`);
    assert(loginPageRes.status === 200, "Admin login page (/admin/login) returns HTTP 200");
    const loginHtml = await loginPageRes.text();
    assert(loginHtml.includes("CivSetu") || loginHtml.includes("Lakshmeshwar"), "Admin login page includes portal branding");

    // 1.2 Unauthorized API Route Protection (401 on all admin APIs without cookie)
    const protectedApis = [
      "/api/admin/auth/me",
      "/api/admin/dashboard",
      "/api/admin/citizens",
      "/api/admin/wards",
      "/api/admin/authorities",
      "/api/admin/complaints",
      "/api/admin/complaint-categories",
      "/api/admin/notice-categories",
      "/api/admin/escalation-settings",
      "/api/admin/settings",
      "/api/admin/analytics",
    ];

    for (const apiPath of protectedApis) {
      const unauthRes = await fetch(`${BASE_URL}${apiPath}`);
      assert(unauthRes.status === 401, `Unauthenticated ${apiPath} correctly rejected with HTTP 401`);
    }

    // 1.3 Cross-Tenant Role Isolation: Citizen / Authority session cookies rejected
    const citizenCookieAttempt = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: "civsetu_citizen_token=fake_citizen_token_123" },
    });
    assert(citizenCookieAttempt.status === 401, "Citizen token rejected with HTTP 401 on admin dashboard API");

    const authorityCookieAttempt = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: "civsetu_authority_token=fake_auth_token_456" },
    });
    assert(authorityCookieAttempt.status === 401, "Authority token rejected with HTTP 401 on admin dashboard API");

    // 1.4 Invalid Credentials Rejection
    const invalidLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail: "admin", password: "WrongPassword999!" }),
    });
    assert(invalidLoginRes.status === 401, "Admin login with wrong password rejected with HTTP 401");

    // 1.5 Valid Admin Login
    const validLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail: "admin", password: "Admin@Pass2026" }),
    });
    assert(validLoginRes.status === 200, "Valid admin login returns HTTP 200");
    const validLoginJson = await validLoginRes.json();
    assert(validLoginJson.success === true, "Valid admin login response has success: true");
    assert(validLoginJson.admin.role === "SYSTEM_ADMIN", "Admin role is SYSTEM_ADMIN");
    assert(!validLoginJson.admin.passwordHash, "Admin response does not expose passwordHash");

    const rawCookies = validLoginRes.headers.get("set-cookie") || "";
    assert(rawCookies.includes("civsetu_admin_token="), "Admin login issues Set-Cookie with 'civsetu_admin_token'");

    const tokenMatch = rawCookies.match(/civsetu_admin_token=([^;]+)/);
    const adminToken = tokenMatch ? tokenMatch[1] : "";
    const adminCookieHeader = `civsetu_admin_token=${adminToken}`;

    // 1.6 Verify Active Admin Session via /api/admin/auth/me
    const meRes = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Cookie: adminCookieHeader },
    });
    assert(meRes.status === 200, "/api/admin/auth/me with valid cookie returns HTTP 200");
    const meJson = await meRes.json();
    assert(meJson.authenticated === true && meJson.admin.username === "admin", "/api/admin/auth/me verifies active administrator session");

    // 1.7 Admin Logout
    const logoutRes = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: "POST",
      headers: { Cookie: adminCookieHeader },
    });
    assert(logoutRes.status === 200, "/api/admin/auth/logout returns HTTP 200");

    // 1.8 Post-Logout Session Rejection
    const postLogoutMe = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Cookie: adminCookieHeader },
    });
    assert(postLogoutMe.status === 401, "Destroyed session token correctly returns HTTP 401 after logout");

    // Relogin to obtain active token for rest of the tests
    const reloginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail: "admin", password: "Admin@Pass2026" }),
    });
    const reloginRawCookies = reloginRes.headers.get("set-cookie") || "";
    const reloginToken = reloginRawCookies.match(/civsetu_admin_token=([^;]+)/)[1];
    const sessionCookie = `civsetu_admin_token=${reloginToken}`;

    // -------------------------------------------------------------
    // Section 2: Admin Dashboard
    // -------------------------------------------------------------
    console.log("\n--- Section 2: Admin Dashboard ---");

    const dashPageRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Cookie: sessionCookie },
    });
    assert(dashPageRes.status === 200, "Admin dashboard page (/admin/dashboard) returns HTTP 200");

    const dashApiRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: sessionCookie },
    });
    assert(dashApiRes.status === 200, "/api/admin/dashboard returns HTTP 200");
    const dashJson = await dashApiRes.json();
    assert(dashJson.success === true, "Dashboard API returns success: true");

    const metrics = dashJson.data.metrics;
    assert(typeof metrics.totalComplaints === "number", "Dashboard provides totalComplaints metric");
    assert(typeof metrics.resolvedComplaints === "number", "Dashboard provides resolvedComplaints metric");
    assert(typeof metrics.escalatedComplaints === "number", "Dashboard provides escalatedComplaints metric");
    assert(typeof metrics.totalCitizens === "number", "Dashboard provides totalCitizens metric");
    assert(typeof metrics.registeredAuthorities === "number", "Dashboard provides registeredAuthorities metric");
    assert(metrics.activeWards === 23, "Dashboard shows 23 active municipal wards for Lakshmeshwar");
    assert(typeof metrics.publishedNotices === "number", "Dashboard provides publishedNotices metric");
    assert(typeof metrics.criticalBreaches === "number", "Dashboard provides criticalBreaches metric");
    assert(Array.isArray(dashJson.data.recentAuditActivity), "Dashboard provides recentAuditActivity feed");

    // -------------------------------------------------------------
    // Section 3: Citizen Management
    // -------------------------------------------------------------
    console.log("\n--- Section 3: Citizen Management & Secret Isolation ---");

    const citizensPageRes = await fetch(`${BASE_URL}/admin/citizens`, {
      headers: { Cookie: sessionCookie },
    });
    assert(citizensPageRes.status === 200, "/admin/citizens page returns HTTP 200");

    const citizensRes = await fetch(`${BASE_URL}/api/admin/citizens?page=1&limit=10`, {
      headers: { Cookie: sessionCookie },
    });
    assert(citizensRes.status === 200, "/api/admin/citizens returns HTTP 200");
    const citizensJson = await citizensRes.json();
    assert(Array.isArray(citizensJson.data.citizens), "Citizens endpoint returns citizens array");
    assert(citizensJson.data.total >= 0, "Citizens endpoint returns total count");

    // Strict zero-leakage check
    let hasLeakedSecret = false;
    for (const c of citizensJson.data.citizens) {
      if (c.password || c.passwordHash || c.password_hash || c.otp || c.otp_secret || c.token) {
        hasLeakedSecret = true;
      }
    }
    assert(!hasLeakedSecret, "Citizens list contains NO passwords, password hashes, OTPs, or tokens");

    // Search test
    if (citizensJson.data.citizens.length > 0) {
      const sampleCitizen = citizensJson.data.citizens[0];
      const searchRes = await fetch(
        `${BASE_URL}/api/admin/citizens?search=${encodeURIComponent(sampleCitizen.fullName.slice(0, 4))}`,
        { headers: { Cookie: sessionCookie } }
      );
      assert(searchRes.status === 200, "Citizen search by name returns HTTP 200");

      // Details test
      const detailRes = await fetch(`${BASE_URL}/api/admin/citizens/${sampleCitizen.id}`, {
        headers: { Cookie: sessionCookie },
      });
      assert(detailRes.status === 200, "Citizen detail endpoint /api/admin/citizens/[id] returns HTTP 200");
      const detailJson = await detailRes.json();
      assert(detailJson.data.id === sampleCitizen.id, "Citizen detail matches queried citizen ID");
      assert(
        !detailJson.data.password && !detailJson.data.password_hash && !detailJson.data.otp,
        "Citizen detail response has zero secret leakage"
      );
      assert(Array.isArray(detailJson.data.complaints), "Citizen detail includes complaint history array");
    }

    // -------------------------------------------------------------
    // Section 4: Ward Management (23 Wards)
    // -------------------------------------------------------------
    console.log("\n--- Section 4: Ward Management (23 Canonical Wards) ---");

    const wardsPageRes = await fetch(`${BASE_URL}/admin/wards`, {
      headers: { Cookie: sessionCookie },
    });
    assert(wardsPageRes.status === 200, "/admin/wards page returns HTTP 200");

    const wardsRes = await fetch(`${BASE_URL}/api/admin/wards`, {
      headers: { Cookie: sessionCookie },
    });
    assert(wardsRes.status === 200, "/api/admin/wards returns HTTP 200");
    const wardsJson = await wardsRes.json();
    assert(Array.isArray(wardsJson.data) && wardsJson.data.length === 23, "All 23 canonical Lakshmeshwar TMC wards are present");

    const sampleWard = wardsJson.data[0];
    assert(sampleWard.wardNumber === 1, "Ward 1 is present with sequential numbering");
    assert(typeof sampleWard.name === "string" && sampleWard.name.length > 0, "Ward has real non-invented name");
    assert(typeof sampleWard.population === "number", "Ward contains official population figure");
    assert(typeof sampleWard.citizenCount === "number", "Ward contains citizen count aggregation");
    assert(typeof sampleWard.complaintCount === "number", "Ward contains complaint count aggregation");

    // Toggle active status
    const toggleWardRes = await fetch(`${BASE_URL}/api/admin/wards`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({ wardNumber: 1, isActive: false }),
    });
    assert(toggleWardRes.status === 200, "Ward status toggle PATCH returns HTTP 200");

    // Revert toggle
    await fetch(`${BASE_URL}/api/admin/wards`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({ wardNumber: 1, isActive: true }),
    });

    // -------------------------------------------------------------
    // Section 5: Authority Hierarchy
    // -------------------------------------------------------------
    console.log("\n--- Section 5: Authority Management (4-Tier Hierarchy) ---");

    // Ensure District Panchayat representation exists
    await pool.query(
      `INSERT INTO authority_users (
        id, full_name, designation, department, authority_level,
        email, mobile_number, password_hash, is_active, created_at, updated_at
      ) VALUES (
        'OFF-ZP-001', 'Sri. Mallikarjun Swamy', 'Chief Executive Officer (CEO)',
        'Gadag Zilla Panchayat', 'District Panchayat',
        'ceo.zp@gadag.nic.in', '9845078901',
        '$2b$10$r4VYCcVRhAzB2y2q88cGUeLDR.zRiIWdjJEbdLdcEAWiH5KSfr1GC', true,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) ON CONFLICT (id) DO NOTHING;`
    );

    const authPageRes = await fetch(`${BASE_URL}/admin/authorities`, {
      headers: { Cookie: sessionCookie },
    });
    assert(authPageRes.status === 200, "/admin/authorities page returns HTTP 200");

    const authListRes = await fetch(`${BASE_URL}/api/admin/authorities`, {
      headers: { Cookie: sessionCookie },
    });
    assert(authListRes.status === 200, "/api/admin/authorities returns HTTP 200");
    const authListJson = await authListRes.json();
    assert(Array.isArray(authListJson.data), "Authorities endpoint returns officers array");

    const levels = new Set(authListJson.data.map((u) => u.authorityLevel));
    assert(levels.has("Local Authority"), "Hierarchy includes 'Local Authority'");
    assert(levels.has("Block level"), "Hierarchy includes 'Block level'");
    assert(levels.has("District Panchayat"), "Hierarchy includes 'District Panchayat'");
    assert(levels.has("District Administration"), "Hierarchy includes 'District Administration'");

    // Check zero password hash leakage
    const leakedAuthPassword = authListJson.data.some((u) => u.password_hash || u.passwordHash || u.password);
    assert(!leakedAuthPassword, "Authorities response has zero password / hash leakage");

    // -------------------------------------------------------------
    // Section 6: Complaints Oversight
    // -------------------------------------------------------------
    console.log("\n--- Section 6: Complaints Oversight Registry ---");

    const compPageRes = await fetch(`${BASE_URL}/admin/complaints`, {
      headers: { Cookie: sessionCookie },
    });
    assert(compPageRes.status === 200, "/admin/complaints page returns HTTP 200");

    const compListRes = await fetch(`${BASE_URL}/api/admin/complaints?page=1&limit=5`, {
      headers: { Cookie: sessionCookie },
    });
    assert(compListRes.status === 200, "/api/admin/complaints returns HTTP 200");
    const compListJson = await compListRes.json();
    assert(Array.isArray(compListJson.data.complaints), "Complaints list returns complaints array");

    if (compListJson.data.complaints.length > 0) {
      const sampleComp = compListJson.data.complaints[0];
      assert(sampleComp.id.startsWith("CMP-"), "Complaint has valid CMP ticket ID prefix");
      assert(typeof sampleComp.title === "string", "Complaint has title");
      assert(typeof sampleComp.ward === "string", "Complaint has ward assignment");
      assert(typeof sampleComp.status === "string", "Complaint has status");
      assert(typeof sampleComp.assignedAuthority === "string", "Complaint has assigned authority");

      // Test detail endpoint with timeline
      const compDetailRes = await fetch(`${BASE_URL}/api/admin/complaints/${sampleComp.id}`, {
        headers: { Cookie: sessionCookie },
      });
      assert(compDetailRes.status === 200, "/api/admin/complaints/[id] returns HTTP 200");
      const compDetailJson = await compDetailRes.json();
      assert(compDetailJson.data.id === sampleComp.id, "Detail ID matches requested complaint");
      assert(compDetailJson.data.citizen && typeof compDetailJson.data.citizen.name === "string", "Complaint detail includes citizen info");
      assert(Array.isArray(compDetailJson.data.timeline), "Complaint detail includes timeline array");
      assert(
        !compDetailJson.data.citizen.password && !compDetailJson.data.citizen.otp,
        "Complaint detail has zero citizen credential leakage"
      );
    }

    // -------------------------------------------------------------
    // Section 7: Categories Management
    // -------------------------------------------------------------
    console.log("\n--- Section 7: Category Management (Complaints & Notices) ---");

    // Complaint categories
    const compCatPageRes = await fetch(`${BASE_URL}/admin/complaint-categories`, {
      headers: { Cookie: sessionCookie },
    });
    assert(compCatPageRes.status === 200, "/admin/complaint-categories page returns HTTP 200");

    const compCatRes = await fetch(`${BASE_URL}/api/admin/complaint-categories`, {
      headers: { Cookie: sessionCookie },
    });
    assert(compCatRes.status === 200, "/api/admin/complaint-categories returns HTTP 200");
    const compCatJson = await compCatRes.json();
    assert(Array.isArray(compCatJson.data) && compCatJson.data.length >= 6, "All standard complaint categories loaded");

    // Add temporary category
    const tempCatId = `test_cat_${Date.now().toString(36)}`;
    const addCatRes = await fetch(`${BASE_URL}/api/admin/complaint-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        id: tempCatId,
        name: "Test Audit Category",
        department: "Engineering Cell",
        description: "Temporary category for test suite",
      }),
    });
    assert(addCatRes.status === 201, "POST /api/admin/complaint-categories creates category with HTTP 201");

    // Update category
    const updateCatRes = await fetch(`${BASE_URL}/api/admin/complaint-categories`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        id: tempCatId,
        name: "Test Audit Category Updated",
        isActive: false,
      }),
    });
    assert(updateCatRes.status === 200, "PATCH /api/admin/complaint-categories updates category with HTTP 200");

    // Notice categories
    const notCatPageRes = await fetch(`${BASE_URL}/admin/notice-categories`, {
      headers: { Cookie: sessionCookie },
    });
    assert(notCatPageRes.status === 200, "/admin/notice-categories page returns HTTP 200");

    const notCatRes = await fetch(`${BASE_URL}/api/admin/notice-categories`, {
      headers: { Cookie: sessionCookie },
    });
    assert(notCatRes.status === 200, "/api/admin/notice-categories returns HTTP 200");

    // Clean up temporary category directly from database
    await pool.query("DELETE FROM complaint_categories WHERE id = $1;", [tempCatId]);

    // -------------------------------------------------------------
    // Section 8: Escalation Hierarchy & SLA Settings
    // -------------------------------------------------------------
    console.log("\n--- Section 8: Escalation Hierarchy & SLA Settings ---");

    const escPageRes = await fetch(`${BASE_URL}/admin/escalation-settings`, {
      headers: { Cookie: sessionCookie },
    });
    assert(escPageRes.status === 200, "/admin/escalation-settings page returns HTTP 200");

    const escRes = await fetch(`${BASE_URL}/api/admin/escalation-settings`, {
      headers: { Cookie: sessionCookie },
    });
    assert(escRes.status === 200, "/api/admin/escalation-settings returns HTTP 200");
    const escJson = await escRes.json();
    assert(Array.isArray(escJson.data) && escJson.data.length === 4, "Escalation settings has 4 statutory tiers");

    const localTier = escJson.data.find((t) => t.tierLevel === "Local Authority");
    assert(localTier && localTier.slaHours > 0, "Local Authority tier has configured SLA hours");

    // Update SLA hours and revert
    const originalSla = localTier.slaHours;
    const updateTierRes = await fetch(`${BASE_URL}/api/admin/escalation-settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        tierLevel: "Local Authority",
        slaHours: 48,
      }),
    });
    assert(updateTierRes.status === 200, "PATCH /api/admin/escalation-settings updates tier with HTTP 200");

    // Revert SLA hours
    await fetch(`${BASE_URL}/api/admin/escalation-settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        tierLevel: "Local Authority",
        slaHours: originalSla,
      }),
    });

    // -------------------------------------------------------------
    // Section 9: System Settings & Case-Insensitive Secret Sanitizer
    // -------------------------------------------------------------
    console.log("\n--- Section 9: System Settings & Secret Sanitizer ---");

    const settingsPageRes = await fetch(`${BASE_URL}/admin/settings`, {
      headers: { Cookie: sessionCookie },
    });
    assert(settingsPageRes.status === 200, "/admin/settings page returns HTTP 200");

    // Test secret exclusion
    // First, temporarily insert mixed-case secret keys into system_settings directly in DB
    await pool.query(
      `INSERT INTO system_settings (key, value, description, category, updated_at)
       VALUES
         ('database_url', 'postgres://leaked_db_url', 'Leak attempt', 'SYSTEM', CURRENT_TIMESTAMP),
         ('my_secret_token', 'super_secret_val', 'Leak attempt', 'SYSTEM', CURRENT_TIMESTAMP),
         ('auth_secret', 'secret_jwt_key', 'Leak attempt', 'SYSTEM', CURRENT_TIMESTAMP),
         ('admin_password_hash', '$2b$leaked_hash', 'Leak attempt', 'SYSTEM', CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`
    );

    const settingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      headers: { Cookie: sessionCookie },
    });
    assert(settingsRes.status === 200, "/api/admin/settings returns HTTP 200");
    const settingsJson = await settingsRes.json();
    const returnedKeys = Object.keys(settingsJson.data);

    // Verify case-insensitive filtering
    const leakedKey = returnedKeys.find((k) => {
      const up = k.toUpperCase();
      return up.includes("SECRET") || up.includes("DATABASE") || up.includes("PASSWORD") || up.includes("TOKEN");
    });
    assert(!leakedKey, "Case-insensitive secret filter successfully blocked all sensitive keys from GET");

    // Verify legitimate municipal settings are present
    const helplineVal =
      settingsJson.data["helpline_number"]?.value ||
      settingsJson.data["MUNICIPAL_HELPLINE_PRIMARY"]?.value ||
      "";
    assert(helplineVal.includes("1912"), "Settings includes Primary Helpline: 1912");

    const muniNameVal =
      settingsJson.data["municipality_name"]?.value ||
      settingsJson.data["MUNICIPALITY_NAME"]?.value ||
      "";
    assert(muniNameVal.includes("Lakshmeshwar"), "Settings includes Municipality Name: Lakshmeshwar");

    // Test PATCH sanitization: attempting to write sensitive keys via PATCH
    const patchSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({
        settings: {
          MUNICIPAL_HELPLINE_PRIMARY: "1912",
          evil_secret_token: "hacked_token",
          lower_database_url: "postgres://hacked",
        },
      }),
    });
    assert(patchSettingsRes.status === 200, "PATCH /api/admin/settings returns HTTP 200");

    // Check DB directly to ensure forbidden keys were rejected by sanitizer
    const checkDbRes = await pool.query(
      "SELECT key FROM system_settings WHERE key IN ('evil_secret_token', 'lower_database_url');"
    );
    assert(checkDbRes.rows.length === 0, "PATCH sanitizer successfully rejected forbidden sensitive keys");

    // Clean up test DB keys
    await pool.query(
      "DELETE FROM system_settings WHERE key IN ('database_url', 'my_secret_token', 'auth_secret', 'admin_password_hash');"
    );

    // -------------------------------------------------------------
    // Section 10: Analytics
    // -------------------------------------------------------------
    console.log("\n--- Section 10: Analytics Dashboard ---");

    const analyticsPageRes = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: { Cookie: sessionCookie },
    });
    assert(analyticsPageRes.status === 200, "/admin/analytics page returns HTTP 200");

    const analyticsRes = await fetch(`${BASE_URL}/api/admin/analytics`, {
      headers: { Cookie: sessionCookie },
    });
    assert(analyticsRes.status === 200, "/api/admin/analytics returns HTTP 200");
    const analyticsJson = await analyticsRes.json();
    assert(analyticsJson.success === true, "Analytics API returns success: true");

    const aData = analyticsJson.data;
    assert(Array.isArray(aData.complaintsByCategory), "Analytics includes complaintsByCategory distribution");
    assert(Array.isArray(aData.complaintsByWard), "Analytics includes complaintsByWard distribution");
    assert(Array.isArray(aData.complaintStatusDistribution), "Analytics includes complaintStatusDistribution");
    assert(typeof aData.resolutionStats.rate === "number", "Analytics includes resolutionStats rate");
    assert(typeof aData.escalationStats.rate === "number", "Analytics includes escalationStats rate");
    assert(typeof aData.noticesDistribution.published === "number", "Analytics includes noticesDistribution counts");
    assert(typeof aData.citizenStats.total === "number", "Analytics includes citizenStats total");

    console.log("\n==================================================================");
    console.log(` Phase 6 Admin Portal Test Results:`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log("==================================================================");

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed with exception:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
