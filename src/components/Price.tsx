import { calcDiscount, formatINR } from "@/lib/format";

export function Price({ price, mrp, size = "md" }: { price: number; mrp: number; size?: "sm" | "md" | "lg" }) {
  const discount = calcDiscount(price, mrp);
  const clamp = (v: string) => v;

  return (
    <div className={clamp("flex flex-wrap items-baseline gap-x-2 gap-y-0.5")}>
      <span className={`font-bold text-gray-900 ${size === "lg" ? "text-3xl" : size === "sm" ? "text-sm" : "text-lg"}`}>
        {formatINR(price)}
      </span>
      <span className={`text-gray-400 line-through ${size === "lg" ? "text-base" : size === "sm" ? "text-[11px]" : "text-sm"}`}>
        {formatINR(mrp)}
      </span>
      {discount > 0 && (
        <span
          className={`rounded-md bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700 ${
            size === "lg" ? "text-sm" : size === "sm" ? "text-[10px]" : "text-xs"
          }`}
        >
          {discount}% off
        </span>
      )}
    </div>
  );
}