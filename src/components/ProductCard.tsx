import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { product } from "../lib/products";

export default function ProductCard({ product }: { product: product }) {
  const imageSrc =
    product.image?.trim() ||
    "https://res.cloudinary.com/dehccrol4/image/upload/v1763832952/apple-colorful-vector-design_341269-1123_af1e0a.jpg";

  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow-md transition p-3 flex flex-col">
      <Link
        href={`/product/${product.id}`}
        className="block rounded-md overflow-hidden border border-gray-100 bg-gray-50 mb-3"
      >
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-36 object-cover"
          loading="lazy"
        />
      </Link>

      <Link href={`/product/${product.id}`} className="block">
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
      </Link>
      <p className="text-xs text-gray-500 mb-1">{product.unit}</p>
      <p className="font-semibold mb-2">₹{product.price.toFixed(2)}</p>
      <AddToCartButton product={product} small />
    </div>
  );
}
