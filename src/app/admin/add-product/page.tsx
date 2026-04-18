"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddProductAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  const [images, setImages] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const openWidget = () => {
    // @ts-ignore
    if (!window.cloudinary) {
      alert("Cloudinary widget not loaded. Check layout.tsx");
      return;
    }
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_UPLOAD_PRESET,
        multiple: true,
        maxFiles: 10,
        folder: "ecommerce-products",
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setImages((prev) => [...prev, result.info.secure_url]);
        }
      }
    );
    widget.open();
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) {
      alert("Please fill required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          unit,
          category,
          images,
        }),
      });
      if (res.ok) {
        alert("Product Created!");
        setName("");
        setPrice("");
        setCategory("");
        setImages([]);
        setDescription("");
        setUnit("");
      } else {
        const error = await res.json();
        alert("Error: " + (error.error || "Failed to create product"));
      }
    } catch (err) {
      alert("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Add New Product</h1>
          <Link href="/" className="text-sm font-medium text-purple-600 hover:text-purple-500">
            Back to Shop
          </Link>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Product Name *</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Red Apples"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Price (₹) *</label>
              <input
                required
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="120"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category *</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="fruits"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Unit</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="1 kg"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition h-32"
              placeholder="Fresh and juicy apples..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 block">Product Images</label>
            <div className="flex flex-wrap gap-4">
              {images.map((url) => (
                <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                  <img src={url} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setImages(images.filter(i => i !== url))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={openWidget}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-purple-400 hover:text-purple-500 transition"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs font-medium">Upload</span>
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition transform disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add Product to Inventory"}
          </button>
        </form>
      </div>
    </div>
  );
}
