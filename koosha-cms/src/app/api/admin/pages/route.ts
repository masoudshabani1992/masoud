import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listPages, createPage } from "@/lib/models/pages";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(listPages());
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const page = createPage(body);
  return NextResponse.json(page);
}
