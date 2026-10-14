import ProductGridSkeleton from "@/components/ProductGridSkeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading search results">
      <div className="h-3 w-32 animate-pulse rounded bg-cream-200" />
      <div className="mt-4 h-7 w-64 animate-pulse rounded bg-cream-200" />
      <div className="mt-3 h-4 w-40 animate-pulse rounded bg-cream-200" />
      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
