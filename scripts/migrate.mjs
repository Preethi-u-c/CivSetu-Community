import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    const envLocalPath = path.join(__dirname, "..", ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (key === "DATABASE_URL") {
            databaseUrl = val;
            break;
          }
        }
      }
    }
  }

  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is not defined.");
    console.error("Please provide DATABASE_URL in .env.local or your environment.");
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, "init-db.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error(`ERROR: Migration script not found at ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf-8");
  const pool = new pg.Pool({ connectionString: databaseUrl });

  try {
    console.log("Connecting to PostgreSQL database...");
    const client = await pool.connect();
    console.log("Connected successfully. Running migration...");

    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    console.log("Migration executed successfully. Tables created / verified:");
    console.log(" - citizens");
    console.log(" - citizen_otps");
    console.log(" - citizen_sessions");
    console.log(" - complaints");
    console.log(" - complaint_timeline");

    client.release();
  } catch (err) {
    const sanitizedMsg = (err.message || "").replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");
    console.error("Migration failed:", sanitizedMsg);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
