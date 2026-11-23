import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listNews, createNews } from "@/lib/models/news";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(listNews());
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const item = createNews(body);
  return NextResponse.json(item);
}
