import Link from "next/link";
import type { Category } from "@/lib/types";
import { getProductsByCategory } from "@/lib/products";

export default function CategoryCard({ category }: { category: Category }) {
  const count = getProductsByCategory(category.slug).length;
  return (
    <Link
      href={`/category/${category.slug}`}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.imageHue} p-5 text-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25 transition group-hover:opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.8) 0, transparent 45%)",
        }}
      />
      <div className="relative flex h-full flex-col">
        <span className="text-3xl drop-shadow" aria-hidden>
          {category.emoji}
        </span>
        <h3 className="mt-4 text-lg font-bold leading-tight">{category.name}</h3>
        <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-white/80">{category.description}</p>
        <span className="mt-4 inline-flex items-center text-sm font-semibold text-white/90">
          {count} products
          <svg className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}