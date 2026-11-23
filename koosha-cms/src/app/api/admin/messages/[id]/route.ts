import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { markRead, deleteMessage } from "@/lib/models/messages";

export async function PUT(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  markRead(params.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  deleteMessage(params.id);
  return NextResponse.json({ ok: true });
}
