import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const envLocalPath = path.join(projectRoot, ".env.local");

function loadEnvLocal() {
  if (!fs.existsSync(envLocalPath)) {
    console.error("ERROR: .env.local was not found at:", envLocalPath);
    process.exit(1);
  }

  const content = fs.readFileSync(envLocalPath, "utf-8");
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

async function verifyConnection() {
  const env = loadEnvLocal();
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set in .env.local.");
    process.exit(1);
  }

  if (databaseUrl.includes("<MY_POSTGRES_PASSWORD>")) {
    console.log("STATUS: PENDING_PASSWORD");
    console.log("The .env.local file currently contains the placeholder '<MY_POSTGRES_PASSWORD>'.");
    console.log("Please replace <MY_POSTGRES_PASSWORD> in .env.local with your local PostgreSQL password.");
    return;
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });

  try {
    const client = await pool.connect();
    const res = await client.query("SELECT current_database() AS db, current_user AS usr, version() AS ver;");
    const info = res.rows[0];
    console.log("STATUS: SUCCESS");
    console.log(`Connected to database: ${info.db}`);
    console.log(`User: ${info.usr}`);
    
    const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    console.log("Tables in database:", tablesRes.rows.map(r => r.table_name));
    
    console.log("PostgreSQL connection verified successfully!");
    client.release();
  } catch (err) {
    console.error("STATUS: CONNECTION_FAILED");
    // Sanitize any accidental password leaks in error messages
    const sanitizedMsg = (err.message || "").replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");
    console.error("Error connecting to PostgreSQL:", sanitizedMsg);
    if (err.code) {
      console.error(`Error Code: ${err.code}`);
    }
  } finally {
    await pool.end();
  }
}

verifyConnection();
