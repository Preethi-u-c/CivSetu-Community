/**
 * Focused Verification Suite for CivSetu Session Lifetime & Authentication Cleanup
 *
 * Verifies:
 * 1. Login succeeds
 * 2. Session cookie is a browser-session cookie (no Max-Age, no persistent Expires)
 * 3. /api/auth/me returns authenticated after login
 * 4. Refresh / inter-page navigation remains authenticated
 * 5. Logout invalidates the session in PostgreSQL and clears cookie
 * 6. /api/auth/me returns 401 after logout
 * 7. Login page fields are clean and cleared after logout (no stored credentials)
 * 8. Dashboard protection blocks unauthenticated access
 */

import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Load DATABASE_URL
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

const pool = new pg.Pool({ connectionString: databaseUrl });

async function runSessionBehaviorTests() {
  console.log("================================================================");
  console.log(" CIVSETU SESSION LIFETIME & AUTHENTICATION CLEANUP TEST SUITE");
  console.log(" Base URL: " + BASE_URL);
  console.log("================================================================\n");

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

  const testMobile = "9876543201";
  const testEmail = "citizen.sessiontest@civsetu-tmc.gov.in";
  const testPassword = "SessionPass@2026";

  try {
    // 0. Ensure test citizen exists in database
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [testMobile, testEmail]);
    
    // Register test citizen through API
    const otpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: testMobile, purpose: "registration" }),
    });
    assert(otpRes.status === 200, "Setup: send-otp dispatched registration OTP");

    const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, otp: "123456", purpose: "registration" }),
    });
    assert(verifyRes.status === 200, "Setup: verify-otp confirmed mock OTP");

    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Session Test Citizen",
        mobileNumber: testMobile,
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        wardNumber: "Ward 07 - Fort Area",
        residentialAddress: "77 Heritage Street, Lakshmeshwar",
        otp: "123456",
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 200 && regData.success, "Setup: test citizen registered in PostgreSQL");

    // 1. TEST LOGIN SUCCEEDS
    console.log("\n[1] Testing: Login succeeds...");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, password: testPassword }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, "POST /api/auth/login returns HTTP 200 OK");
    assert(loginData.success === true, "Login response body has success = true");
    assert(loginData.data?.email === testEmail, "Citizen profile returned matches logged-in user");

    // 2. TEST SESSION COOKIE LIFETIME
    console.log("\n[2] Testing: Authentication cookie is a browser-session cookie...");
    const rawSetCookie = loginRes.headers.get("set-cookie") || "";
    assert(rawSetCookie.includes("civsetu_citizen_token="), "Set-Cookie contains civsetu_citizen_token");
    assert(rawSetCookie.toLowerCase().includes("httponly"), "Session cookie is HttpOnly for XSS security");
    assert(rawSetCookie.toLowerCase().includes("path=/"), "Session cookie scope has Path=/");
    assert(rawSetCookie.toLowerCase().includes("samesite=lax"), "Session cookie has SameSite=lax for CSRF protection");

    // Extract cookie attributes for civsetu_citizen_token
    const cookieParts = rawSetCookie.split(";").map((p) => p.trim());
    const hasMaxAge = cookieParts.some((p) => /^max-age=/i.test(p));
    const hasExpires = cookieParts.some((p) => /^expires=/i.test(p));
    assert(!hasMaxAge, "Session cookie does NOT have a persistent Max-Age attribute (terminates on browser close)");
    assert(!hasExpires, "Session cookie does NOT have an Expires attribute (terminates on browser close)");

    const tokenMatch = rawSetCookie.match(/civsetu_citizen_token=([^;]+)/);
    const sessionToken = tokenMatch ? tokenMatch[1] : "";
    assert(sessionToken.length > 10, "Valid session token generated: " + sessionToken.slice(0, 12) + "...");

    // 3. TEST /api/auth/me RETURNS AUTHENTICATED
    console.log("\n[3] Testing: /api/auth/me returns authenticated citizen profile...");
    const meRes1 = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `civsetu_citizen_token=${sessionToken}` },
    });
    const meData1 = await meRes1.json();
    assert(meRes1.status === 200, "GET /api/auth/me returns HTTP 200 OK");
    assert(meData1.authenticated === true, "/api/auth/me returns authenticated = true");
    assert(meData1.citizen?.mobileNumber === testMobile, "Returned citizen mobile matches session user");
    assert(meData1.citizen?.fullName === "Session Test Citizen", "Returned citizen name matches session user");

    // 4. TEST REFRESH / MULTIPLE PAGE REQUESTS REMAIN AUTHENTICATED
    console.log("\n[4] Testing: Refresh and page navigation remain authenticated...");
    // Simulate 3 page refreshes / navigations
    for (let i = 1; i <= 3; i++) {
      const refreshRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Cookie: `civsetu_citizen_token=${sessionToken}` },
      });
      const refreshData = await refreshRes.json();
      assert(
        refreshRes.status === 200 && refreshData.authenticated === true,
        `Refresh navigation #${i}: citizen remains authenticated`
      );
    }

    // 5. TEST LOGOUT INVALIDATES SERVER-SIDE SESSION & CLEARS COOKIE
    console.log("\n[5] Testing: Logout invalidates session and clears cookie...");
    // Check session exists in PostgreSQL before logout
    const sessionBeforeRes = await pool.query(
      "SELECT * FROM citizen_sessions WHERE id = $1;",
      [sessionToken]
    );
    assert(sessionBeforeRes.rows.length === 1, "Session record exists in PostgreSQL before logout");

    // Perform logout
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: `civsetu_citizen_token=${sessionToken}` },
    });
    const logoutData = await logoutRes.json();
    assert(logoutRes.status === 200, "POST /api/auth/logout returns HTTP 200 OK");
    assert(logoutData.success === true, "Logout response reports success = true");

    // Check Set-Cookie on logout response clears the cookie
    const logoutSetCookie = logoutRes.headers.get("set-cookie") || "";
    const clearsCookie =
      logoutSetCookie.includes("civsetu_citizen_token=;") ||
      logoutSetCookie.includes("civsetu_citizen_token=") &&
        (logoutSetCookie.toLowerCase().includes("max-age=0") ||
          logoutSetCookie.includes("1970"));
    assert(clearsCookie, "Logout response clears civsetu_citizen_token cookie (Max-Age=0 or Epoch expiry)");

    // Check session deleted from PostgreSQL
    const sessionAfterRes = await pool.query(
      "SELECT * FROM citizen_sessions WHERE id = $1;",
      [sessionToken]
    );
    assert(sessionAfterRes.rows.length === 0, "Session record destroyed in PostgreSQL citizen_sessions table");

    // 6. TEST /api/auth/me RETURNS 401 AFTER LOGOUT
    console.log("\n[6] Testing: /api/auth/me returns 401 Unauthenticated after logout...");
    const meAfterLogout = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `civsetu_citizen_token=${sessionToken}` },
    });
    const meAfterLogoutData = await meAfterLogout.json();
    assert(meAfterLogout.status === 401, "GET /api/auth/me returns HTTP 401 Unauthenticated");
    assert(meAfterLogoutData.authenticated === false, "/api/auth/me reports authenticated = false");
    assert(meAfterLogoutData.citizen === null, "/api/auth/me returns citizen = null");

    // 7. TEST LOGIN PAGE CLEANUP & NO STORED CREDENTIALS
    console.log("\n[7] Testing: Login page cleanup & credential isolation...");
    const loginPageRes = await fetch(`${BASE_URL}/login`);
    const loginPageHtml = await loginPageRes.text();
    assert(loginPageRes.status === 200, "GET /login returns HTTP 200 OK");
    assert(!loginPageHtml.includes(testMobile), "Login page HTML contains NO rendered mobile number");
    assert(!loginPageHtml.includes(testPassword), "Login page HTML contains NO rendered password");
    assert(!loginPageHtml.includes("Remember this device"), "Obsolete Remember Me checkbox removed from DOM");
    assert(loginPageHtml.includes('name="username"'), 'Identifier field has name="username"');
    assert(loginPageHtml.includes('autoComplete="username"') || loginPageHtml.includes('autocomplete="username"'), 'Identifier field has autoComplete="username"');
    assert(loginPageHtml.includes('name="password"'), 'Password field has name="password"');
    assert(loginPageHtml.includes('autoComplete="current-password"') || loginPageHtml.includes('autocomplete="current-password"'), 'Password field has autoComplete="current-password"');
    assert(loginPageHtml.includes('autocomplete="off"') || loginPageHtml.includes('autoComplete="off"'), 'Form tag has autoComplete="off" to prevent browser session-history caching');

    // Verify source code cleanliness in login page
    const loginSrc = fs.readFileSync(path.join(__dirname, "..", "src", "app", "login", "page.tsx"), "utf-8");
    assert(loginSrc.includes('const [identifier, setIdentifier] = useState("")'), 'React initial state for identifier is empty string');
    assert(loginSrc.includes('const [password, setPassword] = useState("")'), 'React initial state for password is empty string');
    assert(loginSrc.includes('resetLoginForm();'), 'Login page calls resetLoginForm on mount and state reset');
    assert(loginSrc.includes('formRef.current.reset()'), 'Login page resets HTML form DOM element via ref');
    assert(loginSrc.includes('window.addEventListener("pageshow", handlePageShow)'), 'Login page hooks into bfcache pageshow to reset form on back/forward return');
    assert(loginSrc.includes('document.addEventListener("visibilitychange", handleVisibilityChange)'), 'Login page hooks into visibilitychange to ensure clean inputs on tab focus');
    assert(!loginSrc.includes('localStorage.setItem("civsetu_remember_identifier"'), 'No credential storing in localStorage');
    assert(!loginSrc.includes('sessionStorage.setItem("civsetu_remember_identifier"'), 'No credential storing in sessionStorage');

    // 8. TEST DASHBOARD AUTHENTICATION PROTECTION
    console.log("\n[8] Testing: Dashboard authentication protection...");
    const unauthDashboardRes = await fetch(`${BASE_URL}/api/auth/me`);
    const unauthDashboardData = await unauthDashboardRes.json();
    assert(unauthDashboardRes.status === 401, "Unauthenticated session cannot access citizen profile API");
    assert(unauthDashboardData.authenticated === false, "Access rejected without active session");

    // 9. TEST CITIZEN LOGIN INPUT INTERACTION & REDIRECT PRESERVATION
    console.log("\n[9] Testing: Login input typing interaction & redirect preservation...");
    // Verify useEffect does NOT include identifier or password in dependencies (which caused typing reset bug)
    assert(!loginSrc.includes("[resetLoginForm, identifier, password]"), "Mount/cleanup effect does NOT include identifier/password in dependencies (prevents typing reset)");
    assert(loginSrc.includes("hasUserTyped"), "Input interaction tracked with hasUserTyped ref to safeguard active user typing");
    assert(loginSrc.includes("hasUserTyped.current = true;"), "Typing in identifier or password marks hasUserTyped as true");
    assert(loginSrc.includes("hasUserTyped.current = false;"), "Form reset properly clears hasUserTyped");

    // Verify redirect query parameter handling
    assert(loginSrc.includes('params.get("redirect")'), "Reads redirect query parameter from URL on mount");
    assert(loginSrc.includes("redirect.startsWith(\"/\") && !redirect.startsWith(\"//\")"), "Validates redirect parameter is a safe relative path (prevents open-redirect)");
    assert(loginSrc.includes("const destination = redirectPath || \"/dashboard\";"), "Navigates to requested redirect path upon successful login, defaulting to /dashboard");
    assert(loginSrc.includes("window.location.href = destination;"), "Performs browser redirect to preserved destination");

    // Test live HTTP response with redirect query parameter
    const redirectTestUrl = `${BASE_URL}/login?redirect=${encodeURIComponent("/track?id=CMP-LMC-2026-95709F69A")}`;
    const redirectLoginRes = await fetch(redirectTestUrl);
    const redirectHtml = await redirectLoginRes.text();
    assert(!redirectHtml.includes('id="identifier" disabled') && !redirectHtml.includes('id="password" disabled') && !redirectHtml.includes('disabled=""'), "Login form inputs are NOT disabled");
    assert(!redirectHtml.includes('id="identifier" readonly') && !redirectHtml.includes('id="password" readonly'), "Login form inputs are NOT readonly");

    // Clean up test citizen
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [testMobile, testEmail]);
    await pool.end();
    console.log("\n  ✓ Test cleanup: removed test citizen from database.");

    console.log("\n================================================================");
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed with error:", err);
    if (pool) await pool.end();
    process.exit(1);
  }
}

runSessionBehaviorTests();
