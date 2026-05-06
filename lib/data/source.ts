export type DataSource = "mock" | "supabase";

function normalizeDataSource(value: string | undefined | null): DataSource | null {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "mock") return "mock";
  if (v === "supabase") return "supabase";
  return null;
}

/**
 * Single switch for the whole app.
 * - Server: prefers `DATA_SOURCE`
 * - Client: uses `NEXT_PUBLIC_DATA_SOURCE`
 * Defaults to `mock` unless explicitly set to `supabase`.
 */
export function getDataSource(): DataSource {
  const serverPref = normalizeDataSource(process.env.DATA_SOURCE);
  const clientPref = normalizeDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE);
  return serverPref ?? clientPref ?? "mock";
}

export function isMockData(): boolean {
  return getDataSource() === "mock";
}

