import { getDb } from "./dbConnect";
import { ObjectId } from "mongodb";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  image?: string | null;
  role?: string;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    password: user.password,
    image: user.image,
    role: user.role || "user",
  };
}

export async function createUser(data: { name: string; email: string; password?: string }) {
  const db = await getDb();
  const userToInsert = {
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password,
    role: "user",
    createdAt: new Date(),
  };
  
  const result = await db.collection("users").insertOne(userToInsert);
  
  return {
    id: result.insertedId.toString(),
    ...userToInsert,
  };
}

export async function countUsers() {
  const db = await getDb();
  return await db.collection("users").countDocuments();
}

export default { findUserByEmail, createUser, countUsers };
