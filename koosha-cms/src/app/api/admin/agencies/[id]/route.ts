import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAgencyById, updateAgency, deleteAgency } from "@/lib/models/agencies";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const agency = getAgencyById(params.id);
  if (!agency) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(agency);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const updated = updateAgency(params.id, body);
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  deleteAgency(params.id);
  return NextResponse.json({ ok: true });
}
