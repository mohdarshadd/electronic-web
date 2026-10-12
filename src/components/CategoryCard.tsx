import Link from "next/link";
import type { Category } from "@/lib/types";
import { getCatalogProductsByCategory } from "@/lib/catalog";

export default function CategoryCard({ category }: { category: Category }) {
  const count = getCatalogProductsByCategory(category.slug).length;
  return (
    <Link
      href={`/category/${category.slug}`}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.imageHue} p-5 text-white shadow-soft ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25 transition duration-300 group-hover:opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.8) 0, transparent 45%)",
        }}
      />
      <span className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white/90 backdrop-blur transition duration-300 group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-gray-900">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
      <div className="relative flex h-full flex-col">
        <span className="text-3xl drop-shadow" aria-hidden>
          {category.emoji}
        </span>
        <h3 className="mt-4 text-lg font-bold leading-tight">{category.name}</h3>
        <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-white/80">{category.description}</p>
        <span className="mt-4 inline-flex items-center text-sm font-semibold text-white/90">
          {count} products
        </span>
      </div>
    </Link>
  );
}