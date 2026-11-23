import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSlideById, updateSlide, deleteSlide } from "@/lib/models/slider";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const slide = getSlideById(params.id);
  if (!slide) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(slide);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const updated = updateSlide(params.id, body);
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  deleteSlide(params.id);
  return NextResponse.json({ ok: true });
}
