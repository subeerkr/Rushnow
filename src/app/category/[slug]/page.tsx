import { categories } from "../../../lib/products";
import ProductCard from "../../../components/ProductCard";
import AuthGuard from "../../../components/AuthGuard";
import { notFound } from "next/navigation";
import { products } from "../../../lib/products";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const cat = categories.find(c => c.slug === slug);
  if (!cat) return notFound();

  const filtered = products.filter(product => product.category === slug);

  return (
    <div className="space-y-8">
      <AuthGuard>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {cat.name}
          </h1>
          <p className="text-gray-600">
            Discover our fresh collection of {cat.name.toLowerCase()}
          </p>
        </div>
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </AuthGuard>
    </div>
  );
}
