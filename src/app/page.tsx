import ProductCard from "../components/ProductCard";
import AuthGuard from "../components/AuthGuard";
import Link from "next/link";
import Carousel from "../components/Carousel";
import { products } from "../lib/products";

export default async function HomePage() {
  const featured = products.slice(0, 6);

  return (
    <div className="space-y-12 pb-12">
      {/* Homepage carousel */}
      <section>
        <Carousel
          images={[
            "https://res.cloudinary.com/dehccrol4/image/upload/v1764603501/21-03-2024-1711018043_am0ctu.webp",
            "https://res.cloudinary.com/dehccrol4/image/upload/v1764602946/1600w-q0IZ-XX8Bjk_hyjsvy.jpg",
            "https://res.cloudinary.com/dehccrol4/image/upload/v1764602685/10090286_onmdze.jpg",
            "https://res.cloudinary.com/dehccrol4/image/upload/v1764601872/8852975_igjeft.jpg",
          ]}
          interval={4000}
        />
      </section>

      {/* Categories removed */}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Fast Delivery,
                <br />
                Fresh Products
              </h1>
              <p className="text-lg mb-8 text-purple-100 max-w-lg">
                Get everything you need delivered to your doorstep in minutes.
                Fresh groceries, daily essentials, and more!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/category/fruits"
                  className="px-8 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🚚", label: "10 Min Delivery" },
                  { icon: "⭐", label: "5 Star Rated" },
                  { icon: "🛒", label: "Easy Ordering" },
                  { icon: "💳", label: "Secure Payment" },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all"
                  >
                    <div className="text-4xl mb-3">{f.icon}</div>
                    <p className="text-sm font-bold tracking-tight">
                      {f.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Products
          </h2>
          <Link
            href="/category/fruits"
            className="text-purple-600 font-semibold text-sm hover:underline"
          >
            View All →
          </Link>
        </div>
        <AuthGuard>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </AuthGuard>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: "🚚",
            title: "Fast Delivery",
            desc: "Get your orders delivered in minutes, not hours.",
          },
          {
            icon: "✨",
            title: "Fresh Products",
            desc: "Only the freshest products, handpicked for you.",
          },
          {
            icon: "💰",
            title: "Best Prices",
            desc: "Competitive prices with great deals every day.",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
              {f.icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
