"use client";

import { useRouter } from "next/navigation";
import { useTransition, type FormEvent } from "react";
import { buildShopQuery, type ShopParams } from "@/lib/shop-query";

export function ShopPriceFilter({ basePath, params }: { basePath: string; params: ShopParams }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function apply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const min = String(form.get("min") ?? "").trim();
    const max = String(form.get("max") ?? "").trim();
    const href = `${basePath}${buildShopQuery({ ...params, min: min || undefined, max: max || undefined })}`;
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <form onSubmit={apply} className="mt-3 flex items-center gap-2">
      <input
        key={`min-${params.min ?? ""}`}
        name="min"
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="Min ₹"
        defaultValue={params.min || ""}
        className="w-full rounded-lg border border-navy-200 px-2.5 py-2 text-sm outline-none transition focus:border-coral-400 focus:bg-white focus:ring-4 focus:ring-coral-500/10"
      />
      <span className="text-navy-400">–</span>
      <input
        key={`max-${params.max ?? ""}`}
        name="max"
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="Max ₹"
        defaultValue={params.max || ""}
        className="w-full rounded-lg border border-navy-200 px-2.5 py-2 text-sm outline-none transition focus:border-coral-400 focus:bg-white focus:ring-4 focus:ring-coral-500/10"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy-900 px-3 py-2 text-sm font-semibold text-cream-100 transition hover:bg-navy-800 disabled:opacity-70"
      >
        {pending ? "…" : "Go"}
      </button>
    </form>
  );
}
