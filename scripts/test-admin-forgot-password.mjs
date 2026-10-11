import pg from "pg";
import fs from "fs";
import bcrypt from "bcryptjs";

const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("==================================================================");
  console.log(" Test Suite: Admin Forgot Password Flow & Verification");
  console.log("==================================================================\n");

  const envContent = fs.readFileSync(".env.local", "utf8");
  const match = envContent.match(/DATABASE_URL=(.+)/);
  const pool = new pg.Pool({ connectionString: match[1].trim() });

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
    // 1. Forgot password request for invalid user
    const resInvalid = await fetch(`${BASE_URL}/api/admin/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "nonexistent_admin@tmc.gov.in" }),
    });
    assert(resInvalid.status === 404, "Unknown admin identifier returns HTTP 404");

    // 2. Forgot password request for civsetu73@gmail.com
    const resValid = await fetch(`${BASE_URL}/api/admin/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "civsetu73@gmail.com" }),
    });
    assert(resValid.status === 200, "Valid admin identifier returns HTTP 200");
    const jsonValid = await resValid.json();
    assert(jsonValid.success === true, "Response reports success: true");
    assert(jsonValid.email.includes("****"), "Email is safely masked in response");

    // 3. Retrieve dispatched OTP hash from database
    const otpRow = await pool.query(
      "SELECT * FROM citizen_otps WHERE identifier = 'civsetu73@gmail.com' AND purpose = 'password_reset' ORDER BY id DESC LIMIT 1;"
    );
    assert(otpRow.rows.length === 1, "OTP record persisted in database");

    // 4. Test verify-otp with incorrect code
    const resBadOtp = await fetch(`${BASE_URL}/api/admin/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "civsetu73@gmail.com", otp: "000000" }),
    });
    assert(resBadOtp.status === 400, "Incorrect OTP code returns HTTP 400");

    // 5. Simulate valid OTP verification by setting verified = true for test or calculating HMAC
    // Let's mark the OTP row verified in DB to simulate successful OTP verification
    await pool.query("UPDATE citizen_otps SET verified = true WHERE id = $1;", [otpRow.rows[0].id]);

    // 6. Test reset-password with weak / series number password
    const resWeakPass = await fetch(`${BASE_URL}/api/admin/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "civsetu73@gmail.com",
        newPassword: "Admin@1234", // Contains series numbers 1234
        confirmNewPassword: "Admin@1234",
      }),
    });
    assert(resWeakPass.status === 400, "Reset password rejects series numbers (1234) with HTTP 400");

    // 7. Test reset-password with strong password
    const testStrongPass = "CivSetu@Secure2026!";
    const resResetSuccess = await fetch(`${BASE_URL}/api/admin/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "civsetu73@gmail.com",
        newPassword: testStrongPass,
        confirmNewPassword: testStrongPass,
      }),
    });
    assert(resResetSuccess.status === 200, "Reset password succeeds with strong password (HTTP 200)");

    // 8. Verify new password in database
    const updatedAdmin = await pool.query("SELECT password_hash FROM admin_users WHERE email = 'civsetu73@gmail.com';");
    const isNewPassMatch = await bcrypt.compare(testStrongPass, updatedAdmin.rows[0].password_hash);
    assert(isNewPassMatch === true, "Database updated with new password hash");

    // 9. Reset admin password back to user's desired Admin@123
    const admin123Hash = await bcrypt.hash("Admin@123", 10);
    await pool.query(
      "UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = 'civsetu73@gmail.com';",
      [admin123Hash]
    );
    console.log("  ✓ Reset admin credentials back to user's Admin@123");

    console.log(`\n==================================================================`);
    console.log(` Total Passed: ${passed} | Failed: ${failed}`);
    console.log(`==================================================================`);
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
