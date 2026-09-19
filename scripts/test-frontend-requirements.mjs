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

async function verifyAllRequirements() {
  console.log("================================================================");
  console.log(" CIVSETU CITIZEN AUTH FRONTEND INTEGRATION CHECKLIST (A TO J)");
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

  const testMobile = "9876540001";
  const testEmail = "anita.desai@tmc.civsetu.org";
  const password = "Password@CivSetu2026";
  const newPassword = "Password@ResetCivSetu2026";

  try {
    // 0. Clean prior records
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [testMobile, testEmail]);

    // =========================================================================
    // J. Registration/login/forgot-password pages return HTTP 200
    // =========================================================================
    console.log("\n[J] Testing route HTTP 200 status codes...");
    const pages = ["/register", "/login", "/forgot-password", "/dashboard"];
    for (const page of pages) {
      const res = await fetch(`${BASE_URL}${page}`);
      assert(res.status === 200, `Page ${page} returns HTTP 200`);
    }

    // =========================================================================
    // A. Successful registration
    // =========================================================================
    console.log("\n[A] Testing Successful Registration...");
    // 1. Send OTP
    const sendOtpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: testMobile, purpose: "registration" }),
    });
    const sendOtpJson = await sendOtpRes.json();
    assert(sendOtpRes.status === 200 && sendOtpJson.success === true, "Send OTP returns HTTP 200 and success");

    // 2. Verify OTP (mock dev code 123456)
    const verifyOtpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, otp: "123456", purpose: "registration" }),
    });
    const verifyOtpJson = await verifyOtpRes.json();
    assert(verifyOtpRes.status === 200 && verifyOtpJson.success === true, "Verify OTP returns HTTP 200 and success");

    // 3. Register citizen
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Anita Desai",
        mobileNumber: testMobile,
        email: testEmail,
        password: password,
        confirmPassword: password,
        wardNumber: "Ward 04",
        residentialAddress: "12 Main Road, Lakshmeshwar - 582116",
        otp: "123456",
      }),
    });
    const regJson = await regRes.json();
    assert(regRes.status === 200 && regJson.success === true, "Registration returns HTTP 200 and success");
    assert(regJson.data?.fullName === "Anita Desai", "Registered citizen full name matches: " + regJson.data?.fullName);

    // =========================================================================
    // B. Duplicate registration rejection
    // =========================================================================
    console.log("\n[B] Testing Duplicate Registration Rejection...");
    // Duplicate Mobile OTP rejection
    const dupMobileOtpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber: testMobile, purpose: "registration" }),
    });
    const dupMobileOtpJson = await dupMobileOtpRes.json();
    assert(dupMobileOtpRes.status === 409, "POST /api/auth/send-otp returns 409 for already registered mobile");
    assert(dupMobileOtpJson.success === false, "Duplicate mobile send-otp success is false");

    // Duplicate Registration POST rejection
    const dupRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Anita Desai Duplicate",
        mobileNumber: testMobile,
        email: "different.email@tmc.civsetu.org",
        password: password,
        confirmPassword: password,
        wardNumber: "Ward 04",
        residentialAddress: "12 Main Road, Lakshmeshwar",
        otp: "123456",
      }),
    });
    const dupRegJson = await dupRegRes.json();
    assert(dupRegRes.status === 409, "POST /api/auth/register returns 409 Conflict for duplicate mobile");
    assert(dupRegJson.error?.includes("already registered"), "Helpful duplicate mobile message: " + dupRegJson.error);

    // Duplicate Email rejection
    const dupEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Another Person",
        mobileNumber: "9876540002",
        email: testEmail,
        password: password,
        confirmPassword: password,
        wardNumber: "Ward 04",
        residentialAddress: "15 Main Road, Lakshmeshwar",
        otp: "123456",
      }),
    });
    const dupEmailJson = await dupEmailRes.json();
    assert(dupEmailRes.status === 409, "POST /api/auth/register returns 409 Conflict for duplicate email");
    assert(dupEmailJson.error?.includes("already registered"), "Helpful duplicate email message: " + dupEmailJson.error);

    // =========================================================================
    // C. Successful mobile login
    // =========================================================================
    console.log("\n[C] Testing Successful Mobile Login...");
    const mobileLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, password: password }),
    });
    const mobileLoginJson = await mobileLoginRes.json();
    assert(mobileLoginRes.status === 200, "Mobile login returns 200 OK");
    assert(mobileLoginJson.success === true, "Mobile login success is true");
    assert(mobileLoginJson.data?.fullName === "Anita Desai", "Mobile login returns authenticated citizen data");

    const sessionCookie = mobileLoginRes.headers.get("set-cookie");
    assert(!!sessionCookie && sessionCookie.includes("civsetu_citizen_token="), "Mobile login returns civsetu_citizen_token cookie");

    // =========================================================================
    // F. /api/auth/me after login
    // =========================================================================
    console.log("\n[F] Testing /api/auth/me after login...");
    const meAfterLoginRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meAfterLoginJson = await meAfterLoginRes.json();
    assert(meAfterLoginRes.status === 200, "GET /api/auth/me returns 200 OK with session");
    assert(meAfterLoginJson.authenticated === true, "authenticated is true");
    assert(meAfterLoginJson.citizen?.mobileNumber === testMobile, "Resolved citizen mobile matches");
    assert(meAfterLoginJson.citizen?.email === testEmail, "Resolved citizen email matches");

    // =========================================================================
    // G. Logout
    // =========================================================================
    console.log("\n[G] Testing Logout...");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    const logoutJson = await logoutRes.json();
    assert(logoutRes.status === 200, "POST /api/auth/logout returns 200 OK");
    assert(logoutJson.success === true, "Logout reports success: true");

    // =========================================================================
    // H. /api/auth/me after logout
    // =========================================================================
    console.log("\n[H] Testing /api/auth/me after logout...");
    const meAfterLogoutRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meAfterLogoutJson = await meAfterLogoutRes.json();
    assert(meAfterLogoutRes.status === 401, "GET /api/auth/me returns 401 after logout");
    assert(meAfterLogoutJson.authenticated === false, "authenticated is false after logout");

    // =========================================================================
    // D. Successful email login
    // =========================================================================
    console.log("\n[D] Testing Successful Email Login...");
    const emailLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testEmail, password: password }),
    });
    const emailLoginJson = await emailLoginRes.json();
    assert(emailLoginRes.status === 200, "Email login returns 200 OK");
    assert(emailLoginJson.success === true, "Email login success is true");
    assert(emailLoginJson.data?.email === testEmail, "Correct email returned");

    const emailSessionCookie = emailLoginRes.headers.get("set-cookie");

    // Clean logout
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: emailSessionCookie },
    });

    // =========================================================================
    // E. Invalid password
    // =========================================================================
    console.log("\n[E] Testing Invalid Password...");
    const badPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, password: "WrongPassword999!" }),
    });
    const badPassJson = await badPassRes.json();
    assert(badPassRes.status === 401, "Invalid password returns 401 Unauthorized");
    assert(badPassJson.success === false, "success is false for invalid password");
    assert(badPassJson.error === "Invalid credentials. Please verify and try again.", "Uniform safe error message returned");

    // =========================================================================
    // I. Forgot password flow
    // =========================================================================
    console.log("\n[I] Testing Forgot Password Flow...");
    // 1. Request reset OTP using email identifier
    const forgotEmailRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testEmail }),
    });
    const forgotEmailJson = await forgotEmailRes.json();
    assert(forgotEmailRes.status === 200 && forgotEmailJson.success === true, "Password reset OTP request by email returns 200 OK");
    assert(forgotEmailJson.mobileMasked?.includes("0001"), "Returns masked mobile number: " + forgotEmailJson.mobileMasked);

    // 2. Verify OTP with email identifier
    const verifyResetRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testEmail, otp: "123456", purpose: "password_reset" }),
    });
    const verifyResetJson = await verifyResetRes.json();
    assert(verifyResetRes.status === 200 && verifyResetJson.success === true, "Verify OTP for reset returns 200 OK");

    // 3. Reset password
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: testEmail,
        otp: "123456",
        newPassword: newPassword,
        confirmNewPassword: newPassword,
      }),
    });
    const resetJson = await resetRes.json();
    assert(resetRes.status === 200 && resetJson.success === true, "Reset password returns 200 OK");

    // 4. Verify old password no longer works
    const oldLoginCheck = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, password: password }),
    });
    assert(oldLoginCheck.status === 401, "Old password rejected after reset (HTTP 401)");

    // 5. Verify new password succeeds
    const newLoginCheck = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: testMobile, password: newPassword }),
    });
    const newLoginJson = await newLoginCheck.json();
    assert(newLoginCheck.status === 200 && newLoginJson.success === true, "New password login succeeds (HTTP 200)");

    // Logout
    const newCookie = newLoginCheck.headers.get("set-cookie");
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: newCookie },
    });

    // Cleanup
    await pool.query("DELETE FROM citizens WHERE mobile_number = $1 OR email = $2;", [testMobile, testEmail]);
    console.log("\n[Cleanup] Test citizen data cleaned up.");

    console.log("\n================================================================");
    console.log(` CHECKLIST RESULTS: ${passed} PASSED, ${failed} FAILED`);
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

verifyAllRequirements();
