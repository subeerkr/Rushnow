"use client";
import { products } from "../../../lib/products";
import { notFound } from "next/navigation";
import AddToCartButton from "../../../components/AddToCartButton";
import Link from "next/link";
import AuthGuard from "../../../components/AuthGuard";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    return notFound();
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <Link
          href="/"
          className="text-brand font-medium hover:underline flex items-center gap-2"
        >
          ← Back to home
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center p-4">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-brand uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-gray-500 mt-2">{product.unit}</p>
            </div>

            <div className="text-2xl font-bold text-gray-900">
              ₹{product.price.toFixed(2)}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold mb-3">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description ||
                  "Fresh and high-quality product delivered to your doorstep in minutes."}
              </p>
            </div>

            <div className="pt-6">
              <AddToCartButton product={product} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                <span className="block text-2xl mb-1">⏱️</span>
                <span className="text-xs font-semibold text-green-800 uppercase">
                  10 Min Delivery
                </span>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                <span className="block text-2xl mb-1">🛡️</span>
                <span className="text-xs font-semibold text-blue-800 uppercase">
                  Quality Assured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
