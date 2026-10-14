export default function ProductLoading() {
  return (
    <div aria-busy="true" aria-label="Loading product">
      <div className="border-b border-navy-900/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-3 w-56 animate-pulse rounded bg-cream-200" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="space-y-4">
            <div className="aspect-square w-full animate-pulse rounded-3xl bg-cream-200 shadow-soft" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-7 w-24 animate-pulse rounded-full bg-cream-200" />
              ))}
            </div>
          </div>

          <div>
            <div className="h-3 w-20 animate-pulse rounded bg-cream-200" />
            <div className="mt-3 h-8 w-4/5 animate-pulse rounded bg-cream-200" />
            <div className="mt-3 h-4 w-32 animate-pulse rounded bg-cream-200" />
            <div className="mt-5 space-y-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-navy-900/5 sm:p-6">
              <div className="h-9 w-40 animate-pulse rounded bg-cream-200" />
              <div className="h-4 w-56 animate-pulse rounded bg-cream-200" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-cream-200" />
            </div>
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 w-full animate-pulse rounded bg-cream-200" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="h-64 animate-pulse rounded-2xl bg-white shadow-soft ring-1 ring-navy-900/5" />
          <div className="h-64 animate-pulse rounded-2xl bg-white shadow-soft ring-1 ring-navy-900/5" />
        </div>
      </div>
    </div>
  );
}
