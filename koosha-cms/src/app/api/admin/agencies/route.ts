import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listAgencies, createAgency } from "@/lib/models/agencies";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(listAgencies());
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const agency = createAgency(body);
  return NextResponse.json(agency);
}
