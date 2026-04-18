import { NextResponse } from "next/server";
import { getDb } from "../../../lib/dbConnect";
import { authOptions } from "../../../lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please login to purchase." }, { status: 401 });
    }


    // Admin cannot buy anything
    if ((session.user as any).role === "admin") {
      return NextResponse.json({ error: "Admins are not allowed to make purchases." }, { status: 403 });
    }

    const body = await req.json();
    const { items, totalAmount, shippingAddress } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("purchase");

    const newPurchase = {
      userEmail: session.user.email,
      userName: session.user.name,
      items,
      totalAmount,
      shippingAddress,
      status: "success",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newPurchase);

    return NextResponse.json({
      success: true,
      message: "Purchase stored successfully",
      purchaseId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error("[POST /api/purchase] Error:", error);
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const collection = db.collection("purchase");

    const isAdmin = (session.user as any).role === "admin";
    
    let query = {};
    if (!isAdmin) {
      // Regular users only see their own purchases
      query = { userEmail: session.user.email };
    }
    // Admin sees all (query is empty {})

    const purchases = await collection.find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("[GET /api/purchase] Error:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

