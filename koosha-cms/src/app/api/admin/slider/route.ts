import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listSlides, createSlide } from "@/lib/models/slider";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(listSlides());
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const slide = createSlide(body);
  return NextResponse.json(slide);
}
