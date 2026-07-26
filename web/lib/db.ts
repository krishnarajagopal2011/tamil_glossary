import "server-only";
import postgres from "postgres";

declare global {
  var __glossarySql: ReturnType<typeof postgres> | undefined;
}

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  return postgres(url, {
    // Serverless functions get one short-lived connection each; a long-running
    // local dev server can afford a small pool.
    max: process.env.NODE_ENV === "production" ? 1 : 5,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false, // pgbouncer-compatible (Neon/Supabase poolers)
  });
}

export const sql = globalThis.__glossarySql ?? connect();

if (process.env.NODE_ENV !== "production") globalThis.__glossarySql = sql;
