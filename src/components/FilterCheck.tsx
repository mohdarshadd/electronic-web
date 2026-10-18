import type { ReactNode } from "react";
import { ShopLink } from "./ShopLink";

export function FilterCheck({
  href,
  checked,
  children,
}: {
  href: string;
  checked: boolean;
  children: ReactNode;
}) {
  return (
    <ShopLink
      href={href}
      aria-current={checked ? "true" : undefined}
      className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
        checked
          ? "bg-coral-50 font-semibold text-coral-700"
          : "text-navy-600 hover:bg-cream-100 hover:text-navy-900"
      }`}
    >
      <span
        aria-hidden
        className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${
          checked ? "border-navy-900 bg-navy-900 text-cream-100" : "border-navy-300 bg-white"
        }`}
      >
        {checked ? (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6l2.5 2.5L10 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span className="flex-1">{children}</span>
    </ShopLink>
  );
}
