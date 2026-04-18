"use client";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  compact?: boolean;
}
export default function SearchBar({ compact }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const ctrl = new AbortController();
      fetch(`/api/products?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
          setActive(-1);
        })
        .catch(() => setLoading(false));
      return () => ctrl.abort();
    }, 250);
  }, [q]);

  const submitSearch = () => {
    if (active >= 0 && results[active]) {
      router.push(`/product/${results[active].id}`);
    } else if (q.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === "Enter") {
      submitSearch();
    } else if (e.key === "Escape") {
      setResults([]);
    }
  };

  const highlight = (name: string) => {
    const idx = name.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return name;
    return (
      <>
        {name.slice(0, idx)}
        <mark className="bg-yellow-200 text-gray-900 px-0.5 rounded">
          {name.slice(idx, idx + q.length)}
        </mark>
        {name.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className={`relative w-full ${compact ? "" : "max-w-xl mx-auto"}`}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKey}
        placeholder="Search products"
        className="w-full border rounded-lg px-4 py-2.5 text-sm bg-white shadow-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
      {loading && (
        <div className="absolute right-2 top-2 text-xs text-gray-400">…</div>
      )}
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full bg-white shadow rounded mt-1 max-h-72 overflow-y-auto text-sm z-30">
          {results.map((r, i) => (
            <button
              key={r.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => router.push(`/product/${r.id}`)}
              className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 ${
                active === i ? "bg-gray-100" : ""
              }`}
            >
              <img
                src={r.image}
                alt={r.name}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <p className="font-medium leading-tight line-clamp-2">
                  {highlight(r.name)}
                </p>
                <p className="text-xs text-gray-500">₹{r.price?.toFixed(2)}</p>
              </div>
            </button>
          ))}
          <div className="border-t text-xs p-2 flex justify-between bg-gray-50">
            <span>{results.length} results</span>
            <button
              className="text-purple-600"
              onClick={() => router.push(`/search?q=${encodeURIComponent(q)}`)}
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
