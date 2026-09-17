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

const pool = new pg.Pool({ connectionString: databaseUrl });

async function runFullAuthTests() {
  console.log("================================================================");
  console.log(" CIVSETU UI-TO-BACKEND AUTHENTICATION INTEGRATION TEST SUITE");
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

  const testMobile = "9876511111";
  const testEmail = "pooja.sharma@civsetu-tmc.gov.in";
  const initialPassword = "CivSetu@Pass2026";
  const updatedPassword = "CivSetu@NewPass2026";

  try {
    // 0. Clean any prior test records
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [testMobile, testEmail]);
    console.log("[Setup] Database clean state ensured for test citizen.");

    // 1. Verify UI Pages are accessible
    console.log("\n[1] Verifying UI Pages accessibility...");
    const pages = ["/register", "/login", "/forgot-password", "/track"];
    for (const page of pages) {
      const res = await fetch(`${BASE_URL}${page}`);
      assert(res.status === 200, `UI Page ${page} is accessible (HTTP 200)`);
    }

    // 2. Flow: Registration & Mock OTP Verification
    console.log("\n[2] Testing Registration & OTP Verification Flow...");
    
    // 2a. Request Registration OTP
    const sendOtpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: testMobile, purpose: "registration" }),
    });
    const sendOtpJson = await sendOtpRes.json();
    assert(sendOtpRes.status === 200, "POST /api/auth/send-otp returns 200 OK");
    assert(sendOtpJson.success === true, "Registration OTP dispatched successfully");

    // Check OTP record in PostgreSQL
    const otpDbRes = await pool.query(
      "SELECT * FROM citizen_otps WHERE identifier = $1 AND purpose = 'registration' ORDER BY id DESC LIMIT 1;",
      [testMobile]
    );
    assert(otpDbRes.rows.length > 0, "Registration OTP record persisted in PostgreSQL citizen_otps table");

    // 2b. Verify OTP (mock development code 123456)
    const verifyOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, otp: "123456", purpose: "registration" }),
    });
    const verifyOtpJson = await verifyOtpRes.json();
    assert(verifyOtpRes.status === 200, "POST /api/auth/verify-otp returns 200 OK");
    assert(verifyOtpJson.success === true, "Mock OTP verified successfully");

    // Check verification status in PostgreSQL
    const verifiedDbRes = await pool.query(
      "SELECT verified FROM citizen_otps WHERE id = $1;",
      [otpDbRes.rows[0].id]
    );
    assert(verifiedDbRes.rows[0].verified === true, "PostgreSQL citizen_otps record updated to verified = true");

    // 2c. Submit Registration Form
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Pooja Sharma",
        mobileNumber: testMobile,
        email: testEmail,
        password: initialPassword,
        confirmPassword: initialPassword,
        wardNumber: "Ward 02",
        residentialAddress: "Plot 14, Gandhi Circle, Lakshmeshwar",
        otp: "123456",
      }),
    });
    const regJson = await regRes.json();
    assert(regRes.status === 200, "POST /api/auth/register returns 200 OK");
    assert(regJson.success === true, "Citizen registration successful");
    assert(typeof regJson.data?.id === "string" && regJson.data.id.startsWith("CTZ-"), "Valid Citizen ID created: " + regJson.data?.id);

    // Verify Citizen in PostgreSQL
    const citizenDbRes = await pool.query("SELECT * FROM citizens WHERE mobile_number = $1;", [testMobile]);
    assert(citizenDbRes.rows.length === 1, "Citizen profile found in PostgreSQL citizens table");
    assert(citizenDbRes.rows[0].full_name === "Pooja Sharma", "Full name matches in PostgreSQL");
    assert(citizenDbRes.rows[0].email === testEmail, "Email matches in PostgreSQL");
    assert(citizenDbRes.rows[0].mobile_verified === true, "mobile_verified flag is true in PostgreSQL");

    // 3. Flow: Login Using Mobile Number
    console.log("\n[3] Testing Login using Mobile Number...");
    const loginMobileRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testMobile,
        password: initialPassword,
      }),
    });
    const loginMobileJson = await loginMobileRes.json();
    assert(loginMobileRes.status === 200, "POST /api/auth/login with mobile returns 200 OK");
    assert(loginMobileJson.success === true, "Login reports success: true");
    assert(loginMobileJson.data?.fullName === "Pooja Sharma", "Correct citizen profile returned on login");

    const sessionCookieHeader = loginMobileRes.headers.get("set-cookie");
    assert(!!sessionCookieHeader, "HTTP-only session cookie returned in Set-Cookie header");
    assert(sessionCookieHeader.includes("civsetu_citizen_token="), "Session cookie name is civsetu_citizen_token");

    // 4. Flow: Authenticated Session Detection & Persistence (/api/auth/me)
    console.log("\n[4] Testing Authenticated Session Persistence (/api/auth/me)...");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookieHeader },
    });
    const meJson = await meRes.json();
    assert(meRes.status === 200, "GET /api/auth/me returns 200 OK for active session");
    assert(meJson.authenticated === true, "authenticated flag is true");
    assert(meJson.citizen?.fullName === "Pooja Sharma", "Citizen full name correctly resolved from PostgreSQL session");
    assert(meJson.citizen?.mobileNumber === testMobile, "Citizen mobile correctly resolved from session");
    assert(meJson.citizen?.email === testEmail, "Citizen email correctly resolved from session");

    // 5. Flow: Logout
    console.log("\n[5] Testing Logout...");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookieHeader },
    });
    const logoutJson = await logoutRes.json();
    assert(logoutRes.status === 200, "POST /api/auth/logout returns 200 OK");
    assert(logoutJson.success === true, "Logout reports success: true");

    // Verify session invalidation in /api/auth/me
    const meAfterLogoutRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookieHeader },
    });
    const meAfterLogoutJson = await meAfterLogoutRes.json();
    assert(meAfterLogoutRes.status === 401, "GET /api/auth/me returns 401 Unauthorized after logout");
    assert(meAfterLogoutJson.authenticated === false, "authenticated flag is false after logout");

    // 6. Flow: Login Using Email Address
    console.log("\n[6] Testing Login using Email Address...");
    const loginEmailRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testEmail,
        password: initialPassword,
      }),
    });
    const loginEmailJson = await loginEmailRes.json();
    assert(loginEmailRes.status === 200, "POST /api/auth/login with email returns 200 OK");
    assert(loginEmailJson.success === true, "Login with email reports success: true");
    assert(loginEmailJson.data?.email === testEmail, "Correct citizen profile returned on email login");

    const emailCookieHeader = loginEmailRes.headers.get("set-cookie");
    // Logout after email test
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: emailCookieHeader },
    });

    // 7. Flow: Invalid Credentials Handling
    console.log("\n[7] Testing Invalid Credentials Handling...");
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testMobile,
        password: "IncorrectPassword999!",
      }),
    });
    const badLoginJson = await badLoginRes.json();
    assert(badLoginRes.status === 401, "POST /api/auth/login with bad password returns 401");
    assert(badLoginJson.success === false, "success is false for invalid credentials");
    assert(badLoginJson.error === "Invalid credentials. Please verify and try again.", "Safe user-friendly error message returned");

    // 8. Flow: Forgot Password & Password Reset
    console.log("\n[8] Testing Forgot Password & Password Reset Flow...");
    
    // 8a. Request Reset OTP
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile }),
    });
    const forgotJson = await forgotRes.json();
    assert(forgotRes.status === 200, "POST /api/auth/forgot-password returns 200 OK");
    assert(forgotJson.success === true, "Password reset OTP dispatched");

    // 8b. Verify Reset OTP
    const verifyResetOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, otp: "123456", purpose: "password_reset" }),
    });
    const verifyResetOtpJson = await verifyResetOtpRes.json();
    assert(verifyResetOtpRes.status === 200, "POST /api/auth/verify-otp for password_reset returns 200 OK");
    assert(verifyResetOtpJson.success === true, "Password reset OTP verified");

    // 8c. Reset Password
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testMobile,
        otp: "123456",
        newPassword: updatedPassword,
        confirmNewPassword: updatedPassword,
      }),
    });
    const resetJson = await resetRes.json();
    assert(resetRes.status === 200, "POST /api/auth/reset-password returns 200 OK");
    assert(resetJson.success === true, "Password updated successfully in PostgreSQL");

    // 9. Flow: Login Verification with New Password
    console.log("\n[9] Testing Login with New Password...");
    
    // Old password should fail
    const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, password: initialPassword }),
    });
    assert(oldLoginRes.status === 401, "Old password is now rejected (HTTP 401)");

    // New password should succeed
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, password: updatedPassword }),
    });
    const newLoginJson = await newLoginRes.json();
    assert(newLoginRes.status === 200, "New password is accepted (HTTP 200 OK)");
    assert(newLoginJson.success === true, "Login with new password succeeded");

    // Logout
    const finalCookie = newLoginRes.headers.get("set-cookie");
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: finalCookie },
    });

    // 10. Cleanup: Remove test citizen from PostgreSQL
    console.log("\n[10] Cleaning up test citizen from PostgreSQL...");
    const delRes = await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [testMobile, testEmail]);
    assert(delRes.rowCount > 0, "Test citizen records successfully deleted from PostgreSQL");

    // Final Summary
    console.log("\n================================================================");
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runFullAuthTests();
