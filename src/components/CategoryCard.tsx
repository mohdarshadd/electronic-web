import Link from "next/link";
import type { Category } from "@/lib/types";
import { getCatalogProductsByCategory } from "@/lib/catalog";
import { categoryIcon } from "@/lib/icons";
import { Icon } from "./Icon";

export default function CategoryCard({ category }: { category: Category }) {
  const count = getCatalogProductsByCategory(category.slug).length;
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-coral-400 via-coral-500 to-coral-600 p-5 text-navy-950 shadow-soft ring-1 ring-coral-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25 transition duration-300 group-hover:opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.8) 0, transparent 45%)",
        }}
      />
      <span className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-navy-950/10 text-navy-950 backdrop-blur transition duration-300 group-hover:translate-x-0.5 group-hover:bg-navy-950 group-hover:text-cream-100">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
      <div className="relative flex h-full flex-col">
        <span className="text-navy-950/90 drop-shadow" aria-hidden>
          <Icon name={categoryIcon(category.slug)} size={32} strokeWidth={1.6} />
        </span>
        <h3 className="mt-4 text-lg font-bold leading-tight">{category.name}</h3>
        <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-navy-950/75">{category.description}</p>
        <span className="mt-4 inline-flex w-fit items-center rounded-full bg-navy-950/10 px-2.5 py-1 text-xs font-bold text-navy-950">
          {count} products
        </span>
      </div>
    </Link>
  );
}