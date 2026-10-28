import dns from "node:dns";
import mysql from "mysql2/promise";

dns.setDefaultResultOrder("ipv4first");

function env(name: string, fallback = "") {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return String(raw).trim().replace(/^['"]+|['"]+$/g, "");
}

const host = env("DB_HOST", "localhost");
const useSsl = env("DB_SSL") === "true";

if (process.env.NODE_ENV === "production" && (!process.env.DB_USER || !process.env.DB_PASSWORD)) {
  console.warn("⚠️ [DB Configuration] DB_USER or DB_PASSWORD is not set in production! Hostinger will reject connection as root with no password. Please configure .env on the server.");
}

const pool = mysql.createPool({
  host,
  port: Number(env("DB_PORT", "3306")) || 3306,
  user: env("DB_USER", "root"),
  password: env("DB_PASSWORD", ""),
  database: env("DB_NAME", "kb_finance"),
  waitForConnections: true,
  connectionLimit: 1,
  maxIdle: 1,
  idleTimeout: 10000,
  queueLimit: 10,
  connectTimeout: 8000,
  enableKeepAlive: true,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

export async function pingDatabase() {
  const [rows] = await withTimeout(pool.query("SELECT 1 AS ok"), 8000);
  return (rows as any[])[0]?.ok === 1;
}

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("DB timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function ensureContactTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(255),
      city VARCHAR(100),
      service_required VARCHAR(255),
      message TEXT,
      status ENUM('NEW', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'NEW',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export { withTimeout };

export default pool;
