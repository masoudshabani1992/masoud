import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "نام کاربری و رمز عبور الزامی است." }, { status: 400 });
  }
  const user = await verifyCredentials(username, password);
  if (!user) {
    return NextResponse.json({ ok: false, error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
  }
  await createSession(user.username);
  return NextResponse.json({ ok: true });
}
