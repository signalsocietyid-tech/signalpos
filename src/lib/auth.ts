// Helper auth sisi server (dipakai Route Handlers).
// DEMO ONLY — password plaintext khusus akun demo. Produksi: hash (bcrypt/scrypt) + session lib (Auth.js).

export type Role = "admin" | "cabang" | "kasir";

export type DemoUser = {
  username: string;
  password: string; // DEMO ONLY
  nama: string;
  role: Role;
  cabangId: string | null; // null = semua cabang
};

export const DEMO_USERS: DemoUser[] = [
  { username: "admin", password: "admin123", nama: "Administrator", role: "admin", cabangId: null },
  { username: "braga", password: "cabang123", nama: "Manajer Braga", role: "cabang", cabangId: "c2" },
  { username: "kasir", password: "kasir123", nama: "Kasir Dago", role: "kasir", cabangId: "c1" },
];

export function findUser(username: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.username === username.toLowerCase().trim());
}

/** Token demo: base64url(payload). BUKAN JWT terverifikasi — jangan pakai di produksi. */
export function signToken(payload: { username: string; role: Role; cabangId: string | null }): string {
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString("base64url");
  const sig = Buffer.from(process.env.NEXTAUTH_SECRET ?? "dev-secret").toString("base64url").slice(0, 12);
  return `${body}.${sig}`;
}

export function roleRedirect(role: Role, cabangId: string | null): string {
  if (role === "kasir") return "/pos";
  if (role === "cabang") return cabangId ? `/admin?cabang=${cabangId}` : "/admin";
  return "/admin";
}

export function canAccessAdmin(role: Role): boolean {
  return role === "admin" || role === "cabang";
}

export function canAccessPos(role: Role): boolean {
  return role === "admin" || role === "cabang" || role === "kasir";
}
