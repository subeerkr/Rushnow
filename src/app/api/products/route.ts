import { NextResponse } from "next/server";
import { getDb } from "../../../lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { products as localProducts } from "../../../lib/products";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() || "";

    const filteredProducts = query
      ? localProducts.filter((product) => {
          const q = query.toLowerCase();
          return (
            product.name.toLowerCase().includes(q) ||
            product.description.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q)
          );
        })
      : localProducts;

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error("[GET /api/products] Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { name, description, price, unit, category, images } = body;

    if (!name || !price || !unit || !category || !images?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("products");

    const newProduct = {
      name: String(name),
      description: String(description || ""),
      price: Number(price),
      unit: String(unit || ""),
      image: Array.isArray(images) && images.length ? String(images[0]) : "",
      category: String(category),
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newProduct);

    return NextResponse.json(
      { message: "Product created", product: { ...newProduct, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/products] Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

