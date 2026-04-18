"use client";
import { useCart, CartItem } from "../../context/CartContext";
import OrderModal from "../../components/OrderModal";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// OrderModal is a client component; static import ensures correct prop typing

export default function CartPage() {
  const {
    items,
    subtotal,
    deliveryFee,
    grandTotal,
    removeItem,
    increment,
    decrement,
    clear,
    totalItems,
  } = useCart();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-8 h-8 text-brand"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <div>
            <h1 className="text-2xl font-bold">Your Cart</h1>
            <p className="text-sm text-gray-500">
              {totalItems} item{totalItems === 1 ? "" : "s"} in your basket
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="text-sm text-red-600 font-semibold hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500">
          <svg
            className="w-24 h-24 mx-auto mb-4 text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <p className="text-lg font-medium text-gray-600 mb-2">
            Your cart is empty
          </p>
          <p className="text-sm">Browse categories to add some products.</p>
        </div>
      )}

      <ul className="space-y-4">
        {items.map((i: CartItem) => (
          <li
            key={i.id}
            className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 flex-1">
              <img
                src={i.image}
                alt={i.name}
                className="w-20 h-20 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">{i.name}</p>
                <p className="text-sm text-gray-500">
                  ₹{i.price.toFixed(2)} each
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => decrement(i.id)}
                    className="px-3 py-1 bg-gray-100 rounded"
                  >
                    -
                  </button>
                  <span className="font-semibold">{i.quantity}</span>
                  <button
                    onClick={() => increment(i.id)}
                    className="px-3 py-1 bg-gray-100 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between md:w-48">
              <p className="font-semibold">
                ₹{(i.quantity * i.price).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(i.id)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>
                {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-gray-100 pt-3">
              <span>Total payable</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (!session?.user) return router.push("/");
              setCheckoutOpen(true);
            }}
            className="mt-5 w-full px-4 py-3 bg-brand rounded-lg font-semibold"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* Keep checkout modal mounted even after cart is cleared so user sees tracking */}
      <OrderModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
