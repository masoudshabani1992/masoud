import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listProducts, createProduct } from "@/lib/models/products";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(listProducts());
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const product = createProduct(body);
  return NextResponse.json(product);
}
