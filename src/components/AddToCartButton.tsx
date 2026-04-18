"use client";
import { useCart } from "../context/CartContext";
import { Product } from "../lib/products";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({
  product,
  small,
}: {
  product: Product;
  small?: boolean;
}) {
  const { addItem, getItem, decrement, increment } = useCart();
  const existing = getItem(product.id);
  const { data: session } = useSession();
  const router = useRouter();

  const onDecrease = () => {
    if (!session?.user) return router.push("/");
    if (!existing) return;
    decrement(existing.id);
  };

  const onIncrease = () => {
    if (!session?.user) return router.push("/");
    if (existing) {
      increment(existing.id);
    } else {
      addItem(product);
    }
  };

  if (existing) {
    return (
      <div
        className={`inline-flex items-center rounded bg-brand text-white font-semibold justify-between ${
          small
            ? "text-xs px-2 py-1 w-full sm:w-28"
            : "text-sm px-2 py-1 w-full md:w-auto"
        }`}
      >
        <button
          onClick={onDecrease}
          aria-label={`Decrease quantity of ${product.name}`}
          className={`px-2 ${small ? "text-sm" : "text-base"}`}
        >
          -
        </button>
        <div className="flex-1 text-center">{existing.quantity}</div>
        <button
          onClick={onIncrease}
          aria-label={`Increase quantity of ${product.name}`}
          className={`px-2 ${small ? "text-sm" : "text-base"}`}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (!session?.user) return router.push("/");
        addItem(product);
      }}
      className={`rounded ${
        small ? "text-xs px-2 py-1" : "px-4 py-2"
      } bg-brand font-semibold w-full`}
    >
      Add
    </button>
  );
}
