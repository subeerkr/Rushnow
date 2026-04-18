import { getDb } from "./src/lib/dbConnect";
import { products } from "./src/lib/products";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  try {
    const db = await getDb();
    const collection = db.collection("products");

    // Clear existing products
    await collection.deleteMany({});

    // transform products to use _id if needed or just insert
    const productsToInsert = products.map(p => ({
      ...p,
      _id: undefined, // let mongodb generate one or use current id as string
      originalId: p.id
    }));

    await collection.insertMany(productsToInsert);
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
