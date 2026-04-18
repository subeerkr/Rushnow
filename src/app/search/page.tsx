import { products } from "../../lib/products";
import ProductCard from "../../components/ProductCard";
import AuthGuard from "../../components/AuthGuard";

interface Props {
  searchParams: { q?: string };
}

export default function SearchResultsPage({ searchParams }: Props) {
  const q = (searchParams.q || "").trim().toLowerCase();
  const filtered = q
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
    : [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Search Results{" "}
        {q && (
          <span className="text-base font-medium text-gray-500">for "{q}"</span>
        )}
      </h1>
      {q === "" && (
        <p className="text-sm text-gray-500">
          Type something in the search box above.
        </p>
      )}
      {q !== "" && filtered.length === 0 && (
        <p className="text-sm">No products found.</p>
      )}
      <AuthGuard>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </AuthGuard>
    </div>
  );
}
