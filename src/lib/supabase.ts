// Klien Supabase via PostgREST (fetch) — tanpa dependensi tambahan.
// Env server (jangan expose ke browser):
//   SUPABASE_URL=https://luoixbircduzgyeyfxyi.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=<service_role, rahasia>
// Tanpa kedua env di atas → semua fungsi melempar, dan lib/db.ts fallback ke memory.

function baseUrl(): string {
  const u = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  if (!u) throw new Error("SUPABASE_URL belum diisi.");
  return `${u}/rest/v1`;
}

function headers(extra?: Record<string, string>): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi.");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export function supaConfigured(): boolean {
  return !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

async function handle<T>(res: Response, op: string): Promise<T> {
  if (res.status === 204) return [] as unknown as T;
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* bukan JSON */
  }
  if (!res.ok) {
    const msg = (json as { message?: string; hint?: string } | null)?.message ?? text ?? `HTTP ${res.status}`;
    throw new Error(`Supabase ${op} gagal: ${msg}`);
  }
  return json as T;
}

/** SELECT. Contoh: sbList("products", "select=*&order=created_at.desc&nama=ilike.*kebab*") */
export async function sbList<T>(table: string, query = "select=*"): Promise<T[]> {
  const res = await fetch(`${baseUrl()}/${table}?${query}`, { headers: headers(), cache: "no-store" });
  return handle<T[]>(res, `select ${table}`);
}

/** INSERT (mengembalikan rows). */
export async function sbInsert<T>(table: string, rows: unknown[]): Promise<T[]> {
  const res = await fetch(`${baseUrl()}/${table}`, {
    method: "POST",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(rows),
  });
  return handle<T[]>(res, `insert ${table}`);
}

/** UPDATE dengan filter query (mis. "id=eq.p1"). Mengembalikan rows. */
export async function sbUpdate<T>(table: string, match: string, patch: unknown): Promise<T[]> {
  const res = await fetch(`${baseUrl()}/${table}?${match}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(patch),
  });
  return handle<T[]>(res, `update ${table}`);
}

/** DELETE dengan filter query. */
export async function sbDelete(table: string, match: string): Promise<void> {
  const res = await fetch(`${baseUrl()}/${table}?${match}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) await handle(res, `delete ${table}`);
}
