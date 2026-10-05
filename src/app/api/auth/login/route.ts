import { NextResponse } from "next/server";
import { findUser, roleRedirect, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON tidak valid." }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";
  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Username dan password wajib diisi." }, { status: 400 });
  }

  const user = findUser(username);
  // DEMO ONLY — perbandingan plaintext. Produksi: bcrypt.compare + rate limit.
  if (!user || user.password !== password) {
    return NextResponse.json({ ok: false, error: "Username atau password salah." }, { status: 401 });
  }

  const token = signToken({ username: user.username, role: user.role, cabangId: user.cabangId });
  return NextResponse.json({
    ok: true,
    data: {
      token,
      user: { nama: user.nama, username: user.username, role: user.role, cabangId: user.cabangId },
      redirect: roleRedirect(user.role, user.cabangId),
    },
  });
}
