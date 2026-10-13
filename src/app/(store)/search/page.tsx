import { Suspense } from "react";
import Link from "next/link";
import { searchCatalog } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
export default function SearchPage(props: PageProps<"/search">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 text-navy-400">Searching…</div>}>
      <SearchResults searchParams={props.searchParams} />
    </Suspense>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) || "";
  const results = searchCatalog(q);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-navy-400">
        <Link href="/" className="hover:text-coral-700">Home</Link>
        <span>/</span>
        <span className="text-navy-600">Search</span>
      </nav>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
        {q ? (
          <>
            Results for “<span className="text-coral-700">{q}</span>”
          </>
        ) : (
          "Search products"
        )}
      </h1>
      <p className="mt-2 text-sm text-navy-500">
        {q ? `${results.length} product${results.length === 1 ? "" : "s"} found` : "Type in the search bar above to find sensors, boards, kits and more."}
      </p>

      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-navy-300 bg-white px-6 py-16 text-center">
          <span className="text-5xl">🔍</span>
          <p className="mt-4 text-lg font-bold text-navy-900">No matches for “{q}”</p>
          <p className="mt-1 text-sm text-navy-500">Check the spelling, or try searching “esp32”, “servo”, “oled”…</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["esp32", "servo", "oled", "robot kit", "sensor", "motor"].map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="rounded-full border border-navy-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy-700 shadow-soft transition hover:border-coral-300 hover:text-coral-700">
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}