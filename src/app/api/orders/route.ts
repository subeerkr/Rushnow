import { NextResponse } from "next/server";
import { getOrders, createOrder, updateOrderRating } from "../../../lib/orders";

export async function GET() {
  const list = getOrders();
  return NextResponse.json({ orders: list });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = createOrder(body);
    return NextResponse.json({ order: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, rating, feedback } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const updated = updateOrderRating(id, rating, feedback);
    if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order: updated });
  } catch (err) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
