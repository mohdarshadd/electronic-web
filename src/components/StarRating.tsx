import type { SVGProps } from "react";

export function Star({ className = "h-4 w-4", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} {...props}>
      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.95a1 1 0 0 0 .95.69h4.17c.97 0 1.37 1.24.59 1.81l-3.37 2.45a1 1 0 0 0-.36 1.12l1.29 3.95c.3.92-.75 1.69-1.54 1.12l-3.37-2.45a1 1 0 0 0-1.17 0l-3.37 2.45c-.8.57-1.85-.2-1.54-1.12l1.28-3.95a1 1 0 0 0-.36-1.12L2.04 9.38c-.78-.57-.38-1.81.6-1.81h4.16a1 1 0 0 0 .95-.69l1.3-3.95Z" />
    </svg>
  );
}

export function StarRating({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? "" : "text-gray-200"}`} />
        ))}
      </span>
      <span className="text-xs font-semibold text-gray-900">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500">({reviewCount.toLocaleString("en-IN")})</span>
      )}
    </span>
  );
}