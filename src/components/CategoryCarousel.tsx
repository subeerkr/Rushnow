import Link from "next/link";
import { Category } from "../lib/products";

export default function CategoryCarousel({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <div className="overflow-x-auto whitespace-nowrap scrollbar-thin pb-2">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/category/${c.slug}`}
          className="inline-flex flex-col items-center w-30 mr-4"
        >
          <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center text-sm font-semibold mb-2 shadow">
            {c.name.split(" ")[0]}
          </div>
          <span className="text-xs font-medium text-gray-700">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
