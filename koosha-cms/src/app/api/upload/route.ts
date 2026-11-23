import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ALLOWED = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf"];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ ok: false, error: "فایلی انتخاب نشده است." }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  if (!ALLOWED.includes(ext)) {
    return NextResponse.json({ ok: false, error: "فرمت فایل مجاز نیست." }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, fileName), bytes);
  return NextResponse.json({ ok: true, url: `/uploads/${fileName}` });
}
