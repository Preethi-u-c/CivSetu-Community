/**
 * Automated Test Suite for CivSetu-Community Authentication Backend APIs
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=================================================");
  console.log(" CIVSETU CITIZEN AUTHENTICATION BACKEND TEST SUITE");
  console.log(" Base URL: " + BASE_URL);
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
    // 1. GET /api/auth/me (Unauthenticated)
    console.log("[1] Testing GET /api/auth/me (Unauthenticated)...");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`);
    const meJson = await meRes.json();
    assert(meRes.status === 401, "GET /api/auth/me returns 401 when no session cookie present");
    assert(meJson.authenticated === false, "authenticated flag is false");

    // 2. POST /api/auth/register (Missing Required Fields)
    console.log("\n[2] Testing POST /api/auth/register (Missing Fields Validation)...");
    const regInvalidRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Test" }),
    });
    const regInvalidJson = await regInvalidRes.json();
    assert(
      regInvalidRes.status === 400 || regInvalidRes.status === 503,
      "POST /api/auth/register rejects missing fields or flags unconfigured DB"
    );
    assert(regInvalidJson.success === false, "success is false on invalid input");
    assert(typeof regInvalidJson.error === "string", "Helpful error message returned: " + regInvalidJson.error);

    // 3. POST /api/auth/login (Missing Credentials)
    console.log("\n[3] Testing POST /api/auth/login (Missing Credentials Validation)...");
    const loginInvalidRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const loginInvalidJson = await loginInvalidRes.json();
    assert(
      loginInvalidRes.status === 400 || loginInvalidRes.status === 503,
      "POST /api/auth/login rejects empty payload or flags unconfigured DB"
    );
    assert(loginInvalidJson.success === false, "success is false on missing credentials");

    // 4. POST /api/auth/send-otp (Invalid Mobile Number)
    console.log("\n[4] Testing POST /api/auth/send-otp (Mobile Format Validation)...");
    const otpInvalidRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: "12345" }),
    });
    const otpInvalidJson = await otpInvalidRes.json();
    assert(
      otpInvalidRes.status === 400 || otpInvalidRes.status === 503,
      "POST /api/auth/send-otp validates Indian 10-digit mobile number format"
    );
    assert(otpInvalidJson.success === false, "success is false on invalid phone format");

    // 5. POST /api/auth/verify-otp (Missing OTP)
    console.log("\n[5] Testing POST /api/auth/verify-otp (Missing Parameters)...");
    const verifyInvalidRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "9876543210" }),
    });
    const verifyInvalidJson = await verifyInvalidRes.json();
    assert(
      verifyInvalidRes.status === 400 || verifyInvalidRes.status === 503,
      "POST /api/auth/verify-otp requires both identifier and OTP"
    );

    // 6. POST /api/auth/forgot-password (Empty Identifier)
    console.log("\n[6] Testing POST /api/auth/forgot-password (Validation)...");
    const forgotInvalidRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const forgotInvalidJson = await forgotInvalidRes.json();
    assert(
      forgotInvalidRes.status === 400 || forgotInvalidRes.status === 503,
      "POST /api/auth/forgot-password validates non-empty identifier"
    );

    // 7. POST /api/auth/logout (Session Invalidation)
    console.log("\n[7] Testing POST /api/auth/logout...");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST" });
    const logoutJson = await logoutRes.json();
    assert(logoutRes.status === 200, "POST /api/auth/logout returns 200 OK");
    assert(logoutJson.success === true, "Logout reports success: true");

    // =========================================================================
    // SECTION B: END-TO-END POSTGRESQL INTEGRATION FLOWS
    // =========================================================================
    console.log("\n=================================================");
    console.log(" END-TO-END POSTGRESQL AUTHENTICATION FLOWS");
    console.log("=================================================");

    const testMobile = "9876500001";
    const testEmail = "testcitizen.authtest@civsetu.internal";
    const testPassword = "SecurePassword123!";
    const newPassword = "NewSecurePassword456!";

    // Clean up any stale test user before starting
    const fs = await import("fs");
    const path = await import("path");
    const pg = await import("pg");
    const envLocalPath = path.resolve(process.cwd(), ".env.local");
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

    let pool = null;
    if (databaseUrl) {
      pool = new pg.Pool({ connectionString: databaseUrl });
      await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [testMobile, testEmail]);
    }

    // 8. POST /api/auth/send-otp (Registration OTP)
    console.log("\n[8] Testing POST /api/auth/send-otp (Registration OTP Flow)...");
    const sendOtpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: testMobile, purpose: "registration" }),
    });
    const sendOtpJson = await sendOtpRes.json();
    assert(sendOtpRes.status === 200, "POST /api/auth/send-otp returns 200 OK");
    assert(sendOtpJson.success === true, "send-otp response reports success: true");

    // 9. POST /api/auth/verify-otp (Verify Registration OTP)
    console.log("\n[9] Testing POST /api/auth/verify-otp (Verify OTP in DB)...");
    const verifyOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, otp: "123456", purpose: "registration" }),
    });
    const verifyOtpJson = await verifyOtpRes.json();
    assert(verifyOtpRes.status === 200, "POST /api/auth/verify-otp returns 200 OK");
    assert(verifyOtpJson.success === true, "verify-otp reports success: true");

    // 10. POST /api/auth/register (Create Citizen in PostgreSQL)
    console.log("\n[10] Testing POST /api/auth/register (Create Citizen in PostgreSQL)...");
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Citizen Verification",
        mobileNumber: testMobile,
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        wardNumber: "Ward 12 - Indiranagar",
        residentialAddress: "123 Civic Road, Ward 12, Bengaluru",
        otp: "123456",
      }),
    });
    const regJson = await regRes.json();
    assert(regRes.status === 200, "POST /api/auth/register returns 200 OK");
    assert(regJson.success === true, "register reports success: true");
    assert(typeof regJson.data?.id === "string" && regJson.data.id.startsWith("CTZ-"), "Valid Citizen ID generated: " + regJson.data?.id);

    // 11. POST /api/auth/login (Authenticate with PostgreSQL credentials)
    console.log("\n[11] Testing POST /api/auth/login (Authenticate against PostgreSQL)...");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testMobile,
        password: testPassword,
      }),
    });
    const loginJson = await loginRes.json();
    assert(loginRes.status === 200, "POST /api/auth/login returns 200 OK");
    assert(loginJson.success === true, "login reports success: true");
    assert(loginJson.data?.email === testEmail, "Correct citizen profile returned on login");

    // Extract session cookie from login response
    const setCookieHeader = loginRes.headers.get("set-cookie");
    assert(!!setCookieHeader, "Session cookie returned in Set-Cookie header");

    // 12. GET /api/auth/me (Authenticated Session verification from DB)
    console.log("\n[12] Testing GET /api/auth/me (Authenticated Session)...");
    const meAuthRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: setCookieHeader || "" },
    });
    const meAuthJson = await meAuthRes.json();
    assert(meAuthRes.status === 200, "GET /api/auth/me returns 200 OK with valid session");
    assert(meAuthJson.authenticated === true, "authenticated flag is true");
    assert(meAuthJson.citizen?.mobileNumber === testMobile, "Session correctly resolved to citizen from PostgreSQL");

    // 13. POST /api/auth/forgot-password (Dispatch Reset OTP)
    console.log("\n[13] Testing POST /api/auth/forgot-password (Dispatch Reset OTP)...");
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testEmail }),
    });
    const forgotJson = await forgotRes.json();
    assert(forgotRes.status === 200, "POST /api/auth/forgot-password returns 200 OK");
    assert(forgotJson.success === true, "forgot-password reports success: true");

    // 14. POST /api/auth/reset-password (Reset Password in PostgreSQL)
    console.log("\n[14] Testing POST /api/auth/reset-password (Update Password in DB)...");
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testMobile,
        otp: "123456",
        newPassword: newPassword,
        confirmNewPassword: newPassword,
      }),
    });
    const resetJson = await resetRes.json();
    assert(resetRes.status === 200, "POST /api/auth/reset-password returns 200 OK");
    assert(resetJson.success === true, "reset-password reports success: true");

    // 15. POST /api/auth/login (Verify Login with New Password)
    console.log("\n[15] Testing POST /api/auth/login (Verify New Password)...");
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testMobile,
        password: newPassword,
      }),
    });
    const newLoginJson = await newLoginRes.json();
    assert(newLoginRes.status === 200, "POST /api/auth/login succeeds with updated password");
    assert(newLoginJson.success === true, "Login with updated password succeeds");

    // 16. POST /api/auth/logout (Destroy Session in PostgreSQL)
    console.log("\n[16] Testing POST /api/auth/logout (Destroy Session)...");
    const newSetCookie = newLoginRes.headers.get("set-cookie");
    const logoutAuthRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: newSetCookie || "" },
    });
    const logoutAuthJson = await logoutAuthRes.json();
    assert(logoutAuthRes.status === 200, "POST /api/auth/logout returns 200 OK");
    assert(logoutAuthJson.success === true, "Session destroyed successfully");

    // Clean up test citizen record
    if (pool) {
      await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [testMobile, testEmail]);
      await pool.end();
      console.log("  ✓ Test citizen cleanup completed.");
    }

    console.log("\n=================================================");
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTests();
