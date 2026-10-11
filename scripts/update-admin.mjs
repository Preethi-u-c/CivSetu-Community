import fs from "fs";
import pg from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (!match) throw new Error("DATABASE_URL not found");
  
  const pool = new pg.Pool({ connectionString: match[1].trim() });

  console.log("Admins before update:");
  const before = await pool.query("SELECT id, username, email FROM admin_users");
  console.log(before.rows);

  const hash = await bcrypt.hash("Admin@123", 10);

  // Delete previous sessions
  await pool.query("DELETE FROM admin_sessions WHERE admin_id IN (SELECT id FROM admin_users WHERE email != $1)", ["civsetu73@gmail.com"]);

  // Delete previous admins
  const delRes = await pool.query("DELETE FROM admin_users WHERE email != $1", ["civsetu73@gmail.com"]);
  console.log("Deleted previous admins count:", delRes.rowCount);

  // Insert or update civsetu73@gmail.com
  const upsertSql = `
    INSERT INTO admin_users (id, username, full_name, email, password_hash, role, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (email) DO UPDATE SET 
      username = EXCLUDED.username,
      password_hash = EXCLUDED.password_hash,
      full_name = EXCLUDED.full_name,
      is_active = true,
      updated_at = CURRENT_TIMESTAMP;
  `;

  await pool.query(upsertSql, [
    "ADM-LMC-001",
    "civsetu73",
    "System Administrator, Lakshmeshwar TMC",
    "civsetu73@gmail.com",
    hash,
    "SYSTEM_ADMIN",
  ]);

  console.log("Admins after update:");
  const after = await pool.query("SELECT id, username, email, role, is_active FROM admin_users");
  console.log(after.rows);

  const isMatch = await bcrypt.compare("Admin@123", hash);
  console.log("Verified Admin@123 match:", isMatch);

  // Seed security settings
  await pool.query(`
    INSERT INTO system_settings (key, value, description, category, updated_at)
    VALUES 
      ('require_strong_passwords', 'true', 'Enforce strict strong password complexity rules for citizens and administrators', 'security', CURRENT_TIMESTAMP),
      ('disallow_number_series_passwords', 'true', 'Reject consecutive number series like 123, 1234, or 321 in passwords', 'security', CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
  `);
  console.log("Seeded password security settings into system_settings table.");

  await pool.end();
}

main().catch(err => {
  console.error("Error updating admin:", err);
  process.exit(1);
});
