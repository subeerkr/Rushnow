"use client";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CartSidebar() {
  const {
    items,
    subtotal,
    deliveryFee,
    grandTotal,
    totalItems,
    removeItem,
    increment,
    decrement,
  } = useCart();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const safeDecrement = (id: string) => {
    if (!session?.user) return router.push("/");
    decrement(id);
  };

  const safeIncrement = (id: string) => {
    if (!session?.user) return router.push("/");
    increment(id);
  };

  const safeRemove = (id: string) => {
    if (!session?.user) return router.push("/");
    removeItem(id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOpen(o => !o)}
        className="px-4 py-3 rounded-full bg-brand shadow font-semibold flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
        Cart ({totalItems})
      </button>

      {open && (
        <div className="absolute left-0 right-0 bottom-0 sm:bottom-16 sm:right-0 sm:left-auto sm:w-96 max-h-[70vh] overflow-y-auto bg-white rounded-t-lg sm:rounded-lg shadow-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <svg
                className="w-5 h-5 text-brand"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              Cart ({totalItems})
            </h3>
            {subtotal > 0 && (
              <p className="text-xs text-gray-500">
                ₹{(499 - subtotal > 0 ? 499 - subtotal : 0).toFixed(0)} away
                from free delivery
              </p>
            )}
          </div>
          {items.length === 0 && (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          )}

          <ul className="space-y-3">
            {items.map(i => (
              <li
                key={i.id}
                className="flex gap-3 items-start text-sm border border-gray-100 rounded-lg p-2"
              >
                <img
                  src={i.image}
                  alt={i.name}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-medium line-clamp-2">{i.name}</p>
                  <p className="text-xs text-gray-500">
                    ₹{i.price.toFixed(2)} × {i.quantity}
                  </p>
                  <div className="mt-2 inline-flex items-center rounded bg-brand text-white font-semibold w-28 justify-between">
                    <button
                      onClick={() => safeDecrement(i.id)}
                      aria-label={`Decrease quantity of ${i.name}`}
                      className="px-2"
                    >
                      -
                    </button>
                    <div className="px-2 text-center">{i.quantity}</div>
                    <button
                      onClick={() => safeIncrement(i.id)}
                      aria-label={`Increase quantity of ${i.name}`}
                      className="px-2"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => safeRemove(i.id)}
                  className="text-red-600 text-xs uppercase tracking-wide"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          {items.length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>
                  {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() =>
                  session?.user ? router.push("/cart") : router.push("/")
                }
                className="block text-center w-full bg-brand rounded py-2 font-semibold"
              >
                Review Cart
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
