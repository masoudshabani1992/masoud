import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db, initDb } from "./db";
import { genId } from "./utils";

const COOKIE_NAME = "koosha_admin_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "koosha-khodro-fallback-secret-change-me"
);

export async function ensureAdminUser() {
  initDb();
  const count = db.prepare("SELECT COUNT(*) as c FROM admin_users").get() as { c: number };
  if (count.c === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "koosha@1404";
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)").run(
      genId(),
      username,
      hash
    );
  }
}

export async function verifyCredentials(username: string, password: string) {
  await ensureAdminUser();
  const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username) as
    | { id: string; username: string; password_hash: string }
    | undefined;
  if (!user) return null;
  const ok = bcrypt.compareSync(password, user.password_hash);
  return ok ? { id: user.id, username: user.username } : null;
}

export async function createSession(username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireSession(): Promise<{ username: string } | null> {
  return getSession();
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { username: payload.username as string };
  } catch {
    return null;
  }
}
