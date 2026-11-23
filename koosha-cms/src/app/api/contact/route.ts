import { NextRequest, NextResponse } from "next/server";
import { createMessage } from "@/lib/models/messages";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data?.name || !data?.message) {
      return NextResponse.json({ ok: false, error: "نام و متن پیام الزامی است." }, { status: 400 });
    }
    createMessage({
      name: String(data.name).slice(0, 200),
      phone: String(data.phone || "").slice(0, 50),
      email: String(data.email || "").slice(0, 200),
      subject: String(data.subject || "").slice(0, 200),
      message: String(data.message).slice(0, 3000),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "خطا در ثبت پیام." }, { status: 500 });
  }
}
