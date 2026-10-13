export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-navy-900/5">
          <div className="aspect-square w-full bg-cream-100" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/2 rounded bg-cream-200" />
            <div className="h-4 w-full rounded bg-cream-200" />
            <div className="h-4 w-2/3 rounded bg-cream-200" />
          </div>
        </div>
      ))}
    </div>
  );
}