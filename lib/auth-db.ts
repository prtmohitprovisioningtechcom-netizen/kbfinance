import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const DEFAULT_ADMIN_EMAIL = "financeserviceskb@gmail.com";
export const DEFAULT_ADMIN_PASSWORD = "financekb@321";

export function envAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
  };
}

export function isEnvAdmin(email: string, password: string) {
  const admin = envAdminCredentials();
  return email.trim().toLowerCase() === admin.email && password === admin.password;
}

export async function ensureAuthTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  try {
    await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'USER'");
  } catch {
    // column already exists
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error("customers table setup skipped:", error);
  }
}

export async function ensureDefaultAdmin() {
  await ensureAuthTables();

  const [admins] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM users WHERE UPPER(role) = 'ADMIN' LIMIT 1"
  );

  if (admins.length > 0) return;

  const [existing] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [DEFAULT_ADMIN_EMAIL]
  );

  if (existing.length > 0) {
    await pool.execute("UPDATE users SET role = 'ADMIN' WHERE email = ?", [
      DEFAULT_ADMIN_EMAIL,
    ]);
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await pool.execute(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["KB Admin", DEFAULT_ADMIN_EMAIL, hashedPassword, "ADMIN"]
  );
}

export function dbErrorMessage(error: unknown) {
  const err = error as { code?: string; message?: string };
  if (err?.message === "DB timeout") {
    return "Database timed out. Vercel cannot reach your MySQL host. Allow remote MySQL (%) and use a public DB_HOST, not localhost.";
  }
  if (err?.code === "ECONNREFUSED" || err?.code === "ENOTFOUND" || err?.code === "ETIMEDOUT") {
    return "Database connection failed. DB_HOST must be a public MySQL host (not localhost), and remote access must be allowed.";
  }
  if (err?.code === "ER_ACCESS_DENIED_ERROR") {
    return err.message || "Database login failed. Vercel is reaching MySQL, but this user is not allowed from Vercel IPs. Create a remote MySQL user with host % — local root@localhost will not work.";
  }
  if (err?.code === "ER_BAD_DB_ERROR") {
    return "Database name not found. Check DB_NAME on Vercel.";
  }
  if (err?.code === "ER_NO_SUCH_TABLE") {
    return "Database table does not exist. Please visit /api/setup-db.";
  }
  return err?.message || "Internal server error";
}
