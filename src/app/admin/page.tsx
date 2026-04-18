"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Purchase {
  _id: string;
  userEmail: string;
  userName: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "admin") {
      fetchPurchases();
    }
  }, [status, session]);

  const fetchPurchases = async () => {
    try {
      const res = await fetch("/api/purchase");
      if (res.ok) {
        const data = await res.json();
        setPurchases(data);
      }
    } catch (err) {
      console.error("Failed to fetch purchases", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Oversee all customer purchases and manage inventory.</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/add-product"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.02]"
          >
            + Add New Product
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition"
          >
            View Store
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Orders</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">{purchases.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <h2 className="text-3xl font-bold text-purple-600 mt-1">
            ₹{purchases.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0).toFixed(2)}
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Users</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            {new Set(purchases.map(p => p.userEmail)).size}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases.map((purchase) => (
                <tr key={purchase._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{purchase.userName}</span>
                      <span className="text-sm text-gray-500">{purchase.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">
                        {purchase.items?.length || 0} {purchase.items?.length === 1 ? "item" : "items"}
                      </span>
                      <div className="flex -space-x-2 mt-1 overflow-hidden">
                         {purchase.items?.slice(0, 3).map((item, idx) => (
                           <div key={idx} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold overflow-hidden" title={item.name}>
                             {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : (item.name?.charAt(0) || "?")}
                           </div>
                         ))}
                         {purchase.items?.length > 3 && (
                           <div className="w-6 h-6 rounded-full border-2 border-white bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">
                             +{purchase.items.length - 3}
                           </div>
                         )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    ₹{purchase.totalAmount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                      {purchase.status || "Completed"}
                    </span>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">🛍️</span>
                      <p className="font-medium">No purchases recorded yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
