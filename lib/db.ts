import { neon } from "@neondatabase/serverless";

function getNeon() {
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL or POSTGRES_URL environment variable is required"
    );
  }
  return neon(connectionString);
}

/**
 * Tagged template SQL helper that returns { rows, rowCount } so existing
 * SmartClinic code keeps working. Uses Neon serverless driver – works with
 * Neon and Vercel (vercel env pull). Use DATABASE_URL or POSTGRES_URL.
 */
export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<{ rows: unknown[]; rowCount: number }> {
  const neonSql = getNeon();
  const rows = await neonSql(strings, ...values);
  const arr = Array.isArray(rows) ? rows : [];
  return { rows: arr, rowCount: arr.length };
}
