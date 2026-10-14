"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";

function ShopLinkContent({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span className={`inline-flex items-center gap-1.5 transition-opacity duration-150 ${pending ? "opacity-60" : ""}`}>
      {children}
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full bg-current transition-opacity duration-150 ${pending ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}

/**
 * next/link with an inline pending hint, used for shop filters so a click gives
 * immediate feedback while the server renders the filtered grid.
 */
export function ShopLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={`relative ${className ?? ""}`}>
      <ShopLinkContent>{children}</ShopLinkContent>
    </Link>
  );
}
