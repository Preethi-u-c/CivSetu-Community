import pg from "pg";
import fs from "fs";
import bcrypt from "bcryptjs";
import { validateStrongPassword, hasSequentialNumberSeries } from "../src/lib/security/validator.ts";

async function run() {
  console.log("==================================================================");
  console.log(" Verification: Admin Account & Strong Password Policy");
  console.log("==================================================================\n");

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

  // --- Test 1: Sequential Series Number Detection ---
  console.log("[1] Testing Sequential Series Number Detection...");
  assert(hasSequentialNumberSeries("123") === true, "Detects '123'");
  assert(hasSequentialNumberSeries("1234") === true, "Detects '1234'");
  assert(hasSequentialNumberSeries("Admin@123") === true, "Detects '123' in 'Admin@123'");
  assert(hasSequentialNumberSeries("Pass@234") === true, "Detects '234'");
  assert(hasSequentialNumberSeries("Test@321") === true, "Detects descending '321'");
  assert(hasSequentialNumberSeries("Code@4321") === true, "Detects descending '4321'");
  assert(hasSequentialNumberSeries("Code@987") === true, "Detects descending '987'");
  assert(hasSequentialNumberSeries("Code@111") === true, "Detects repeated digits '111'");
  assert(hasSequentialNumberSeries("StrongPass@2026") === false, "Passes non-sequential digits '2026'");
  assert(hasSequentialNumberSeries("Safe@8492") === false, "Passes non-sequential digits '8492'");

  // --- Test 2: Strong Password Validator ---
  console.log("\n[2] Testing Strong Password Validator...");
  const weak1 = validateStrongPassword("abc");
  assert(weak1.isValid === false, "Rejects short password");

  const weak2 = validateStrongPassword("Admin@123");
  assert(weak2.isValid === false, "Rejects password with sequential numbers (Admin@123)");
  assert(weak2.rules.noSeriesNumber === false, "Rule noSeriesNumber is false for Admin@123");

  const weak3 = validateStrongPassword("Password@1234");
  assert(weak3.isValid === false, "Rejects password with sequential numbers (1234)");

  const weak4 = validateStrongPassword("Alllowercase1!");
  assert(weak4.rules.hasUppercase === true, "Detects uppercase A");

  const weak5 = validateStrongPassword("NO_LOWER_12#");
  assert(weak5.rules.hasLowercase === false, "Detects missing lowercase");

  const strong1 = validateStrongPassword("StrongPass@2026!");
  assert(strong1.isValid === true, "Accepts 'StrongPass@2026!' with 6/6 rules");
  assert(strong1.score === 6, "Score is 6/6");

  // --- Test 3: Database Admin Account Verification ---
  console.log("\n[3] Testing Database Administrator Record...");
  const envContent = fs.readFileSync(".env.local", "utf8");
  const match = envContent.match(/DATABASE_URL=(.+)/);
  const pool = new pg.Pool({ connectionString: match[1].trim() });

  const adminRows = await pool.query("SELECT id, username, email, password_hash, role, is_active FROM admin_users;");
  assert(adminRows.rows.length === 1, "Exactly ONE admin account exists in database");

  const admin = adminRows.rows[0];
  assert(admin.email === "civsetu73@gmail.com", "Admin email is civsetu73@gmail.com");
  assert(admin.role === "SYSTEM_ADMIN", "Admin role is SYSTEM_ADMIN");
  assert(admin.is_active === true, "Admin account is active");

  const isPasswordMatch = await bcrypt.compare("Admin@123", admin.password_hash);
  assert(isPasswordMatch === true, "Password matches Admin@123");

  // Check no previous admins remain
  const oldAdmins = await pool.query("SELECT * FROM admin_users WHERE email != 'civsetu73@gmail.com';");
  assert(oldAdmins.rows.length === 0, "All previous admin accounts are removed");

  // Check system settings
  const sysSettings = await pool.query("SELECT key, value FROM system_settings WHERE key IN ('require_strong_passwords', 'disallow_number_series_passwords');");
  assert(sysSettings.rows.length === 2, "Security settings exist in system_settings table");

  await pool.end();

  console.log(`\n==================================================================`);
  console.log(` Total Passed: ${passed} | Failed: ${failed}`);
  console.log(`==================================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
